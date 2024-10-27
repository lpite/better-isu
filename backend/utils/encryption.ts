import crypto, {
  createCipheriv,
  createDecipheriv,
  scryptSync,
} from "node:crypto";

export function encryptText(text: string, password: string) {
  const key = scryptSync(password, "salt", 32);
  const iv = Buffer.alloc(16, 0);
  const cipher = createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptText(text: string, password: string) {
  const iv = Buffer.alloc(16, 0);

  const key = scryptSync(password, "salt", 32);

  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
