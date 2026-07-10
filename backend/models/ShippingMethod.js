import mongoose from 'mongoose';

const governorateSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, default: 0 },
  },
  { _id: true }
);

const shippingMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    depositType: {
      type: String,
      enum: ['shipping_only', 'total_amount'],
      default: 'shipping_only',
    },
    isActive: { type: Boolean, default: true },
    governorates: { type: [governorateSubSchema], default: [] },
  },
  { timestamps: true }
);

export const ShippingMethod =
  mongoose.models.ShippingMethod || mongoose.model('ShippingMethod', shippingMethodSchema);
