import { promises as fs } from "fs";

/**
 * Ensure the specified directory exists, create it if it does not.
 * @param {string} dirPath Path of the directory to check and create.
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath); // Try accessing the directory to check if it exists
  } catch {
    await fs.mkdir(dirPath, { recursive: true }); // If it doesn't exist, create it
  }
}

export { ensureDirectoryExists };
