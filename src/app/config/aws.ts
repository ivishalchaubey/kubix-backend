import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

export const uploadFile = async (
  key: string,
  fileContent: Buffer,
  contentType?: string
) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME || "kubixfiles3",
    Key: key,
    Body: fileContent,
    ContentType: contentType || "application/octet-stream",
    // ACL: "public-read", // Optional: Set ACL to public-read if you want the file to be publicly accessible
  };

  const data = await s3.upload(uploadParams).promise();
  console.log("Successfully uploaded image to S3:", data.Location);
  return data.Location;
};
