/* eslint-disable no-useless-catch */
import AWS from "aws-sdk";

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
  const { fileName, fileContent } = props;

  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(fileContent, "binary"),
    ACL: "public-read",
  };

  try {
    await s3.upload(params).promise();
  } catch (err) {
    throw err;
  }

  return { success: true };
};
