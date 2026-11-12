import crypto from 'node:crypto';
import sharp from 'sharp';
import { PaymentProof } from '../models/PaymentProof.js';
import { Order } from '../models/Order.js';
import { storageReady, storeProof, proofUrl, deleteProof } from '../utils/proofStorage.js';
import { validateDecision } from '../utils/depositPolicy.js';
import { commitInventory } from '../utils/commitInventory.js';
import { storeConfig } from '../utils/storeConfig.js';
import { sendDepositStatusNotice } from '../utils/emailService.js';
import { checkoutQuote } from '../utils/checkoutQuote.js';
import { depositRequirement, validateProofRequirement } from '../utils/depositRequirement.js';
import { paymentMethods, paymentForProof } from '../utils/paymentConfig.js';

export const ownerHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
export function paymentConfig(req, res) {
  res.set('Cache-Control', 'no-store').json({
    methods: paymentMethods(),
    configuration: {
      destinationReady: paymentMethods().length > 0,
      uploadReady: storageReady(),
      proofAcl: process.env.UPLOADTHING_PROOF_ACL?.trim().toLowerCase() || 'private',
    },
    maxBytes: Math.min(Number(process.env.PROOF_MAX_BYTES) || 5242880, 5242880),
    pickupDeposit: 100,
    pickupMinimum: 100,
    store: storeConfig(),
  });
}
export function customerToken(req) {
  const token = req.get('X-Checkout-Token');
  return typeof token === 'string' && /^[a-f0-9-]{36,80}$/i.test(token) ? token : null;
}
export async function uploadProof(req, res, next) {
  try {
    const token = customerToken(req);
    if (!token) return res.status(401).json({ error: 'جلسة الدفع غير صالحة.' });
    if (!storageReady()) return res.status(503).json({ error: 'رفع إثبات الدفع غير متاح حالياً.' });
    const paymentMethod = paymentMethods().find(
      (m) => m.id === req.body.paymentMethod || m.code === req.body.paymentMethod
    );
    if (!paymentMethod) return res.status(400).json({ error: 'طريقة الدفع غير متاحة.' });
    if (!req.file) return res.status(400).json({ error: 'يرجى اختيار صورة.' });
    let requirement;
    let fulfillmentMethod;
    if (req.body.orderID) {
      const order = await Order.findOne({
        orderID: req.body.orderID,
        customerTokenHash: ownerHash(token),
        depositStatus: 'REJECTED',
        status: { $ne: 'Cancelled' },
      });
      if (!order) return res.status(404).json({ error: 'لا يمكن إعادة إرسال الإثبات لهذا الطلب.' });
      fulfillmentMethod = order.deliveryMethod;
      requirement = {
        depositAmountMinor: order.depositAmountMinor,
        depositType:
          order.depositType ||
          (fulfillmentMethod === 'pickup' ? 'STORE_PICKUP_DEPOSIT' : 'DELIVERY_FEE_DEPOSIT'),
      };
    } else {
      let checkout;
      try {
        checkout = JSON.parse(req.body.checkout);
      } catch {
        return res.status(400).json({ error: 'بيانات الدفع غير صالحة.' });
      }
      if (!checkout || !['pickup', 'delivery'].includes(checkout.deliveryMethod))
        return res.status(400).json({ error: 'طريقة الاستلام غير صالحة.' });
      fulfillmentMethod = checkout.deliveryMethod;
      requirement = depositRequirement(fulfillmentMethod, await checkoutQuote(checkout, null));
    }
    if (requirement.depositAmountMinor <= 0)
      return res.status(400).json({ error: 'هذا الطلب لا يتطلب دفع عربون.' });
    if (
      !/^\d+$/.test(req.body.depositAmountMinor || '') ||
      Number(req.body.depositAmountMinor) !== requirement.depositAmountMinor
    )
      return res.status(400).json({
        error: 'تغير المبلغ المطلوب. يرجى مراجعة رسوم الشحن والعربون قبل الرفع.',
      });
    let image;
    try {
      const input = sharp(req.file.buffer, {
        limitInputPixels: 24000000,
        animated: false,
      });
      const metadata = await input.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1)
        throw new Error('format');
      image = await input
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      return res.status(400).json({ error: 'الصورة غير صالحة. استخدم JPEG أو PNG أو WebP.' });
    }
    const uploaded = await storeProof(image);
    let proof;
    try {
      proof = await PaymentProof.create({
        key: uploaded.key,
        url: uploaded.url,
        acl: uploaded.acl,
        ownerHash: ownerHash(token),
        paymentMethod: paymentMethod.code,
        paymentDestination: paymentMethod.destination,
        provider: 'uploadthing',
        amountMinor: requirement.depositAmountMinor,
        fulfillmentMethod,
        depositType: requirement.depositType,
        expiresAt: new Date(Date.now() + 86400000),
      });
    } catch (error) {
      await deleteProof(uploaded.key).catch(() => {});
      throw error;
    }
    res.status(201).set('Cache-Control', 'no-store').json({ proofId: proof._id });
  } catch (error) {
    next(error);
  }
}
export async function viewProof(req, res, next) {
  try {
    const order = await Order.findOne({ orderID: req.params.id }).select(
      '+depositProofStorageKey +depositProofUrl'
    );
    if (!order?.depositProofStorageKey)
      return res.status(404).json({ error: 'لم يتم العثور على الإثبات.' });
    res.set('Cache-Control', 'no-store').json({
      url: await proofUrl(
        order.depositProofStorageKey,
        order.depositProofAcl,
        order.depositProofUrl
      ),
    });
  } catch (error) {
    next(error);
  }
}
export async function customerProof(req, res, next) {
  try {
    const token = customerToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const order = await Order.findOne({
      orderID: req.params.id,
      customerTokenHash: ownerHash(token),
    }).select('+depositProofStorageKey +depositProofUrl');
    if (!order?.depositProofStorageKey) return res.status(404).json({ error: 'Proof not found' });
    res.set('Cache-Control', 'no-store').json({
      url: await proofUrl(
        order.depositProofStorageKey,
        order.depositProofAcl,
        order.depositProofUrl
      ),
    });
  } catch (error) {
    next(error);
  }
}
export async function reviewDeposit(req, res, next) {
  const session = await Order.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderID: req.params.id }).session(session);
      if (!order) throw Object.assign(new Error('الطلب غير موجود.'), { statusCode: 404 });
      if (order.status === 'Cancelled')
        throw Object.assign(new Error('الطلب ملغي.'), { statusCode: 409 });
      validateDecision(order.depositStatus, req.body.status, req.body.reason);
      if (req.body.status === 'VERIFIED' && !order.inventoryCommitted)
        await commitInventory(order.items, session);
      const now = new Date();
      updated = await Order.findOneAndUpdate(
        { _id: order._id, depositStatus: 'PENDING_VERIFICATION' },
        {
          $set: {
            depositStatus: req.body.status,
            inventoryCommitted: order.inventoryCommitted || req.body.status === 'VERIFIED',
            depositVerifiedAt: req.body.status === 'VERIFIED' ? now : null,
            depositVerifiedBy: req.user.username || req.user.sub,
            depositRejectionReason: req.body.status === 'REJECTED' ? req.body.reason.trim() : null,
          },
          $push: {
            depositHistory: {
              status: req.body.status,
              at: now,
              by: req.user.username || req.user.sub,
              reason: req.body.status === 'REJECTED' ? req.body.reason.trim() : '',
            },
          },
        },
        { new: true, session }
      );
      if (!updated)
        throw Object.assign(new Error('تمت مراجعة التحويل بالفعل.'), {
          statusCode: 409,
        });
    });
    res.set('Cache-Control', 'no-store').json({
      depositStatus: updated.depositStatus,
      depositHistory: updated.depositHistory,
    });
    sendDepositStatusNotice(updated).catch(() =>
      console.error('[Email] Payment notification failed')
    );
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}
export async function customerStatus(req, res, next) {
  try {
    const token = customerToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const order = await Order.findOne({
      orderID: req.params.id,
      customerTokenHash: ownerHash(token),
    }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.set('Cache-Control', 'no-store').json({
      orderID: order.orderID,
      status: order.status,
      depositStatus: order.depositStatus,
      depositRejectionReason: order.depositRejectionReason,
      orderTotalMinor: order.orderTotalMinor,
      depositAmountMinor: order.depositAmountMinor,
      remainingBalanceMinor: order.remainingBalanceMinor,
      fulfillmentMethod: order.deliveryMethod,
      deliveryFee: order.shippingCost,
      depositAmount: order.depositAmountMinor / 100,
      depositType: order.depositType,
      remainingBalance: order.remainingBalanceMinor / 100,
      pickupAddress: order.deliveryMethod === 'pickup' ? storeConfig().address : undefined,
    });
  } catch (error) {
    next(error);
  }
}
export async function resubmitProof(req, res, next) {
  const session = await Order.startSession();
  try {
    const token = customerToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    await session.withTransaction(async () => {
      const proof = await PaymentProof.findOneAndUpdate(
        {
          _id: req.body.proofId,
          ownerHash: ownerHash(token),
          order: null,
          expiresAt: { $gt: new Date() },
        },
        { $set: { order: null } },
        { session, new: true }
      )
        .select('+url')
        .session(session);
      if (!proof)
        throw Object.assign(new Error('إثبات الدفع غير صالح.'), {
          statusCode: 400,
        });
      const paymentMethod = paymentForProof(proof);
      const existing = await Order.findOne({
        orderID: req.params.id,
        customerTokenHash: ownerHash(token),
        depositStatus: 'REJECTED',
        status: { $ne: 'Cancelled' },
      }).session(session);
      if (!existing)
        throw Object.assign(new Error('لا يمكن إعادة إرسال الإثبات لهذا الطلب.'), {
          statusCode: 409,
        });
      validateProofRequirement(
        proof,
        {
          depositAmountMinor: existing.depositAmountMinor,
          depositType:
            existing.depositType ||
            (existing.deliveryMethod === 'pickup'
              ? 'STORE_PICKUP_DEPOSIT'
              : 'DELIVERY_FEE_DEPOSIT'),
        },
        existing.deliveryMethod
      );
      const order = await Order.findOneAndUpdate(
        {
          orderID: req.params.id,
          customerTokenHash: ownerHash(token),
          depositStatus: 'REJECTED',
          status: { $ne: 'Cancelled' },
        },
        {
          $set: {
            depositStatus: 'PENDING_VERIFICATION',
            depositProofStorageKey: proof.key,
            depositProofUrl: proof.url,
            depositProofAcl: proof.acl,
            depositProofFileKey: proof.key,
            depositProofReference: `uploadthing:${proof.key}`,
            paymentMethod: paymentMethod.code,
            paymentDestination: proof.paymentDestination,
            depositSubmittedAt: new Date(),
            depositRejectionReason: null,
          },
          $push: {
            depositHistory: {
              status: 'PENDING_VERIFICATION',
              at: new Date(),
              by: 'customer',
            },
          },
        },
        { session, new: true }
      );
      if (!order)
        throw Object.assign(new Error('لا يمكن إعادة إرسال الإثبات لهذا الطلب.'), {
          statusCode: 409,
        });
      proof.order = order._id;
      await proof.save({ session });
    });
    res.json({ depositStatus: 'PENDING_VERIFICATION' });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}
