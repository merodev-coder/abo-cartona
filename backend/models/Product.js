import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['laptops', 'accessories', 'storage', 'data', 'games'],
    },
    subtype: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    description: { type: String },
    image: { type: String },
    images: [{ type: String }],
    specs: { type: mongoose.Schema.Types.Mixed },
    stockCount: { type: Number, default: 0 },
    storageCapacity: { type: Number, default: 0 },
    gbSize: { type: Number, default: 0 },
    dataDetails: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isBrandActive: { type: Boolean, default: false, required: true },
    brands: { type: [String], default: [], required: true },
    isSale: { type: Boolean, default: false }, // Show on dedicated /sale page
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
productSchema.index({ type: 1, createdAt: -1 }); // Category listings
productSchema.index({ isSale: 1, createdAt: -1 }); // Sale items
productSchema.index({ createdAt: -1, _id: -1 }); // Pagination
productSchema.index({ name: 'text', description: 'text' }); // Search

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
