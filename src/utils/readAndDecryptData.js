import { createReadStream, createWriteStream } from "fs";
import { decryptData } from "./decryptData.js";

/**
 * Asynchronously reads an encrypted file from the given `encryptedFilePath` and decrypts it using the provided `password`.
 * The decrypted data is written to the `outputFilePath`.
 *
 * @param {string} encryptedFilePath - The path of the encrypted file to read from.
 * @param {string} outputFilePath - The path of the file to write the decrypted data to.
 * @param {string} password - The password used for decryption.
 * @return {Promise<string>} A promise that resolves with the message "Decryption complete." when the decryption is successful,
 * or rejects with an error if any error occurs during the decryption process.
 */
async function readAndDecryptData(encryptedFilePath, outputFilePath, password) {
  const input = createReadStream(encryptedFilePath);
  const output = createWriteStream(outputFilePath);

  // Read salt and IV from the file first
  let buffer = Buffer.alloc(64); // Adjust size based on your salt and IV length
  await new Promise((resolve, reject) =>
    input.read(buffer.length, (err) => (err ? reject(err) : resolve()))
  );

  const salt = Buffer.from(buffer.slice(0, 32), "hex"); // Assuming 32 bytes for salt in hex
  const iv = Buffer.from(buffer.slice(32, 64), "hex"); // Assuming 32 bytes for IV in hex
  const decipher = decryptData(password, salt, iv);

  input.pipe(decipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => resolve("Decryption complete."));
    output.on("error", reject);
  });
}

export { readAndDecryptData };
