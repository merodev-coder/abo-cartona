import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { PaymentProof } from '../models/PaymentProof.js';
import { checkoutQuote } from '../utils/checkoutQuote.js';
import { depositRequirement, validateProofRequirement } from '../utils/depositRequirement.js';
import { commitInventory } from '../utils/commitInventory.js';
import { customerToken, ownerHash } from './depositController.js';
import { sendOrderReceipt } from '../utils/emailService.js';
import { storeConfig } from '../utils/storeConfig.js';

export async function createOrder(req, res, next) {
  const token = customerToken(req);
  const key = req.get('Idempotency-Key');
  if (!token || !key || !/^[a-f0-9-]{36,80}$/i.test(key))
    return res.status(400).json({ error: 'جلسة الدفع غير صالحة. يرجى تحديث الصفحة.' });
  const body = req.body;
  if (
    !body ||
    !['pickup', 'delivery'].includes(body.deliveryMethod) ||
    typeof body.customerName !== 'string' ||
    !body.customerName.trim() ||
    body.customerName.length > 120 ||
    typeof body.phone !== 'string' ||
    !/^\+?[0-9 ()-]{8,20}$/.test(body.phone) ||
    typeof body.customerEmail !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail) ||
    body.customerEmail.length > 254
  )
    return res.status(400).json({ error: 'يرجى مراجعة بيانات التواصل.' });
  if (
    body.deliveryMethod === 'delivery' &&
    (typeof body.address !== 'string' || !body.address.trim() || body.address.length > 1000)
  )
    return res.status(400).json({ error: 'العنوان غير صالح.' });
  const requestHash = ownerHash(JSON.stringify(body));
  const idempotencyKey = ownerHash(`${token}:${key}`);
  const session = await mongoose.startSession();
  let order;
  let created = false;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne({ idempotencyKey }).session(session);
      if (order) {
        if (order.requestHash !== requestHash)
          throw Object.assign(new Error('تغيرت بيانات الطلب. يرجى بدء محاولة جديدة.'), {
            statusCode: 409,
          });
        return;
      }
      const quote = await checkoutQuote(body, session);
      if (
        Math.round(
          body.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) * 100
        ) !==
        quote.orderTotalMinor - quote.shippingMinor
      )
        throw Object.assign(new Error('تغير سعر أحد المنتجات. يرجى تحديث السلة قبل إتمام الطلب.'), {
          statusCode: 409,
        });
      const pickup = body.deliveryMethod === 'pickup';
      const amounts = depositRequirement(body.deliveryMethod, quote);
      if (
        !Number.isSafeInteger(body.depositAmountMinor) ||
        body.depositAmountMinor !== amounts.depositAmountMinor
      )
        throw Object.assign(new Error('مبلغ العربون لا يطابق المبلغ المطلوب. يرجى مراجعة الطلب.'), {
          statusCode: 400,
        });
      if (!mongoose.isValidObjectId(body.proofId))
        throw Object.assign(new Error('يرجى رفع إثبات دفع صالح.'), { statusCode: 400 });
      const proof = await PaymentProof.findOne({
        _id: body.proofId,
        ownerHash: ownerHash(token),
        order: null,
        expiresAt: { $gt: new Date() },
      }).session(session);
      if (!proof)
        throw Object.assign(new Error('إثبات الدفع غير صالح أو تم استخدامه بالفعل.'), {
          statusCode: 400,
        });
      validateProofRequirement(proof, amounts, body.deliveryMethod);
      // Pickup orders do not lock stock while evidence is unverified. Approval
      // atomically checks and commits stock. Delivery retains immediate allocation.
      if (!pickup) await commitInventory(quote.items, session);
      [order] = await Order.create(
        [
          {
            orderID: `AC-${crypto.randomUUID()}`,
            idempotencyKey,
            requestHash,
            customerTokenHash: ownerHash(token),
            customerDetails: {
              name: body.customerName.trim(),
              phone: body.phone.trim(),
              email: body.customerEmail.trim(),
              address: pickup ? '' : body.address.trim(),
            },
            items: quote.items,
            driveItems: quote.driveItems,
            totalPrice: quote.orderTotalMinor / 100,
            capacityGB: quote.capacityGB,
            totalGB: quote.totalGB,
            deliveryMethod: body.deliveryMethod,
            selectedShippingMethod: pickup ? 'store_pickup' : body.selectedShippingMethod,
            shippingCost: quote.shippingMinor / 100,
            requiredDeposit: amounts.depositAmountMinor / 100,
            ...amounts,
            depositStatus: 'PENDING_VERIFICATION',
            depositProofStorageKey: proof.key,
            depositProofFileKey: proof.key,
            depositProofReference: `uploadthing:${proof.key}`,
            paymentMethod: proof.paymentMethod,
            depositSubmittedAt: new Date(),
            depositHistory: [{ status: 'PENDING_VERIFICATION', at: new Date(), by: 'customer' }],
            inventoryCommitted: !pickup,
            status: 'Pending',
            pickupLocation: pickup
              ? {
                  storeName: storeConfig().name,
                  address: storeConfig().address,
                  workingHours: storeConfig().hours,
                  phone: storeConfig().phone,
                }
              : undefined,
            storageDataMapping: Array.isArray(body.storageDataMapping)
              ? body.storageDataMapping.slice(0, 100)
              : [],
          },
        ],
        { session }
      );
      proof.order = order._id;
      await proof.save({ session });
      created = true;
    });
    res
      .status(created ? 201 : 200)
      .set('Cache-Control', 'no-store')
      .json({
        order: {
          orderID: order.orderID,
          totalPrice: order.totalPrice,
          depositStatus: order.depositStatus,
          depositAmountMinor: order.depositAmountMinor,
          remainingBalanceMinor: order.remainingBalanceMinor,
          fulfillmentMethod: order.deliveryMethod,
          deliveryFee: order.shippingCost,
          depositType: order.depositType,
          pickupAddress: pickupAddress(order),
        },
      });
    if (created)
      sendOrderReceipt({
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        orderID: order.orderID,
        items: order.items,
        totalPrice: order.totalPrice,
        deliveryMethod: order.deliveryMethod,
        pickupLocation: order.pickupLocation,
        depositAmountMinor: order.depositAmountMinor,
        remainingBalanceMinor: order.remainingBalanceMinor,
      }).catch(() => console.error('[Email] Order receipt failed'));
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: 'الطلب قيد التنفيذ. أعد المحاولة بنفس البيانات.' });
    next(error);
  } finally {
    await session.endSession();
  }
}

function pickupAddress(order) {
  return order.deliveryMethod === 'pickup' ? storeConfig().address : undefined;
}
