import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import { UTApi, UTFile } from 'uploadthing/server';
// Reuse the store's UploadThing application. Legacy S3 support below is read/
// cleanup only, so existing order evidence is not broken by the provider change.
const uploadthing = () =>
  new UTApi({
    token:
      process.env.UPLOADTHING_TOKEN ||
      process.env.UPLOADTHING_SECRET ||
      process.env.UPLOADTHING_API_KEY,
  });
let sharedClient;
const client = () =>
  (sharedClient ||= new S3Client({
    region: process.env.PROOF_S3_REGION || 'auto',
    endpoint: process.env.PROOF_S3_ENDPOINT || undefined,
    forcePathStyle: process.env.PROOF_S3_PATH_STYLE === 'true',
    maxAttempts: 2,
  }));
export function storageReady() {
  const token =
    process.env.UPLOADTHING_TOKEN ||
    process.env.UPLOADTHING_SECRET ||
    process.env.UPLOADTHING_API_KEY;
  if (!token?.trim()) return false;
  try {
    const config = JSON.parse(Buffer.from(token.trim(), 'base64').toString('utf8'));
    return (
      typeof config.apiKey === 'string' &&
      config.apiKey.startsWith('sk_') &&
      typeof config.appId === 'string' &&
      config.appId.length > 0 &&
      Array.isArray(config.regions) &&
      config.regions.length > 0 &&
      config.regions.every((region) => typeof region === 'string' && region.length > 0)
    );
  } catch {
    return false;
  }
}
export async function storeProof(body) {
  const result = await uploadthing().uploadFiles(
    new UTFile([body], `${crypto.randomUUID()}.webp`, { type: 'image/webp' }),
    {
      acl: 'private',
      contentDisposition: 'inline',
      signal: AbortSignal.timeout(60000),
    }
  );
  if (result.error || !result.data?.key)
    throw Object.assign(
      new Error('تعذر حفظ الصورة بشكل خاص عبر UploadThing. يرجى مراجعة إعدادات الخصوصية.'),
      { statusCode: 503 }
    );
  // Deliberately return a storage key, never a public CDN URL.
  return result.data.key;
}
export async function proofUrl(key) {
  if (!key.startsWith('payment-proofs/')) {
    const result = await uploadthing().generateSignedURL(key, {
      expiresIn: 60,
    });
    return result.ufsUrl;
  }
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
  if (!key.startsWith('payment-proofs/')) {
    const result = await uploadthing().deleteFiles(key);
    if (!result.success) throw new Error('Private proof cleanup failed');
    return;
  }
  await client().send(new DeleteObjectCommand({ Bucket: process.env.PROOF_S3_BUCKET, Key: key }), {
    abortSignal: AbortSignal.timeout(30000),
  });
}
