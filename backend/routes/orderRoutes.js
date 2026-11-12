import { Router } from 'express';
import {
  listOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { createOrder } from '../controllers/secureCheckoutController.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { MongoRateStore } from '../utils/MongoRateStore.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  paymentConfig,
  uploadProof,
  viewProof,
  reviewDeposit,
  customerStatus,
  customerProof,
  resubmitProof,
} from '../controllers/depositController.js';

const router = Router();

// إنشاء أوردر (موجود عندك)
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.min(Number(process.env.PROOF_MAX_BYTES) || 5242880, 5242880),
    files: 1,
    fields: 5,
    fieldSize: 262144,
  },
});
const checkoutLimiter = rateLimit({
  store: new MongoRateStore('checkout'),
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
router.get('/payment-config', paymentConfig);
router.post('/proofs', checkoutLimiter, proofUpload.single('proof'), uploadProof);
router.post('/', checkoutLimiter, createOrder);
router.get('/:id/customer-status', customerStatus);
router.get('/:id/customer-proof', customerProof);
router.post('/:id/resubmit-proof', checkoutLimiter, resubmitProof);
router.get('/:id/proof', authMiddleware, viewProof);
router.patch('/:id/deposit', authMiddleware, reviewDeposit);
router.use(authMiddleware);

// جلب كل الأوردرات للجدول
router.get('/', listOrders);

// حل مشكلة الـ 404: جلب أوردر محدد برقم الـ AC-xxxx
router.get('/:id', getOrderById);

router.patch('/:id/status', updateOrderStatus);
router.patch('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
