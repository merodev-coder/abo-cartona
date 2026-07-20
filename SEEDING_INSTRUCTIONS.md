# Product Catalog Seeding Pipeline

Complete pipeline to parse `PRODUCTS.xlsx`, extract embedded images, and bulk upload to MongoDB.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- MongoDB connection configured in `backend/.env`

## Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `openpyxl` - Excel file parsing
- `openpyxl-image-loader` - Embedded image extraction

## Step 2: Extract Images from Excel

```bash
python extract_images.py
```

This will:
- Read `PRODUCTS.xlsx`
- Extract embedded images from Column B ('PICTUERS')
- Save images to `public/uploads/products/` with clean filenames
- Create `public/image_mapping.json` mapping row indices to image paths

**Output:**
- Images: `public/uploads/products/prod_{row}_{slugified_name}.png`
- Mapping: `public/image_mapping.json`

## Step 3: Install Node.js Dependencies

```bash
cd backend
npm install
```

Note: `xlsx` package has been added to `package.json` automatically.

## Step 4: Configure Environment

Ensure `backend/.env` contains your MongoDB URI:

```
MONGODB_URI=mongodb+srv://your-connection-string
```

## Step 5: Run Database Seeding

```bash
cd backend
node seed-products.js
```

This will:
- Read `PRODUCTS.xlsx`
- Load image mapping from `public/image_mapping.json`
- Apply categorization rules (type, subtype, brand detection)
- Hardcode price to 100 EGP for all items
- Set stockCount to 50 for all items
- Perform bulk `insertMany()` to MongoDB

## Data Mapping Rules

### Type Detection
- Contains "Enclosure", "adapter", "cable", "case", "holder", "stand" → `accessories`
- Contains "HDD", "SSD", "drive", "storage", "flash", "USB" → `storage`
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

### Fixed Values
- `price`: 100 (all items)
- `stockCount`: 50 (all items)
- `isSale`: false (all items)
- `isBrandActive`: true (all items)

## Troubleshooting

### Python script fails
- Ensure Python 3.8+ is installed: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

### Image extraction returns no images
- Verify images are embedded in Column B of the Excel file
- Check that images are floating objects, not cell backgrounds

### Node.js script fails
- Verify MongoDB URI in `backend/.env`
- Check MongoDB Atlas network access allows your IP
- Ensure `xlsx` package is installed: `cd backend && npm install xlsx`

### Database connection fails
- Verify MongoDB URI format
- Check MongoDB Atlas whitelist allows 0.0.0.0/0 for dynamic IPs
- Ensure database user has correct permissions

## File Structure After Execution

```
abo-cartona/
├── PRODUCTS.xlsx                    # Source file
├── extract_images.py               # Python extraction script
├── requirements.txt                # Python dependencies
├── backend/
│   ├── seed-products.js           # Node.js seeding script
│   ├── package.json               # Updated with xlsx dependency
│   └── .env                       # MongoDB configuration
└── public/
    ├── uploads/
    │   └── products/
    │       ├── prod_2_wd_green.png
    │       ├── prod_3_seagate_barracuda.png
    │       └── ...
    └── image_mapping.json         # Row → Image path mapping
```

## Notes

- The Python script creates `image_mapping.json` which the Node.js script uses to match images to products
- Existing products in the database will be cleared before seeding (comment out `deleteMany` in `seed-products.js` to preserve)
- Image filenames are URL-safe and include row index for uniqueness
- All products are set to `isBrandActive: true` by default
