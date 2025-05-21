const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSignedUrlFromS3 = async (bucketName, key) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    // Get the signed URL that expires in 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

const downloadDocument = async (bucketName, key) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return response.Body;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

module.exports = {
  getSignedUrlFromS3,
  downloadDocument,
}; 