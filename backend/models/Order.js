import mongoose from 'mongoose';
import { setupInventorySyncMiddleware } from './inventoryMiddleware.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const driveItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'DataLibrary' },
    name: { type: String },
    sizeGB: { type: Number, required: true },
    category: { type: String },
  },
  { _id: false }
);

const assignedDataSchema = new mongoose.Schema(
  {
    dataItemId: { type: String, required: true },
    dataName: { type: String, required: true },
    sizeGB: { type: Number, required: true },
  },
  { _id: false }
);

const storageDataMappingSchema = new mongoose.Schema(
  {
    storageItemId: { type: String, required: true },
    storageName: { type: String, required: true },
    storageCapacity: { type: Number, required: true },
    assignedData: [assignedDataSchema],
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderID: { type: String, required: true, unique: true },
    customerDetails: { type: mongoose.Schema.Types.Mixed, required: true },
    items: [orderItemSchema],
    driveItems: [driveItemSchema],
    totalPrice: { type: Number, required: true },
    totalGB: { type: Number, required: true },
    capacityGB: { type: Number, required: true },
    paymentScreenshotUrl: { type: String },
    uploadedPhotoUrl: { type: String }, // UploadThing URL
    cityCode: { type: String },
    selectedShippingMethod: { type: String },
    shippingCost: { type: Number, default: 0 },
    requiredDeposit: { type: Number, default: 0 },
    trackingNumber: { type: String },
    deliveryId: { type: String },
    deliveryMethod: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    shippingProvider: { type: String },
    // Store pickup location information
    pickupLocation: {
      storeName: { type: String, default: 'أبوكرتونةaming Store' },
      address: { type: String, default: '9 شارع جمال، تقسيم فريد ذكي، حدائق المعصرة، القاهرة' },
      coordinates: {
        lat: { type: Number, default: 30.0444 },
        lng: { type: Number, default: 31.2357 }
      },
      workingHours: { type: String, default: 'يومياً من 12:00 ظهراً إلى 12:00 منتصف الليل' },
      phone: { type: String, default: '01234567890' }
    },
    storageDataMapping: [storageDataMappingSchema],
    status: {
      type: String,
      enum: ['Pending', 'AwaitingPickup', 'Shipping', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Setup inventory sync middleware
setupInventorySyncMiddleware(orderSchema);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
