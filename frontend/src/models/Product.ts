import mongoose from 'mongoose';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120);
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['laptops', 'accessories', 'storage', 'data'],
    },
    subtype: { type: String, default: '' },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    description: { type: String },
    images: [{ type: String }],
    specs: { type: mongoose.Schema.Types.Mixed },
    brand: { type: String },
    stockCount: { type: Number, default: 0 },
    storageCapacity: { type: Number, default: 0 },
    gbSize: { type: Number, default: 0 },
    isSale: { type: Boolean, default: false },
    isBrandActive: { type: Boolean, default: false },
    brands: [{ type: String, default: [] }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
productSchema.pre('validate', async function () {
  if (!this.slug && this.name) {
    let base = generateSlug(this.name);
    if (!base) base = 'product';
    let slug = base;
    let counter = 0;
    const ProductModel = (mongoose.models.Product ||
      mongoose.model('Product', productSchema)) as mongoose.Model<any>;
    // Ensure uniqueness
    while (await ProductModel.findOne({ slug, _id: { $ne: this._id } })) {
      counter++;
      slug = `${base}-${counter}`;
    }
    this.slug = slug;
  }
});

export type ProductDoc = mongoose.InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
