import { Router } from 'express';
import { listShippingMethods } from '../controllers/shippingController.js';

const router = Router();

router.get('/methods', listShippingMethods);

export default router;
