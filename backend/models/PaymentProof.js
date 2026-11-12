import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    ownerHash: { type: String, required: true, index: true },
    paymentMethod: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);
export const PaymentProof = mongoose.models.PaymentProof || mongoose.model('PaymentProof', schema);
