# UploadThing Image Upload & Database Seeding Pipeline

Complete pipeline to upload product images to UploadThing CDN and seed MongoDB with permanent public URLs.

## Prerequisites

- Node.js 18+ installed
- UploadThing account with API access
- MongoDB connection configured in `backend/.env`

## Step 1: Configure UploadThing Credentials

1. **Get UploadThing API Secret:**
   - Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
   - Navigate to your app settings
   - Copy the API Secret (not the App ID)

2. **Add to `.env`:**
   ```bash
   # backend/.env
   UPLOADTHING_SECRET=your_uploadthing_api_secret_here
   MONGODB_URI=your_mongodb_connection_string
   ```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

This installs the `uploadthing` package (added to `package.json`).

## Step 3: Extract Images from Excel (if not already done)

If you haven't extracted images yet:

```bash
# From project root
python extract_images.py
```

This extracts embedded images from `PRODUCTS.xlsx` to `public/uploads/products/`.

## Step 4: Upload Images to UploadThing

```bash
cd backend
node uploadToUploadThing.js
```

**What this does:**
- Reads all images from `public/uploads/products/`
- Uploads each image to UploadThing CDN using the server SDK
- Saves filename → CDN URL mapping to `public/uploadthing_mapping.json`
- Uses concurrency (5 uploads at a time) for efficiency

**Output:**
```
🔗 UploadThing Image Upload Pipeline

📁 Found 48 images in public/uploads/products
🚀 Uploading 48 images in 10 batches (concurrency: 5)...

📦 Batch 1/10:
✓ Uploaded: prod_2_25inch-hdd-enclosure-black-plastic.png -> https://utfs.io/f/abc123...
✓ Uploaded: prod_3_25inch-hdd-enclosure-metal.png -> https://utfs.io/f/def456...
...

📋 Upload mapping saved to: public/uploadthing_mapping.json

✅ Upload complete!
📊 Successfully uploaded: 48/48 images
```

## Step 5: Seed Database with UploadThing URLs

```bash
cd backend
node seed-products.js
```

**What this does:**
- Reads `PRODUCTS.xlsx`
- Loads UploadThing CDN mapping from `public/uploadthing_mapping.json`
- Maps each product to its CDN URL using filename matching
- Applies categorization rules (type, subtype, brand detection)
- Hardcodes price to 100 EGP for all items
- Sets stockCount to 50
- Performs bulk `insertMany()` to MongoDB

**Output:**
```
🔗 Connecting to MongoDB...
✅ Successfully connected to MongoDB Atlas
📖 Reading Excel file...
✓ Row 2: Processed "2.5Inch HDD Enclosure - BLACK Plastic" (accessories - Generic)
✓ Row 3: Processed "2.5Inch HDD Enclosure - Metal" (accessories - Generic)
✓ Row 5: Processed "HDD PC 3.5" WD GREEN WD30EARX 3TB" (storage - WD)
...

📦 Prepared 49 products for upload
🧹 Clearing existing products...
💾 Inserting products into database...

✅ Successfully seeded 49 products!
📊 Database upload complete!
```

## Data Schema

Each product in MongoDB will have:

```javascript
{
  "name": "2.5Inch HDD Enclosure - BLACK Plastic",
  "type": "accessories",          // or "storage"
  "subtype": "HDD Enclosure",     // or "3.5 HDD", "SSD", etc.
  "brands": ["Generic"],          // or ["WD"], ["Seagate"], ["Toshiba"]
  "price": 100,                   // Hardcoded
  "stockCount": 50,               // Hardcoded
  "images": ["https://utfs.io/f/abc123..."],  // UploadThing CDN URL
  "isSale": false,
  "isBrandActive": true
}
```

## Categorization Rules

### Type Detection
- Contains "enclosure", "adapter", "cable", "case", "holder", "stand" → `accessories`
- Contains "hdd", "ssd", "drive", "storage", "flash", "usb" → `storage`
- Contains "laptop", "notebook" → `laptops`
- Contains "data", "recovery", "backup" → `data`
- Default → `storage`

### Subtype Extraction
- "Enclosure" → `HDD Enclosure`
- "3.5" → `3.5 HDD`
- "2.5" → `2.5 HDD`
- "external" → `External Drive`
- "internal" → `Internal Drive`
- "SSD" → `SSD`
- "HDD" → `HDD`
- Default → `Desktop Drive`

### Brand Detection
Detects: WD, Seagate, Toshiba, Samsung, Kingston, SanDisk, Crucial, Lenovo, Dell, HP, Asus, Acer, Microsoft
- No match → `Generic`

## Troubleshooting

### UploadThing Upload Fails

**Error:** `UPLOADTHING_SECRET not found`
- Ensure `UPLOADTHING_SECRET` is set in `backend/.env`
- Check the secret is correct (not the App ID)

**Error:** `Uploads directory not found`
- Run `python extract_images.py` first to extract images from Excel
- Verify `public/uploads/products/` directory exists

**Error:** Upload timeout or rate limit
- The script uses concurrency of 5, but you can reduce it in `uploadToUploadThing.js`
- Check UploadThing account limits

### Database Seeding Fails

**Error:** `UploadThing mapping file not found`
- Run `node uploadToUploadThing.js` first
- Verify `public/uploadthing_mapping.json` was created

**Error:** MongoDB connection issues
- Verify `MONGODB_URI` in `backend/.env`
- Check MongoDB Atlas Network Access allows your IP or `0.0.0.0/0`

**Error:** Images not matching
- The script generates filenames matching the Python extraction logic
- If filenames don't match, check `public/uploadthing_mapping.json` structure

## File Structure

```
abo-cartona/
├── PRODUCTS.xlsx                          # Source file
├── extract_images.py                      # Python extraction script
├── backend/
│   ├── uploadToUploadThing.js            # UploadThing upload script
│   ├── seed-products.js                   # Updated seed script
│   ├── package.json                       # With uploadthing dependency
│   └── .env                               # UPLOADTHING_SECRET + MONGODB_URI
└── public/
    ├── uploads/
    │   └── products/
    │       ├── prod_2_25inch-hdd-enclosure-black-plastic.png
    │       └── ...
    ├── image_mapping.json                 # Row → Local path mapping (old)
    └── uploadthing_mapping.json           # Filename → CDN URL mapping (new)
```

## Key Differences from Local Path Approach

| Aspect | Local Path | UploadThing CDN |
|--------|------------|-----------------|
| Image URL | `/uploads/products/prod_2_name.png` | `https://utfs.io/f/abc123...` |
| Hosting | Local server | UploadThing CDN |
| Reliability | Depends on server uptime | Permanent, highly available |
| Performance | Server-dependent | CDN-optimized |
| Scalability | Limited | Unlimited |

## Notes

- The upload script uses `utapi.uploadFiles()` from `uploadthing/server`
- Images are uploaded with proper MIME type (`image/png`)
- Concurrency is set to 5 for balanced performance
- The seed script generates filenames using the same slugification logic as the Python script
- Existing products in MongoDB are cleared before seeding (comment out `deleteMany` to preserve)
