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
export function proofAcl() {
  const configured = process.env.UPLOADTHING_PROOF_ACL?.trim().toLowerCase() || 'public';
  if (configured !== 'public' && configured !== 'private')
    throw Object.assign(new Error('UPLOADTHING_PROOF_ACL must be public or private.'), {
      statusCode: 503,
      diagnosticCode: 'INVALID_PROOF_ACL',
    });
  return { configured, uploadthing: configured === 'public' ? 'public-read' : 'private' };
}
export async function storeProof(body) {
  const acl = proofAcl();
  const result = await uploadthing().uploadFiles(
    new UTFile([body], `${crypto.randomUUID()}.webp`, { type: 'image/webp' }),
    {
      acl: acl.uploadthing,
      contentDisposition: 'inline',
      signal: AbortSignal.timeout(60000),
    }
  );
  if (result.error || !result.data?.key) {
    // Render's sanitized 503 response deliberately omits provider diagnostics.
    // Log only the stable error code; never log the token, URL or file contents.
    const diagnosticCode = String(
      result.error?.code || (result.error ? 'UPLOADTHING_UPLOAD_FAILED' : 'MISSING_FILE_KEY')
    )
      .replace(/[^A-Z0-9_]/gi, '')
      .slice(0, 64);
    console.error(`[UploadThing proof upload] code=${diagnosticCode}`);
    throw Object.assign(new Error(`تعذر حفظ الصورة عبر UploadThing (رمز ${diagnosticCode}).`), {
      statusCode: 503,
      diagnosticCode,
    });
  }
  return {
    key: result.data.key,
    url: result.data.ufsUrl,
    acl: acl.configured,
  };
}
export async function proofUrl(key, acl = 'private', storedUrl) {
  if (!key.startsWith('payment-proofs/')) {
    if (acl === 'public') {
      if (!storedUrl)
        throw Object.assign(new Error('Public proof URL is missing.'), { statusCode: 503 });
      return storedUrl;
    }
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
