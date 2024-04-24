import { exec } from "child_process";

/**
 * Executes a shell command and returns a Promise that resolves with the command's output or rejects with an error or stderr.
 *
 * @param {string} cmd - The shell command to execute.
 * @return {Promise<string>} A Promise that resolves with the command's output or rejects with an error or stderr.
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export { execShellCommand };
