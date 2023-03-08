import { pbkdf2, createCipheriv, createDecipheriv, randomBytes } from "crypto";

export function hashPassword(password: string) {
  return new Promise<{ hash: string; salt: string }>((resolve, reject) => {
    const salt = randomBytes(32);

    pbkdf2(password, salt, 10000, 512, "sha512", (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve({ hash: key.toString("base64"), salt: salt.toString("base64") });
      }
    });
  });
}

export function verifyPassword(hash: string, salt: string, password: string) {
  return new Promise<boolean>((resolve, reject) => {
    pbkdf2(password, Buffer.from(salt, "base64"), 10000, 512, "sha512", (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key.toString("base64") === hash);
      }
    });
  });
}

export interface CiphertextBundle {
  salt: string;
  iv: string;
  tag: string;
  ciphertext: string;
}

function getEncryptionKey(secret: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    pbkdf2(secret, salt, 10000, 32, "sha512", (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });
}

export async function encrypt(plaintext: string, secret: string): Promise<CiphertextBundle> {
  const salt = randomBytes(64);

  const key = await getEncryptionKey(secret, salt);

  const iv = randomBytes(16);

  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  const tag = cipher.getAuthTag();

  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export async function decrypt(ciphertextBundle: CiphertextBundle, secret: string): Promise<{ plaintext: string }> {
  const salt = Buffer.from(ciphertextBundle.salt, "base64");
  const iv = Buffer.from(ciphertextBundle.iv, "base64");
  const tag = Buffer.from(ciphertextBundle.tag, "base64");

  const ciphertext = Buffer.from(ciphertextBundle.ciphertext, "base64");

  const key = await getEncryptionKey(secret, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(tag);

  return { plaintext: decipher.update(ciphertext) + decipher.final("utf8") };
}

export function getPrivateKeyWithoutPrefix(privateKey: string) {
  if (privateKey.length === 64) {
    return privateKey;
  }

  if (privateKey.length === 66 && privateKey.startsWith("0x")) {
    return privateKey.slice(2);
  }

  throw new Error(`Invalid private key provided. Unsupported length ${privateKey.length}`);
}
