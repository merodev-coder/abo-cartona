import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { listOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
} from '../controllers/productController.js';
import {
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import {
  listShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  addGovernorateToMethod,
  updateGovernorateInMethod,
  removeGovernorateFromMethod,
} from '../controllers/shippingController.js';
import {
  getMonthlyPerformance,
  getMonthlyAudit,
  getTopSellingItems,
  getOrdersForExport,
} from '../controllers/analyticsController.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  addSubCategory,
  removeSubCategory,
} from '../controllers/categoryController.js';
import { createBostaShipment } from '../controllers/adminController.js';

const router = Router();

router.get('/orders', authMiddleware, listOrders);
router.patch('/orders/:id', authMiddleware, updateOrderStatus);
router.delete('/orders/:id', authMiddleware, deleteOrder);
router.post('/orders/ship', authMiddleware, createBostaShipment);

router.post('/inventory', authMiddleware, createProduct);
router.put('/inventory/:id', authMiddleware, updateProduct);
router.delete('/inventory/:id', authMiddleware, deleteProduct);

// Products routes (alias for inventory)
router.get('/products', authMiddleware, listProducts);
router.post('/products', authMiddleware, createProduct);
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

// Brand routes
router.get('/brands', authMiddleware, listBrands);
router.post('/brands', authMiddleware, createBrand);
router.patch('/brands/:id', authMiddleware, updateBrand);
router.delete('/brands/:id', authMiddleware, deleteBrand);

// Shipping Methods
router.get('/shipping/methods', authMiddleware, listShippingMethods);
router.post('/shipping/methods', authMiddleware, createShippingMethod);
router.patch('/shipping/methods/:id', authMiddleware, updateShippingMethod);
router.delete('/shipping/methods/:id', authMiddleware, deleteShippingMethod);

// Per-method Governorates
router.post('/shipping/methods/:id/governorates', authMiddleware, addGovernorateToMethod);
router.patch('/shipping/methods/:id/governorates/:govId', authMiddleware, updateGovernorateInMethod);
router.delete('/shipping/methods/:id/governorates/:govId', authMiddleware, removeGovernorateFromMethod);

// Category routes
router.get('/categories', authMiddleware, listCategories);
router.post('/categories', authMiddleware, createCategory);
router.patch('/categories/:id', authMiddleware, updateCategory);
router.post('/categories/:type/subcategories', authMiddleware, addSubCategory);
router.delete('/categories/:type/subcategories/:subId', authMiddleware, removeSubCategory);

// Analytics routes
router.get('/monthly-performance', authMiddleware, getMonthlyPerformance);
router.get('/monthly-audit', authMiddleware, getMonthlyAudit);
router.get('/top-selling', authMiddleware, getTopSellingItems);
router.get('/orders-export', authMiddleware, getOrdersForExport);

export default router;
