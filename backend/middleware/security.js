import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Rate limiting for general API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب من كل IP
  standardHeaders: true,
  legacyHeaders: false,
  // إضافة السطر ده للتأكد من عدم حدوث الـ Error تاني
  validate: { xForwardedForHeader: false }, 
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      message: 'يا عمار، شكلك بتجرب كتير، اهدى شوية وارجع كمان 15 دقيقة!'
    });
  }
});

// Stricter rate limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later' },
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      connectSrc: ["'self'", "*"], // Allow all connections
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Prevent NoSQL injection
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key} from IP: ${req.ip}`);
  },
});

// Prevent HTTP Parameter Pollution
export const preventParameterPollution = hpp({
  whitelist: ['tags', 'category'], // Allow arrays for these params
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 50),
    };
    console.log(JSON.stringify(log));
  });
  next();
};
