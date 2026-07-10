import mongoose from 'mongoose';

const dataLibrarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    sizeGB: { type: Number, required: true },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

export const DataLibrary =
  mongoose.models.DataLibrary || mongoose.model('DataLibrary', dataLibrarySchema);
