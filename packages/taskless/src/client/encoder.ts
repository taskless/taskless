import crypto from "crypto";

// //////////////////////////////////////////////////
// Notes about encoding in this file
// - if text is from the user, it's assumed utf-8 in & out
// - keys are hashed into binary strings of sufficient bit length
// - all other values are base64 for portabiity
// //////////////////////////////////////////////////

/** Convert a UTF-8 string into a valid hash key of the matching hash length */
const strToKey = (str: string, cipher: SupportedCiphers) => {
  return crypto.createHash(hashMap[cipher]).update(Buffer.from(str)).digest();
};

/** Supported ciphers have iv lengths as well as a matching hash function of equal bits */
type SupportedCiphers = "aes-256-gcm";

// goes away once node 16 is lowest supported lts for crypto.getCipherInfo
const cipherInfo: {
  [cipher in SupportedCiphers]: {
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

/** For any given cipher, there is a hash that will generate a key of proper bit length from a string */
const hashMap: {
  [cipher in SupportedCiphers]: string;
} = {
  "aes-256-gcm": "sha256",
};

/** Get the cipher info from node (or local hash), throws if not available */
const getCipherInfo = (name: SupportedCiphers) => {
  return cipherInfo[name];
};

/**
 * Encode an object by placing it into a stringified JSON object and ciphering
 * By using a JSON object, we ensure that whatever we encode can be JSON parsed
 * later.
 * @param obj
 * @param secret
 * @returns
 */
export const encode = (obj: unknown, secret?: string) => {
  const algo = "aes-256-gcm";
  const info = getCipherInfo(algo);
  const str = JSON.stringify({
    envelope: obj,
  });

  if (!secret) {
    console.warn("No secret was provided. Data sent will not be encrypted");
    return str;
  }

  const key = strToKey(secret, algo);
  const iv = crypto.randomBytes(info.ivLength);

  const cipher = crypto.createCipheriv(algo, key, iv, {
    authTagLength: 16,
  });
  const ciphered = Buffer.concat([cipher.update(str, "utf-8"), cipher.final()]);

  const packed: Packed = [
    "v1",
    algo,
    "16",
    cipher.getAuthTag().toString("base64"),
    iv.toString("base64"),
    ciphered.toString("base64"),
  ];

  return packed.join(":");
};

/** A version identifier for packed strings */
type Version = string;

/** The length of the Auth Tag */
type AuthTagLength = string;

/** The auth tag */
type AuthTag = string;

/** The IV for the cipher */
type IV = string;

/** Encrypted text */
type Ciphertext = string;

/** An array of values representing an encrypted payload */
type Packed = [
  Version,
  SupportedCiphers,
  AuthTagLength,
  AuthTag,
  IV,
  Ciphertext
];

/** Typeguard: Ensures the array confirms to the Packed object of COUNT strings */
function isPacked(arr: unknown): arr is Packed {
  const COUNT = 6;
  if (!Array.isArray(arr) || arr.length !== COUNT) {
    return false;
  }
  if (arr.map((v) => typeof v === "string").filter((t) => t).length !== COUNT) {
    return false;
  }
  return true;
}

/** Decodes a single string to JSON and removes the payload from the envelope key */
const decodeOne = <T>(str: string, secret: string): T => {
  const parts = str.split(":");
  if (!isPacked(parts)) {
    throw new Error("Malformed string");
  }
  const [version, algo, authTagLength, authTag, iv, ciphered]: Packed = parts;

  if (!Object.getOwnPropertyNames(hashMap).includes(algo)) {
    throw new Error("Incompatible cipher: " + algo);
  }

  if (version !== "v1") {
    throw new Error("Incompatible encoder version: " + version);
  }

  const key = strToKey(secret, algo);

  const decipher = crypto.createDecipheriv(
    algo,
    key,
    Buffer.from(iv, "base64"),
    {
      authTagLength: parseInt(authTagLength, 10),
    }
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const deciphered = Buffer.concat([
    decipher.update(ciphered, "base64"),
    decipher.final(),
  ]).toString();
  return JSON.parse(deciphered)?.envelope;
};

/**
 * Decode an object from an encrypted string through one or more keys.
 * An array of possible secrets allows old keys to be rotated away if needed
 * @param str
 * @param secrets
 * @returns
 */
export const decode = <T>(str: string, secrets: (string | undefined)[]): T => {
  let result: T | undefined;
  for (const secret of secrets) {
    if (typeof secret === "undefined") {
      continue;
    }
    try {
      // break on success
      result = decodeOne<T>(str, secret);
      break;
    } catch (e) {
      result = undefined;
    }
  }
  if (typeof result === "undefined") {
    try {
      result = JSON.parse(str)?.envelope as T;
    } catch (e) {
      throw new Error("No valid decryption keys found");
    }
  }
  return result;
};
