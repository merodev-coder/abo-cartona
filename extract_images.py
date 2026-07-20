#!/usr/bin/env python3
"""
Extract embedded images from Excel file and save to uploads directory.
This script extracts floating images from Column B ('PICTUERS') and maps them to product rows.
"""

import openpyxl
from openpyxl_image_loader import SheetImageLoader
import os
import re
from pathlib import Path

def slugify(text):
    """Convert text to URL-safe filename."""
    text = str(text).strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.lower()

def extract_images_from_excel(excel_path, output_dir):
    """
    Extract embedded images from Excel file.
    
    Args:
        excel_path: Path to PRODUCTS.xlsx
        output_dir: Directory to save extracted images (e.g., 'public/uploads/products')
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Load the workbook
    print(f"Loading Excel file: {excel_path}")
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb.active
    
    # Initialize image loader
    image_loader = SheetImageLoader(sheet)
    
    # Track extracted images mapping (row_index -> filename)
    image_mapping = {}
    
    # Iterate through rows (skip header row)
    print("Extracting images from Column B ('PICTUERS')...")
    for row_idx, row in enumerate(sheet.iter_rows(min_row=2), start=2):
        product_name = row[0].value  # Column A: PRODUCT
        
        if not product_name:
            continue
        
        # Check if there's an image in Column B (index 1)
        if image_loader.image_in('B' + str(row_idx)):
            # Get the image
            image = image_loader.get('B' + str(row_idx))
            
            # Generate filename
            safe_name = slugify(product_name)
            filename = f"prod_{row_idx}_{safe_name}.png"
            filepath = os.path.join(output_dir, filename)
            
            # Save image
            image.save(filepath)
            print(f"✓ Row {row_idx}: Extracted image for '{product_name}' -> {filename}")
            
            # Map row index to filename
            image_mapping[row_idx] = f"/uploads/products/{filename}"
        else:
            print(f"○ Row {row_idx}: No image found for '{product_name}'")
            image_mapping[row_idx] = None
    
    wb.close()
    
    # Save mapping to JSON for Node.js script to use
    import json
    mapping_file = os.path.join(os.path.dirname(output_dir), 'image_mapping.json')
    with open(mapping_file, 'w') as f:
        json.dump(image_mapping, f, indent=2)
    
    print(f"\n✅ Extraction complete!")
    print(f"📁 Images saved to: {output_dir}")
    print(f"📋 Image mapping saved to: {mapping_file}")
    print(f"📊 Total images extracted: {sum(1 for v in image_mapping.values() if v)}")
    
    return image_mapping

if __name__ == "__main__":
    # Configuration
    excel_file = "PRODUCTS.xlsx"
    uploads_dir = "public/uploads/products"
    
    # Run extraction
    extract_images_from_excel(excel_file, uploads_dir)
