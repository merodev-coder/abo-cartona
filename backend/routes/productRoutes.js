import { Router } from 'express';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getTags,
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listProducts);
router.get('/tags', getTags);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
