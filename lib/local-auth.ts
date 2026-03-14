import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SALT_LENGTH = 16;
const LOCAL_TOKEN_BYTES = 32;
const LOCAL_TOKEN_TTL_DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_LENGTH).toString("hex");
  const derived = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const expectedHash = Buffer.from(hash, "hex");
  const actualHash = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  if (expectedHash.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}

export function generateLocalAuthToken() {
  return randomBytes(LOCAL_TOKEN_BYTES).toString("base64url");
}

export function hashLocalAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createLocalAuthTokenMetadata() {
  const token = generateLocalAuthToken();
  const tokenHash = hashLocalAuthToken(token);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + LOCAL_TOKEN_TTL_DAYS);

  return { token, tokenHash, issuedAt, expiresAt };
}
