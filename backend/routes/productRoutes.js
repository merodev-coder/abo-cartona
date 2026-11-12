import { Router } from 'express';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getTags,
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

const router = Router();

router.get('/', listProducts);
router.get('/tags', getTags);
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: 'Product not found' });
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
