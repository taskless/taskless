import crypto from "crypto";

const algo = "aes-256-gcm";
const ENCODING = "utf-8";
const ivLen = 16;

const secretToKey = (secret: string) => {
  const hash = crypto.createHash("sha1");
  hash.update(secret);
  const key = hash.digest().slice(0, ivLen);
  return key;
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
  const str = JSON.stringify({
    envelope: obj,
  });

  if (!secret) {
    console.warn("No secret was provided. Data sent will not be encrypted");
    return str;
  }

  const iv = crypto.randomBytes(ivLen);
  const key = secretToKey(secret);

  const cipher = crypto.createCipheriv(algo, key, iv);
  const ciphered = Buffer.concat([
    cipher.update(str, ENCODING),
    cipher.final(),
  ]).toString(ENCODING);
  return iv.toString(ENCODING) + ":" + cipher.getAuthTag() + ":" + ciphered;
};

/** Decodes a single string to JSON and removes the payload from the envelope key */
const decodeOne = <T>(str: string, secret: string): T => {
  const components = str.split(":");
  const rawIv = components.shift();
  const authTag = components.shift();

  if (!rawIv || !authTag) {
    throw new Error("Malformed message");
  }

  const iv = Buffer.from(rawIv, ENCODING);
  const key = secretToKey(secret);

  const decipher = crypto.createDecipheriv(algo, key, iv);
  decipher.setAuthTag(Buffer.from(authTag));

  const deciphered = Buffer.concat([
    decipher.update(components.join(":"), ENCODING),
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
