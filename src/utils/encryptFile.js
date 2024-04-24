import { createReadStream, createWriteStream } from "fs";
import { encryptData } from "./encryptData.js";

/**
 * Asynchronously encrypts a file using a given password and writes the encrypted data to an output file.
 *
 * @param {string} inputFilePath - The path of the input file to be encrypted.
 * @param {string} outputFilePath - The path of the output file where the encrypted data will be written.
 * @param {string} password - The password used for encryption.
 * @return {Promise<{iv: Buffer}>} A Promise that resolves with an object containing the initialization vector (iv) used for encryption.
 */
async function encryptFile(inputFilePath, outputFilePath, password) {
  const { cipher, iv } = encryptData(password);
  const input = createReadStream(inputFilePath);
  const output = createWriteStream(outputFilePath);

  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", () => resolve({ iv }));
    output.on("error", reject);
  });
}

export { encryptData, encryptFile };
