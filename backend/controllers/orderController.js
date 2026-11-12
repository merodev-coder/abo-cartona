import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { restoreStockForOrder } from '../models/inventoryMiddleware.js';

function normalizeOrder(order) {
  const o = order.toObject ? order.toObject() : order;
  const cd = o.customerDetails || {};
  return {
    ...o,
    id: String(o._id),
    customerName: cd.name || o.customerName || '',
    phone: cd.phone || o.phone || '',
    address: cd.address || o.address || '',
    email: cd.email || o.email || '',
    trackingNumber: o.trackingNumber || null,
    deliveryMethod: o.deliveryMethod || 'delivery',
    shippingProvider: o.shippingProvider || null,
    storageDataMapping: o.storageDataMapping || [],
  };
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const order = await Order.findOne(
      isMongoId ? { $or: [{ _id: id }, { orderID: id }] } : { orderID: id }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: normalizeOrder(order) });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (typeof search === 'string' && search.trim()) {
      filter['customerDetails.name'] = {
        $regex: String(search)
          .slice(0, 100)
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ orders: orders.map(normalizeOrder) });
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    // Find the order first to get the items before deletion
    const order = await Order.findOne(
      isMongoId ? { $or: [{ _id: id }, { orderID: id }] } : { orderID: id }
    ).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Restore stock using the utility function
    const stockRestoreResult =
      order.inventoryCommitted === false
        ? { restored: 0, items: [] }
        : await restoreStockForOrder(order, session);

    // Delete the order
    await Order.findOneAndDelete(
      isMongoId ? { $or: [{ _id: id }, { orderID: id }] } : { orderID: id }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'تم حذف الأوردر وتحديث الجرد بنجاح',
      orderId: order.orderID,
      restoredItems: stockRestoreResult.restored,
      items: stockRestoreResult.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        productId: item.product,
      })),
    });
  } catch (err) {
    // Abort the transaction on any error
    await session.abortTransaction();
    session.endSession();

    console.error('[Order Deletion] Failed to delete order and update inventory:', err.message);
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'AwaitingPickup', 'Shipping', 'Completed', 'Cancelled'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    let order;
    await session.withTransaction(async () => {
      order = await Order.findOne(
        /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { orderID: id }
      ).session(session);
      if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
      if (order.status === 'Cancelled' && status !== 'Cancelled')
        throw Object.assign(new Error('لا يمكن إعادة فتح طلب ملغي. يرجى إنشاء طلب جديد.'), {
          statusCode: 409,
        });
      if (
        order.deliveryMethod === 'pickup' &&
        order.orderTotalMinor != null &&
        ['AwaitingPickup', 'Shipping', 'Completed'].includes(status) &&
        order.depositStatus !== 'VERIFIED'
      )
        throw Object.assign(new Error('يجب تأكيد العربون قبل تجهيز الطلب.'), { statusCode: 409 });
      if (
        status === 'Cancelled' &&
        order.status !== 'Cancelled' &&
        order.inventoryCommitted !== false
      ) {
        await restoreStockForOrder(order, session);
        order.inventoryCommitted = false;
      }
      order.status = status;
      await order.save({ session });
    });
    res.set('Cache-Control', 'no-store').json({ order });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}
