import crypto, { createHmac } from "node:crypto";
import { SupportedCiphers, Transport } from "../types";

// //////////////////////////////////////////////////
// Notes about encoding in this file
// - if text is from the user, it's assumed utf-8 in & out
// - keys are hashed into binary strings of sufficient bit length
// - all other values are base64 for portabiity
// //////////////////////////////////////////////////

type EncodeResult = {
  transport: Transport;
  text: string;
};

/** Convert a UTF-8 string into a valid hash key of the matching hash length */
const strToKey = (str: string, cipher: SupportedCiphers): Buffer => {
  const info = hashMap[cipher] ?? null;
  if (!info) {
    return Buffer.from("");
  }

  return crypto.createHash(info).update(Buffer.from(str)).digest();
};

/**
 * Get the cipher info given a supported cipher
 * @deprecated To be removed once Node 16 lts is lowest supported version
 * @param name A cipher name
 * @returns An object containing the cipher's info
 */
const getCipherInfo = (name: SupportedCiphers) => {
  const cipherInfo: {
    [cipher in SupportedCiphers]?: {
      mode: string;
      name: string;
      nid: number;
      ivLength: number;
      keyLength: number;
    };
  } = {
    "aes-256-gcm": {
      mode: "gcm",
      name: "id-aes-256-gcm",
      nid: 901,
      ivLength: 12,
      keyLength: 32,
    },
  };

  return cipherInfo[name];
};

/** For any given cipher we support, there is a hash that will generate a key of proper bit length from a string */
const hashMap: {
  [cipher in SupportedCiphers]: string;
} = {
  none: "",
  "aes-256-gcm": "sha256",
};

/** Sign a string against a secret token */
export const sign = (input: string, secret: string): string => {
  return createHmac("sha256", secret).update(input).digest("base64");
};

/** Verify a string against a set of secret tokens */
export const verify = (
  input: string,
  secrets: string[],
  signature: string
): boolean => {
  for (const s of secrets) {
    if (!s) continue;
    const sig = sign(input, s);
    if (sig === signature) {
      return true;
    }
  }
  return false;
};

/**
 * Encode an object by placing it into a stringified JSON object and ciphering
 * By using a JSON object, we ensure that whatever we encode can be JSON parsed
 * later.
 * @param obj
 * @param secret
 * @returns
 */
export const encode = <T>(obj: T, secret?: string): EncodeResult => {
  const algo = "aes-256-gcm";
  const info = getCipherInfo(algo);
  const str = JSON.stringify({
    envelope: obj,
  });

  if (!info) {
    throw new Error("Unknown algo: " + algo);
  }

  if (!secret) {
    return {
      transport: {
        ev: 1,
        alg: "none",
      },
      text: str,
    };
  }

  const key = strToKey(secret, algo);
  const iv = crypto.randomBytes(info.ivLength);
  const authTagLength = 16;

  const cipher = crypto.createCipheriv(algo, key, iv, {
    authTagLength,
  });
  const ciphered = Buffer.concat([cipher.update(str, "utf-8"), cipher.final()]);

  return {
    transport: {
      ev: 1,
      alg: algo,
      atl: authTagLength,
      at: cipher.getAuthTag().toString("base64"),
      iv: iv.toString("base64"),
    },
    text: ciphered.toString("base64"),
  };
};

/** Decodes a single string to JSON and removes the payload from the envelope key */
const decodeOne = (
  text: string,
  transport: Transport,
  secret: string
): string => {
  const algo = transport.alg;
  if (algo === "none") {
    return text;
  }

  const key = strToKey(secret, algo);

  const decipher = crypto.createDecipheriv(
    algo,
    key,
    Buffer.from(transport.iv, "base64"),
    {
      authTagLength: transport.atl,
    }
  );
  decipher.setAuthTag(Buffer.from(transport.at, "base64"));

  const deciphered = Buffer.concat([
    decipher.update(text, "base64"),
    decipher.final(),
  ]).toString();
  return deciphered;
};

/**
 * Decode an object from an encrypted string through one or more keys.
 * An array of possible secrets allows old keys to be rotated away if needed
 * @param str
 * @param secrets
 * @returns
 */
export const decode = <T>(
  text: string,
  transport: Transport,
  secrets: (string | undefined)[]
): T => {
  if (transport.alg === "none") {
    return JSON.parse(text)?.envelope as T;
  }

  for (const secret of secrets) {
    if (typeof secret === "undefined") {
      continue;
    }
    try {
      // break on success
      const result = decodeOne(text, transport, secret);
      return JSON.parse(result)?.envelope as T;
    } catch (e) {
      // ignore failures
    }
  }

  // no keys worked
  throw new Error("No valid decryption keys found");
};
