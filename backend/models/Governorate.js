import mongoose from 'mongoose';

const governorateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    cityCode: { type: String, trim: true },
    cost: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Governorate =
  mongoose.models.Governorate || mongoose.model('Governorate', governorateSchema);
