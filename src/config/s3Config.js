import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_STORAGE_ACCESS_SECRET,
  },
  endpoint: process.env.S3_STORAGE_ENDPOINT,
  region: process.env.S3_STORAGE_REGION,
  forcePathStyle: true,
});

export default s3;
