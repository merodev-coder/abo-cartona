import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['laptops', 'accessories', 'storage', 'data', 'games'],
    },
    label: { type: String, required: true, trim: true },
    subCategories: [
      {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate slug for subcategories before save
categorySchema.pre('save', function (next) {
  this.subCategories.forEach((sub) => {
    if (!sub.slug) {
      sub.slug = sub.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  });
  next();
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
