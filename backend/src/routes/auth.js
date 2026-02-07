const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

/**
 * Middleware: handle express-validator errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: errors.array().map(e => e.msg)
    });
  }
  next();
};

/**
 * Routes d'authentification
 * Base: /api/v1/auth
 */

// @route   POST /api/v1/auth/register
// @desc    Inscription nouvel utilisateur
// @access  Public
router.post('/register',
  authLimiter,
  [
    body('email')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Prénom trop long'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Nom trop long'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Username doit contenir entre 3 et 50 caractères')
  ],
  validate,
  authController.register
);

// @route   POST /api/v1/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login',
  authLimiter,
  [
    body('email')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Mot de passe requis')
  ],
  validate,
  authController.login
);

// @route   POST /api/v1/auth/refresh
// @desc    Rafraîchir access token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   POST /api/v1/auth/logout
// @desc    Déconnexion
// @access  Private
router.post('/logout', verifyToken, authController.logout);

// @route   GET /api/v1/auth/me
// @desc    Obtenir profil utilisateur connecté
// @access  Private
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
