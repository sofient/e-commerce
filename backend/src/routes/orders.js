const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Routes Commandes
 * Base: /api/v1/orders
 */

// @route   POST /api/v1/orders
// @desc    Créer une nouvelle commande
// @access  Public (avec ou sans auth)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, guestEmail, guestName } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun article dans la commande'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Adresse de livraison requise'
      });
    }

    // Vérifier stock et récupérer infos produits
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Produit ${item.productId} introuvable`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuffisant pour ${product.name}`
        });
      }

      orderItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity: item.quantity,
        subtotal: (product.discountPrice || product.price) * item.quantity
      });
    }

    // Générer numéro de commande
    const orderNumber = await Order.generateOrderNumber();

    // Créer commande
    const order = new Order({
      orderNumber,
      userId: req.userId || null,
      guestEmail: req.userId ? null : guestEmail,
      guestName: req.userId ? null : guestName,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || { ...shippingAddress, sameAsShipping: true },
      paymentMethod,
      couponCode,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    // Calculer totaux
    order.calculateTotals();

    await order.save();

    // Décrémenter stock des produits
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      await product.decrementStock(item.quantity);
    }

    logger.info(`✅ Nouvelle commande créée: ${orderNumber}`);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
    });

  } catch (error) {
    logger.error(`❌ Erreur création commande: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    });
  }
});

// @route   GET /api/v1/orders
// @desc    Obtenir toutes les commandes (Admin) ou ses commandes (User)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // Filter
    const filter = {};

    // Si pas admin, ne voir que ses propres commandes
    if (req.userRole !== 'admin') {
      filter.userId = req.userId;
    }

    if (status) {
      filter.orderStatus = status;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'email firstName lastName')
      .select('-__v');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes'
    });
  }
});

// @route   GET /api/v1/orders/:id
// @desc    Obtenir une commande par ID
// @access  Private (Owner ou Admin)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'email firstName lastName')
      .populate('items.productId', 'name sku images');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande introuvable'
      });
    }

    // Vérifier ownership
    if (req.userRole !== 'admin' && order.userId?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la commande'
    });
  }
});

// @route   PATCH /api/v1/orders/:id/status
// @desc    Mettre à jour le statut d'une commande
// @access  Private (Admin)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande introuvable'
      });
    }

    order.updateStatus(status, note, req.userId);
    await order.save();

    logger.info(`✅ Commande ${order.orderNumber} - Statut: ${status}`);

    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut'
    });
  }
});

// @route   GET /api/v1/orders/track/:orderNumber
// @desc    Suivre une commande par numéro (sans auth)
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber.toUpperCase()
    }).select('orderNumber orderStatus statusHistory estimatedDelivery trackingNumber shippingCarrier');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande introuvable'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors du tracking'
    });
  }
});

module.exports = router;
