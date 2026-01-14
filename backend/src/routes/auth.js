const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

/**
 * Routes d'authentification
 * Base: /api/v1/auth
 */

// @route   POST /api/v1/auth/register
// @desc    Inscription nouvel utilisateur
// @access  Public
router.post('/register', authLimiter, authController.register);

// @route   POST /api/v1/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', authLimiter, authController.login);

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
