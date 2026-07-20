#!/usr/bin/env node
/**
 * UploadThing Image Upload Pipeline
 * Reads extracted images from public/uploads/products/ and uploads to UploadThing CDN
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UTApi } from 'uploadthing/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/products');
const MAPPING_FILE = path.join(__dirname, '../public/uploadthing_mapping.json');

// Initialize UploadThing API client
// UploadThing expects a properly formatted token
const uploadthingSecret = process.env.UPLOADTHING_SECRET || process.env.UPLOADTHING_API_KEY || process.env.UPLOADTHING_TOKEN;

if (!uploadthingSecret) {
  console.error('❌ No UploadThing credentials found in environment variables');
  console.error('Please set UPLOADTHING_SECRET in backend/.env');
  console.error('The token should be a base64-encoded JSON object: { apiKey: string, appId: string, regions: string[] }');
  process.exit(1);
}

const utapi = new UTApi({ token: uploadthingSecret });

/**
 * Read all images from uploads directory
 */
function getLocalImages() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    throw new Error(`Uploads directory not found: ${UPLOADS_DIR}`);
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  const imageFiles = files.filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.webp')
  );

  console.log(`📁 Found ${imageFiles.length} images in ${UPLOADS_DIR}`);
  return imageFiles.map(filename => ({
    filename,
    filepath: path.join(UPLOADS_DIR, filename),
  }));
}

/**
 * Upload single image to UploadThing
 */
async function uploadImage(file) {
  try {
    const fileBuffer = fs.readFileSync(file.filepath);
    
    const uploadResult = await utapi.uploadFiles([
      new File([fileBuffer], file.filename, {
        type: 'image/png',
      }),
    ]);

    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));

    if (!uploadResult || uploadResult.length === 0) {
      throw new Error(`No upload result for ${file.filename}`);
    }

    const uploadedFile = uploadResult[0];
    
    // Try different possible URL fields from UploadThing response
    const cdnUrl = uploadedFile.ufsUrl || uploadedFile.fileUrl || uploadedFile.url || uploadedFile.data?.url;

    if (!cdnUrl) {
      console.error(`No CDN URL found in upload result for ${file.filename}`);
      console.log('Full upload result:', uploadedFile);
      return null;
    }

    console.log(`✓ Uploaded: ${file.filename} -> ${cdnUrl}`);
    return {
      filename: file.filename,
      cdnUrl: cdnUrl,
      key: uploadedFile.key,
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${file.filename}:`, error.message);
    return null;
  }
}

/**
 * Upload all images with concurrency control
 */
async function uploadAllImages(images, concurrency = 5) {
  const results = [];
  const chunks = [];

  // Split into chunks for concurrent uploads
  for (let i = 0; i < images.length; i += concurrency) {
    chunks.push(images.slice(i, i + concurrency));
  }

  console.log(`🚀 Uploading ${images.length} images in ${chunks.length} batches (concurrency: ${concurrency})...`);

  // Upload just first image to debug response structure
  console.log(`\n📦 Testing upload with first image to debug response structure...`);
  const firstResult = await uploadImage(images[0]);
  if (firstResult) {
    results.push(firstResult);
  } else {
    console.error('❌ First upload failed, stopping to debug');
    return results;
  }

  // Continue with rest if first succeeded
  for (let i = 0; i < chunks.length; i++) {
    console.log(`\n📦 Batch ${i + 1}/${chunks.length}:`);
    const batchResults = await Promise.all(chunks[i].map(uploadImage));
    results.push(...batchResults.filter(r => r !== null));
  }

  return results;
}

/**
 * Save upload mapping to JSON
 */
function saveMapping(mapping) {
  const mappingObject = {};
  mapping.forEach(item => {
    mappingObject[item.filename] = item.cdnUrl;
  });

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mappingObject, null, 2));
  console.log(`\n📋 Upload mapping saved to: ${MAPPING_FILE}`);
}

/**
 * Main upload function
 */
async function main() {
  try {
    // Check for UploadThing secret
    if (!process.env.UPLOADTHING_SECRET) {
      throw new Error('UPLOADTHING_SECRET not found in environment variables. Add it to backend/.env');
    }

    console.log('🔗 UploadThing Image Upload Pipeline\n');

    // Get local images
    const images = getLocalImages();

    if (images.length === 0) {
      console.warn('⚠️ No images found to upload');
      return;
    }

    // Upload all images
    const results = await uploadAllImages(images);

    // Save mapping
    saveMapping(results);

    console.log(`\n✅ Upload complete!`);
    console.log(`📊 Successfully uploaded: ${results.length}/${images.length} images`);
    console.log(`📁 Mapping file: ${MAPPING_FILE}`);

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the upload pipeline
main();
