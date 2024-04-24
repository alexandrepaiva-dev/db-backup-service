import { randomBytes, createCipheriv, pbkdf2Sync } from "crypto";

/**
 * Encrypts the given password using AES-256-CBC encryption.
 *
 * @param {string} password - The password to be encrypted.
 * @return {object} An object containing the cipher, initialization vector (iv), and salt.
 */
function encryptData(password) {
  const salt = randomBytes(16); // Generates a new salt for each encryption
  const key = pbkdf2Sync(password, salt, 100000, 32, "sha512"); // Uses PBKDF2 to derive a key
  const iv = randomBytes(16); // Generates a new IV for each encryption
  const cipher = createCipheriv("aes-256-cbc", key, iv); // Creates a cipher instance with the key and IV
  return { cipher, iv, salt }; // Returns cipher, IV, and salt
}

export { encryptData };
