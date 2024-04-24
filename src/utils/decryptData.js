import { createDecipheriv, pbkdf2Sync } from "crypto";

/**
 * Decrypts the given data using AES-256-CBC encryption.
 *
 * @param {string} password - The password used for decryption.
 * @param {Buffer} salt - The salt used for decryption.
 * @param {Buffer} iv - The initialization vector used for decryption.
 * @return {Cipher} The decipher object used for decryption.
 */
function decryptData(password, salt, iv) {
  const key = pbkdf2Sync(password, salt, 100000, 32, "sha512"); // Same parameters as the encryption
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return decipher;
}

export { decryptData };
