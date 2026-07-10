import { Router } from 'express';
import { 
  createOrder, 
  listOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from '../controllers/orderController.js';
import { upload } from '../utils/upload.js';

const router = Router();

// إنشاء أوردر (موجود عندك)
router.post('/', upload.single('paymentScreenshot'), createOrder);

// جلب كل الأوردرات للجدول
router.get('/', listOrders); 

// حل مشكلة الـ 404: جلب أوردر محدد برقم الـ AC-xxxx
router.get('/:id', getOrderById); 

router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;