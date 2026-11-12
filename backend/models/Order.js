import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    selectedBrand: String,
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
    shippingCost: { type: Number, default: 0, alias: 'deliveryFee' },
    requiredDeposit: { type: Number, default: 0, alias: 'depositAmount' },
    depositType: { type: String, enum: ['STORE_PICKUP_DEPOSIT', 'DELIVERY_FEE_DEPOSIT'] },
    depositProofFileKey: { type: String, select: false },
    depositProofReference: { type: String, select: false },
    idempotencyKey: { type: String },
    requestHash: { type: String },
    customerTokenHash: { type: String, select: false },
    orderTotalMinor: { type: Number },
    depositAmountMinor: { type: Number, default: 0 },
    remainingBalanceMinor: { type: Number },
    depositStatus: {
      type: String,
      enum: [
        'NOT_REQUIRED',
        'AWAITING_DEPOSIT',
        'AWAITING_PAYMENT',
        'PENDING_VERIFICATION',
        'VERIFIED',
        'REJECTED',
        'REFUNDED',
      ],
      default: 'NOT_REQUIRED',
    },
    depositProofStorageKey: { type: String, select: false },
    depositSubmittedAt: Date,
    depositVerifiedAt: Date,
    depositVerifiedBy: String,
    depositRejectionReason: String,
    paymentMethod: String,
    depositHistory: [{ status: String, at: Date, by: String, reason: String }],
    inventoryCommitted: { type: Boolean },
    trackingNumber: { type: String },
    deliveryId: { type: String },
    deliveryMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
      alias: 'fulfillmentMethod',
    },
    shippingProvider: { type: String },
    // Store pickup location information
    pickupLocation: {
      storeName: { type: String, default: 'أبو كرتونة' },
      address: { type: String, default: 'القاهرة - حدائق حلوان' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      workingHours: { type: String, default: 'يومياً من 12:00 ظهراً إلى 12:00 منتصف الليل' },
      phone: { type: String },
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
// Inventory changes belong to the checkout/review transaction, never save hooks.
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
orderSchema.index({ deliveryMethod: 1, depositStatus: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.virtual('remainingBalance').get(function () {
  return this.remainingBalanceMinor == null ? undefined : this.remainingBalanceMinor / 100;
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
