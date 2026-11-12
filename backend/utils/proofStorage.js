import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
let sharedClient;
const client = () =>
  (sharedClient ||= new S3Client({
    region: process.env.PROOF_S3_REGION || 'auto',
    endpoint: process.env.PROOF_S3_ENDPOINT || undefined,
    forcePathStyle: process.env.PROOF_S3_PATH_STYLE === 'true',
    maxAttempts: 2,
  }));
export const storageReady = () =>
  Boolean(
    process.env.PROOF_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );
export async function storeProof(key, body) {
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.PROOF_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      CacheControl: 'private, no-store',
    }),
    { abortSignal: AbortSignal.timeout(30000) }
  );
}
export async function proofUrl(key) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: process.env.PROOF_S3_BUCKET,
      Key: key,
      ResponseCacheControl: 'private, no-store',
    }),
    { expiresIn: 60 }
  );
}
export async function deleteProof(key) {
  await client().send(new DeleteObjectCommand({ Bucket: process.env.PROOF_S3_BUCKET, Key: key }), {
    abortSignal: AbortSignal.timeout(30000),
  });
}
