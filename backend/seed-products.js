#!/usr/bin/env node
/**
 * Product Seeding Script
 * Reads PRODUCTS.xlsx, maps extracted images, and performs bulk upload to MongoDB
 */

import xlsx from 'xlsx';
import mongoose from 'mongoose';
import { Product } from './models/Product.js';
import { connectDB } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXCEL_FILE = path.join(__dirname, '../PRODUCTS.xlsx');
const UPLOADTHING_MAPPING_FILE = path.join(__dirname, '../public/uploadthing_mapping.json');

// Brand detection patterns
const BRAND_PATTERNS = [
  { name: 'WD', pattern: /wd|western\s*digital/i },
  { name: 'Seagate', pattern: /seagate/i },
  { name: 'Toshiba', pattern: /toshiba/i },
  { name: 'Samsung', pattern: /samsung/i },
  { name: 'Kingston', pattern: /kingston/i },
  { name: 'SanDisk', pattern: /sandisk/i },
  { name: 'Crucial', pattern: /crucial/i },
  { name: 'Lenovo', pattern: /lenovo/i },
  { name: 'Dell', pattern: /dell/i },
  { name: 'HP', pattern: /hp|hewlett\s*packard/i },
  { name: 'Asus', pattern: /asus/i },
  { name: 'Acer', pattern: /acer/i },
  { name: 'Microsoft', pattern: /microsoft/i },
];

/**
 * Detect brand from product name
 */
function detectBrand(productName) {
  for (const { name, pattern } of BRAND_PATTERNS) {
    if (pattern.test(productName)) {
      return name;
    }
  }
  return 'Generic';
}

/**
 * Determine product type based on name
 */
function determineType(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('enclosure') || name.includes('adapter') || name.includes('cable') || 
      name.includes('case') || name.includes('holder') || name.includes('stand')) {
    return 'accessories';
  }
  
  if (name.includes('hdd') || name.includes('ssd') || name.includes('drive') || 
      name.includes('storage') || name.includes('flash') || name.includes('usb')) {
    return 'storage';
  }
  
  if (name.includes('laptop') || name.includes('notebook')) {
    return 'laptops';
  }
  
  if (name.includes('data') || name.includes('recovery') || name.includes('backup')) {
    return 'data';
  }
  
  // Default to storage for drive-related items
  return 'storage';
}

/**
 * Extract subtype from product name
 */
function extractSubtype(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('enclosure')) return 'HDD Enclosure';
  if (name.includes('3.5')) return '3.5 HDD';
  if (name.includes('2.5')) return '2.5 HDD';
  if (name.includes('external')) return 'External Drive';
  if (name.includes('internal')) return 'Internal Drive';
  if (name.includes('ssd')) return 'SSD';
  if (name.includes('hdd')) return 'HDD';
  if (name.includes('flash')) return 'Flash Drive';
  if (name.includes('adapter')) return 'Adapter';
  if (name.includes('cable')) return 'Cable';
  
  return 'Desktop Drive';
}

/**
 * Slugify text to match Python script's filename generation
 */
function slugify(text) {
  text = String(text).trim();
  text = text.replace(/[^\w\s-]/g, '');
  text = text.replace(/[-\s]+/g, '-');
  return text.toLowerCase();
}

/**
 * Generate filename for a product row (matches Python script logic)
 */
function generateFilename(rowNumber, productName) {
  const safeName = slugify(productName);
  return `prod_${rowNumber}_${safeName}.png`;
}

/**
 * Load UploadThing CDN mapping from JSON
 */
function loadUploadThingMapping() {
  try {
    if (fs.existsSync(UPLOADTHING_MAPPING_FILE)) {
      const data = fs.readFileSync(UPLOADTHING_MAPPING_FILE, 'utf8');
      return JSON.parse(data);
    }
    console.warn('⚠️ UploadThing mapping file not found, proceeding without images');
    return {};
  } catch (error) {
    console.error('❌ Error loading UploadThing mapping:', error.message);
    return {};
  }
}

/**
 * Process Excel file and create product documents
 */
function processExcelData(uploadThingMapping) {
  console.log('📖 Reading Excel file...');
  
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Skip header row
  const rows = data.slice(1);
  
  const products = [];
  
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // Excel rows are 1-indexed, header is row 1
    
    const productName = row[0]; // Column A: PRODUCT
    
    if (!productName || typeof productName !== 'string') {
      console.log(`⊘ Row ${rowNumber}: Skipping - no product name`);
      return;
    }
    
    const brand = detectBrand(productName);
    const type = determineType(productName);
    const subtype = extractSubtype(productName);
    
    // Generate expected filename and look up UploadThing CDN URL
    const expectedFilename = generateFilename(rowNumber, productName);
    const cdnUrl = uploadThingMapping[expectedFilename] || null;
    
    const product = {
      name: productName.trim(),
      type: type,
      subtype: subtype,
      brands: [],
      price: 100, // Hardcoded as requested
      stockCount: 50,
      images: cdnUrl ? [cdnUrl] : [],
      isSale: false,
      isBrandActive: true,
    };
    
    products.push(product);
    const imageStatus = cdnUrl ? '✓' : '○';
    console.log(`${imageStatus} Row ${rowNumber}: Processed "${productName}" (${type} - ${brand}) ${cdnUrl ? '' : '[no image]'}`);
  });
  
  return products;
}

/**
 * Main seeding function
 */
async function seedProducts() {
  try {
    // Load environment variables
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await connectDB(mongoUri);
    
    // Load UploadThing CDN mapping
    const uploadThingMapping = loadUploadThingMapping();
    
    // Process Excel data
    const products = processExcelData(uploadThingMapping);
    
    if (products.length === 0) {
      console.warn('⚠️ No products found in Excel file');
      return;
    }
    
    console.log(`\n📦 Prepared ${products.length} products for upload`);
    
    // Clear existing products (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing products...');
    await Product.deleteMany({});
    
    // Bulk insert
    console.log('💾 Inserting products into database...');
    const result = await Product.insertMany(products);
    
    console.log(`\n✅ Successfully seeded ${result.length} products!`);
    console.log('📊 Database upload complete!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding script
seedProducts();
