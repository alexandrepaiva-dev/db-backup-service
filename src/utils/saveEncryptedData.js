import { createReadStream, createWriteStream } from "fs";
import { encryptData } from "./encryptData.js";

/**
 * Asynchronously saves encrypted data from an input file to an output file using a given password.
 *
 * @param {string} inputFilePath - The path of the input file to read from.
 * @param {string} outputFilePath - The path of the output file to write to.
 * @param {string} password - The password to use for encryption.
 * @return {Promise<void>} A promise that resolves when the encryption and writing is complete, or rejects if an error occurs.
 */
async function saveEncryptedData(inputFilePath, outputFilePath, password) {
  const { cipher, iv, salt } = encryptData(password);
  const input = createReadStream(inputFilePath);
  const output = createWriteStream(outputFilePath);

  // Write salt and IV as hexadecimal strings to the output file before the encrypted data
  output.write(salt.toString("hex") + iv.toString("hex"));

  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

export { saveEncryptedData };
