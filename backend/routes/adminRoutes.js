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
router.use(authMiddleware);

router.get('/orders', listOrders);
router.patch('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/ship', createBostaShipment);

router.post('/inventory', createProduct);
router.put('/inventory/:id', updateProduct);
router.delete('/inventory/:id', deleteProduct);

// Products routes (alias for inventory)
router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Brand routes
router.get('/brands', listBrands);
router.post('/brands', createBrand);
router.patch('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// Shipping Methods
router.get('/shipping/methods', listShippingMethods);
router.post('/shipping/methods', createShippingMethod);
router.patch('/shipping/methods/:id', updateShippingMethod);
router.delete('/shipping/methods/:id', deleteShippingMethod);

// Per-method Governorates
router.post('/shipping/methods/:id/governorates', addGovernorateToMethod);
router.patch('/shipping/methods/:id/governorates/:govId', updateGovernorateInMethod);
router.delete('/shipping/methods/:id/governorates/:govId', removeGovernorateFromMethod);

// Category routes
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.post('/categories/:type/subcategories', addSubCategory);
router.delete('/categories/:type/subcategories/:subId', removeSubCategory);

// Analytics routes
router.get('/monthly-performance', getMonthlyPerformance);
router.get('/monthly-audit', getMonthlyAudit);
router.get('/top-selling', getTopSellingItems);
router.get('/orders-export', getOrdersForExport);

export default router;
