const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Générer Access Token (JWT)
 * Expire après 15 minutes
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );
};

/**
 * Générer Refresh Token (JWT)
 * Expire après 7 jours
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Inscription nouvel utilisateur
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Créer nouvel utilisateur
    const user = new User({
      email,
      passwordHash: password, // Sera hashé automatiquement par le pre-save hook
      firstName,
      lastName,
      username
    });

    await user.save();

    // Générer tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Stocker refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    });
    await user.save();

    logger.info(`✅ Nouvel utilisateur inscrit: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error(`❌ Erreur inscription: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Valider les champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Trouver utilisateur (inclure passwordHash)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si compte actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Compte désactivé. Contactez le support.'
      });
    }

    // Comparer mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Nettoyer anciens tokens expirés
    user.cleanExpiredTokens();

    // Stocker nouveau refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    logger.info(`✅ Connexion réussie: ${user.email}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error(`❌ Erreur login: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rafraîchir access token avec refresh token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requis'
      });
    }

    // Vérifier le refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Utilisateur introuvable ou inactif'
      });
    }

    // Vérifier que le refresh token existe dans la DB
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);

    if (!tokenExists) {
      return res.status(403).json({
        success: false,
        error: 'Token révoqué'
      });
    }

    // Générer nouveau access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    logger.error(`❌ Erreur refresh token: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement du token'
    });
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion (révoque le refresh token)
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.userId; // Vient du middleware auth

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requis'
      });
    }

    // Retirer le refresh token de la DB
    const user = await User.findById(userId);

    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    logger.info(`✅ Déconnexion: ${user?.email || userId}`);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    logger.error(`❌ Erreur logout: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir profil utilisateur connecté
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    logger.error(`❌ Erreur getMe: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

module.exports = exports;
