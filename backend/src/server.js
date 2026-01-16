require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const {
  helmetConfig,
  apiLimiter,
  corsOptions,
  sanitizeData,
  httpsRedirect,
  customSecurityHeaders
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const snipcartRoutes = require('./routes/snipcart');

// Initialiser Express
const app = express();

// Connexion à MongoDB
connectDB();

// ============================
// MIDDLEWARES GLOBAUX
// ============================

// Sécurité
app.use(helmetConfig);
app.use(customSecurityHeaders);
app.use(httpsRedirect);

// CORS
app.use(cors(corsOptions));

// Compression responses
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization NoSQL injection
app.use(sanitizeData);

// Logging HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ============================
// HEALTH CHECK
// ============================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API [STRANGERTHINGS] E-boutique - En ligne ✅',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: process.env.API_VERSION || 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================
// ROUTES API
// ============================

// Rate limiting sur toutes les routes API
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/snipcart', snipcartRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ============================
// ERROR HANDLER GLOBAL
// ============================

app.use((err, req, res, next) => {
  logger.error(`❌ Erreur: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Erreur Mongoose validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: errors
    });
  }

  // Erreur Mongoose CastError (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID invalide'
    });
  }

  // Erreur Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `${field} existe déjà`
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({
      success: false,
      error: 'Token invalide'
    });
  }

  // Erreur générique
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================
// DÉMARRER LE SERVEUR
// ============================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║   🚀 API [STRANGERTHINGS] E-boutique démarrée             ║
  ║                                                        ║
  ║   📡 Environnement: ${process.env.NODE_ENV?.padEnd(33) || 'development'.padEnd(33)}║
  ║   🌐 Port: ${String(PORT).padEnd(43)}║
  ║   📍 URL: http://localhost:${PORT.toString().padEnd(27)}║
  ║   🔐 CORS: ${(process.env.FRONTEND_URL || 'http://localhost:5173').padEnd(42)}║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu. Arrêt gracieux du serveur...');
  server.close(() => {
    logger.info('Serveur fermé');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
