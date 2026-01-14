const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

/**
 * Configuration Helmet - Protection contre attaques courantes
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.snipcart.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://app.snipcart.com"]
    }
  },
  crossOriginEmbedderPolicy: false
});

/**
 * Rate Limiting - Protection DDoS et brute force
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Rate limiter général pour toutes les API
const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Trop de requêtes depuis cette adresse IP, réessayez plus tard'
);

// Rate limiter strict pour authentification (anti brute-force)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 tentatives max
  'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes'
);

/**
 * Configuration CORS
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3001'];

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 heures
};

/**
 * Sanitization MongoDB - Prévenir NoSQL injection
 */
const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Tentative d'injection NoSQL détectée: ${key}`);
  }
});

/**
 * Middleware HTTPS redirect (production uniquement)
 */
const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

/**
 * Security headers personnalisés
 */
const customSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  corsOptions,
  sanitizeData,
  httpsRedirect,
  customSecurityHeaders
};
