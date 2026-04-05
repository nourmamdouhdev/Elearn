import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 Client for Supabase Storage (which is S3-compatible) or AWS S3
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.SUPABASE_S3_ENDPOINT || process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // Needed for Supabase S3 compatibility
  forcePathStyle: true, 
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "elearn-media";

/**
 * Generate a presigned URL for direct browser uploads.
 */
export async function generatePresignedUploadUrl(
  key: string, 
  contentType: string, 
  expiresInSeconds = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  
  return {
    uploadUrl: url,
    key,
    publicUrl: process.env.NEXT_PUBLIC_CDN_URL 
      ? `${process.env.NEXT_PUBLIC_CDN_URL}/${key}` 
      : `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
  };
}
