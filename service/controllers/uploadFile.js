/* eslint-disable no-useless-catch */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * This is the file upload controller that will be used to upload files to AWS S3 bucket
 * @params {}
 * @returns Object | Error
 *  */
export const uploadFile = async (props) => {
  const { fileName, fileContent, mimeType } = props;

  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(fileContent, "binary"),
        ContentType: mimeType,
        ACL: "public-read",
      }),
    );
  } catch (err) {
    throw err;
  }

  return { success: true };
};
