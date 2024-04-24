import { createReadStream, createWriteStream } from "fs";
import { decryptData } from "./decryptData.js";

/**
 * Asynchronously decrypts a file and writes the decrypted data to an output file.
 *
 * @param {string} inputFilePath - The path of the input file to be decrypted.
 * @param {string} outputFilePath - The path of the output file where the decrypted data will be written.
 * @param {string} password - The password used for decryption.
 * @param {string} salt - The salt used for decryption.
 * @param {string} iv - The initialization vector used for decryption.
 * @return {Promise<string>} A Promise that resolves with the message "Decryption complete." when the decryption is successful, or rejects with an error if any error occurs during the decryption process.
 */
async function decryptFile(inputFilePath, outputFilePath, password, salt, iv) {
  const decipher = decryptData(
    password,
    Buffer.from(salt, "hex"),
    Buffer.from(iv, "hex")
  );
  const input = createReadStream(inputFilePath);
  const output = createWriteStream(outputFilePath);

  input.pipe(decipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => resolve("Decryption complete."));
    output.on("error", reject);
  });
}

export { decryptFile };
