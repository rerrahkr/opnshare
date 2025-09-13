import {
  createCipheriv,
  createDecipheriv,
  createSecretKey,
  randomBytes,
} from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

const ALGORITHM = "aes-256-gcm";
const secretKey = createSecretKey(
  new Uint8Array(Buffer.from(ENCRYPTION_KEY, "hex"))
);

export function encryptObject(data: object): string {
  const iv = new Uint8Array(randomBytes(12));
  const cipher = createCipheriv(ALGORITHM, secretKey, iv);

  const jsonString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);

  const encrypted = new Uint8Array(cipher.update(encodedData));
  const final = new Uint8Array(cipher.final());
  const authTag = new Uint8Array(cipher.getAuthTag());

  const combined = new Uint8Array(
    iv.length + authTag.length + encrypted.length + final.length
  );
  combined.set(iv, 0);
  combined.set(authTag, iv.length);
  combined.set(encrypted, iv.length + authTag.length);
  combined.set(final, iv.length + authTag.length + encrypted.length);

  return Buffer.from(combined).toString("base64url");
}

export function decryptObject<T extends object>(token: string): T {
  const buf = new Uint8Array(Buffer.from(token, "base64url"));
  const iv = buf.slice(0, 12);
  const authTag = buf.slice(12, 28);
  const encrypted = buf.slice(28);

  const decipher = createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(authTag);

  const decryptedPart1 = new Uint8Array(decipher.update(encrypted));
  const decryptedPart2 = new Uint8Array(decipher.final());

  const decrypted = new Uint8Array(
    decryptedPart1.length + decryptedPart2.length
  );
  decrypted.set(decryptedPart1, 0);
  decrypted.set(decryptedPart2, decryptedPart1.length);

  const jsonString = new TextDecoder().decode(decrypted);
  return JSON.parse(jsonString) as T;
}
