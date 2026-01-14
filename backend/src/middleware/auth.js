const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware: Vérifier le JWT Access Token
 * Extrait et vérifie le token du header Authorization
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Récupérer token du header Authorization: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié. Token manquant.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          error: 'Token expiré. Veuillez vous reconnecter.',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(403).json({
        success: false,
        error: 'Token invalide'
      });
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Utilisateur introuvable ou inactif'
      });
    }

    // Attacher les infos utilisateur à la requête
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();

  } catch (error) {
    logger.error(`❌ Erreur vérification token: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification'
    });
  }
};

/**
 * Middleware: Vérifier que l'utilisateur est Admin
 */
exports.requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Droits administrateur requis.'
    });
  }
  next();
};

/**
 * Middleware: Vérifier que l'utilisateur a un rôle spécifique
 */
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: `Accès refusé. Rôle requis: ${roles.join(' ou ')}`
      });
    }
    next();
  };
};

/**
 * Middleware: Vérifier que l'utilisateur accède à ses propres données
 * ou qu'il est admin
 */
exports.requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (req.userId !== resourceUserId && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.'
    });
  }

  next();
};

/**
 * Middleware optionnel: Attacher les infos user si token présent
 * Ne bloque pas si pas de token (pour routes publiques/semi-publiques)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Pas de token, continuer sans auth
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.isAuthenticated = true;

  } catch (error) {
    // Token invalide, continuer sans auth
    req.isAuthenticated = false;
  }

  next();
};

module.exports = exports;
