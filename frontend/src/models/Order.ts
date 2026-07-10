import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const driveItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sizeGB: { type: Number, default: 0 },
    category: { type: String, default: 'data' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderID: { type: String, required: true, unique: true },
    customerName: { type: String },
    phone: { type: String },
    address: { type: String },
    customerDetails: { type: mongoose.Schema.Types.Mixed }, // Legacy/extra details
    items: [orderItemSchema],
    driveItems: [driveItemSchema],
    totalPrice: { type: Number, default: 0 },
    capacityGB: { type: Number, default: 0 },
    paymentScreenshot: { type: String }, // Legacy
    uploadedPhotoUrl: { type: String }, // New UploadThing URL
    cityCode: { type: String },
    trackingNumber: { type: String },
    deliveryId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export type OrderDoc = mongoose.InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
