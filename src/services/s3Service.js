import s3 from "../config/s3Config.js";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

/**
 * Uploads a file to an S3 bucket.
 *
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key of the file in the S3 bucket.
 * @param {Buffer|TypedArray|Blob|string|ReadableStream} body - The content of the file to be uploaded.
 * @return {Promise<Object>} A promise that resolves to the response object from the S3 API.
 */
async function uploadToS3(bucketName, key, body) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
  });

  return await s3.send(command);
}

/**
 * Cleans up old backups in an S3 bucket, keeping only a specified maximum number of files within a specified directory.
 *
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} prefix - The directory prefix of the files in the S3 bucket.
 * @param {number} maxFiles - The maximum number of files to retain in the bucket.
 */
async function cleanupOldBackupsS3(bucketName, prefix, maxFiles) {
  try {
    if (!prefix.endsWith("/")) {
      prefix += "/";
    }

    const listParams = {
      Bucket: bucketName,
      Prefix: prefix, // Filter objects to those starting with this prefix (directory)
    };

    let fileList = [];
    let listResp;

    do {
      listResp = await s3.send(new ListObjectsV2Command(listParams));
      fileList = fileList.concat(listResp.Contents);
      listParams.ContinuationToken = listResp.NextContinuationToken;
    } while (listResp.IsTruncated);

    fileList.sort((a, b) => {
      return new Date(b.LastModified) - new Date(a.LastModified); // Sort descending
    });

    if (fileList.length > maxFiles) {
      const filesToDelete = fileList.slice(maxFiles);

      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: filesToDelete.map((file) => ({ Key: file.Key })),
        },
      };

      await s3.send(new DeleteObjectsCommand(deleteParams));
      console.log(
        "Deleted old backups:",
        filesToDelete.map((file) => file.Key)
      );
    } else {
      console.log("No need to delete backups. Current count within limit.");
    }
  } catch (error) {
    console.error("Failed to cleanup old backups:", error);
  }
}

export { uploadToS3, cleanupOldBackupsS3 };
