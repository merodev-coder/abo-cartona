// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { 
  apiLimiter, 
  authLimiter, 
  securityHeaders, 
  sanitizeData, 
  preventParameterPollution, 
  requestLogger 
} from './middleware/security.js';

import { getTags } from './controllers/productController.js';
import { getSubCategories, listCategories } from './controllers/categoryController.js';

const app = express();

app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// 2. Security middleware (بعد الـ CORS)
app.use(securityHeaders);
app.use(sanitizeData);
app.use(preventParameterPollution);
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tags', getTags);
app.get('/api/categories', listCategories);
app.get('/api/categories/:type/subcategories', getSubCategories);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint for Render.com
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is alive' });
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });