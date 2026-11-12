import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, select: false },
    acl: { type: String, enum: ['public', 'private'], default: 'private' },
    ownerHash: { type: String, required: true, index: true },
    paymentMethod: { type: String, required: true },
    paymentDestination: { type: String },
    provider: { type: String, enum: ['uploadthing', 'legacy'], default: 'legacy' },
    amountMinor: { type: Number, min: 0 },
    fulfillmentMethod: { type: String, enum: ['pickup', 'delivery'] },
    depositType: { type: String, enum: ['STORE_PICKUP_DEPOSIT', 'DELIVERY_FEE_DEPOSIT'] },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);
export const PaymentProof = mongoose.models.PaymentProof || mongoose.model('PaymentProof', schema);
