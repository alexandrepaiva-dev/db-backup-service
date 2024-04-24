import { promises as fs } from "fs";
import { join } from "path";
import { execShellCommand } from "./utils/execShellCommand.js";
import { saveEncryptedData } from "./utils/saveEncryptedData.js";
import { cleanupOldBackupsS3, uploadToS3 } from "./services/s3Service.js";
import { sendEmail } from "./utils/sendEmail.js";
import { ensureDirectoryExists } from "./utils/ensureDirectoryExists.js";
import dotenv from "dotenv";

dotenv.config();

async function backupDatabase() {
  const startTime = new Date();
  let message = "";
  let success = true;
  const tempDumpDir = "/tmp";
  const pg_dump_filename = "pg-backup.dump";
  const dumpFilePath = join(tempDumpDir, pg_dump_filename);
  const encryptedFilePath = dumpFilePath + ".enc";
  const pgDumpCommand = `pg_dump -Fc "postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}" > ${dumpFilePath}`;

  try {
    await ensureDirectoryExists(tempDumpDir);
    await execShellCommand(pgDumpCommand);
    console.log("Database backup successfully created.");
    message += "Database backup successfully created.\n";

    await saveEncryptedData(
      dumpFilePath,
      encryptedFilePath,
      process.env.ENCRYPTION_PASSWORD
    );
    console.log("Backup successfully encrypted and saved.");
    message += "Backup successfully encrypted and saved.\n";

    const fileContent = await fs.readFile(encryptedFilePath);
    const date = new Date();
    const key = `${process.env.S3_STORAGE_ROOT_PATH}/${date.getFullYear()}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}-${date
      .getHours()
      .toString()
      .padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}-${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}-${pg_dump_filename}.enc`;
    await uploadToS3(process.env.S3_STORAGE_BUCKET_NAME, key, fileContent);
    console.log("Backup successfully uploaded to S3.");
    message += `Backup successfully uploaded with key: ${key}\n`;

    await cleanupOldBackupsS3(
      process.env.S3_STORAGE_BUCKET_NAME,
      process.env.S3_STORAGE_ROOT_PATH,
      process.env.MAX_BACKUP_FILES
    );
    console.log("Old backups cleanup complete.");
    message += "Old backups cleanup complete.\n";
  } catch (error) {
    console.error("Failed to backup database:", error);
    message += `Failed to backup database: ${error.message}\n`;
    success = false;
  } finally {
    await Promise.all([
      fs
        .unlink(dumpFilePath)
        .catch((e) => console.error("Failed to delete dump file:", e)),
      fs
        .unlink(encryptedFilePath)
        .catch((e) => console.error("Failed to delete encrypted file:", e)),
    ]);

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000; // Duration in seconds
    message += `Total process time: ${duration} seconds.\n`;

    const emailSubject = `Backup Process Summary - ${
      success ? "Success" : "Failure"
    }`;
    const emailSetting = process.env.EMAIL_NOTIFICATION_SETTING || "ALL";
    if (
      emailSetting === "ALL" ||
      (emailSetting === "SUCCESS" && success) ||
      (emailSetting === "FAILURE" && !success)
    ) {
      await sendEmail(emailSubject, message);
    }
  }
}

export { backupDatabase };
