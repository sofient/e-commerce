const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, guestEmail, guestName } = req.body;

    // Validation
    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Aucun article dans la commande'
      });
    }

    if (!shippingAddress) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'Adresse de livraison requise'
      });
    }

    // Batch-load all products in a single query
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Verify stock and build order items
    const orderItems = [];
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          error: `Produit ${item.productId} introuvable`
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
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

    await order.save({ session });

    // Atomic stock decrement within the transaction
    for (const item of orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { session }
      );
      if (!result) {
        throw new Error(`Stock insuffisant pour ${item.name} (concurrent update)`);
      }
    }

    await session.commitTransaction();
    session.endSession();

    logger.info(`Nouvelle commande creee: ${orderNumber}`);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Erreur creation commande: ${error.message}`);
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

    // Validate pagination
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parsedLimit)
      .populate('userId', 'email firstName lastName')
      .select('-__v');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          pages: Math.ceil(total / parsedLimit)
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

    logger.info(`Commande ${order.orderNumber} - Statut: ${status}`);

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
