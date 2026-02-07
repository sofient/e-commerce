const express = require('express');
const router = express.Router();
const https = require('https');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Routes Snipcart
 * Base: /api/v1/snipcart
 *
 * Documentation: https://docs.snipcart.com/v3/webhooks/
 */

/**
 * Middleware: Vérifier le token Snipcart webhook via l'API de validation
 * See: https://docs.snipcart.com/v3/webhooks/introduction
 */
const verifySnipcartWebhook = async (req, res, next) => {
  const requestToken = req.headers['x-snipcart-requesttoken'];

  if (!requestToken) {
    return res.status(401).json({
      success: false,
      error: 'Token Snipcart manquant'
    });
  }

  try {
    const validationResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'app.snipcart.com',
        path: `/api/requestvalidation/${requestToken}`,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      };
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => resolve({ statusCode: response.statusCode, body: data }));
      });
      request.on('error', reject);
      request.end();
    });

    if (validationResult.statusCode !== 200) {
      logger.warn('Tentative webhook Snipcart avec token invalide');
      return res.status(403).json({
        success: false,
        error: 'Token invalide'
      });
    }

    next();

  } catch (error) {
    logger.error(`Erreur verification webhook Snipcart: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur de vérification'
    });
  }
};

/**
 * @route   POST /api/v1/snipcart/webhooks
 * @desc    Webhook Snipcart pour les événements (order.completed, etc.)
 * @access  Public (mais sécurisé par signature)
 */
router.post('/webhooks', express.json(), verifySnipcartWebhook, async (req, res) => {
  try {
    const { eventName, content } = req.body;

    logger.info(`📩 Webhook Snipcart reçu: ${eventName}`);

    switch (eventName) {
      case 'order.completed':
        await handleOrderCompleted(content);
        break;

      case 'order.status.changed':
        await handleOrderStatusChanged(content);
        break;

      case 'order.refund.created':
        await handleOrderRefund(content);
        break;

      case 'shippingrates.fetch':
        // Calculer frais de livraison personnalisés
        return await handleShippingRatesFetch(req, res, content);

      default:
        logger.info(`ℹ️  Événement Snipcart non géré: ${eventName}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook traité'
    });

  } catch (error) {
    logger.error(`❌ Erreur webhook Snipcart: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur traitement webhook'
    });
  }
});

/**
 * Handler: Commande complétée
 */
async function handleOrderCompleted(snipcartOrder) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info(`Commande Snipcart completee: ${snipcartOrder.invoiceNumber}`);

    // Resolve product IDs by SKU before building order items
    const skus = snipcartOrder.items.map(item => item.id.toUpperCase());
    const products = await Product.find({ sku: { $in: skus } }).session(session);
    const productBySku = new Map(products.map(p => [p.sku, p]));

    const orderItems = snipcartOrder.items.map(item => {
      const product = productBySku.get(item.id.toUpperCase());
      return {
        productId: product ? product._id : undefined,
        sku: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      };
    });

    const order = new Order({
      orderNumber: snipcartOrder.invoiceNumber,
      userId: null,
      guestEmail: snipcartOrder.email,
      guestName: snipcartOrder.billingAddressName,
      items: orderItems,
      shippingAddress: {
        fullName: snipcartOrder.shippingAddressName,
        street: snipcartOrder.shippingAddressAddress1,
        city: snipcartOrder.shippingAddressCity,
        postalCode: snipcartOrder.shippingAddressPostalCode,
        country: snipcartOrder.shippingAddressCountry,
        phone: snipcartOrder.shippingAddressPhone
      },
      billingAddress: {
        fullName: snipcartOrder.billingAddressName,
        street: snipcartOrder.billingAddressAddress1,
        city: snipcartOrder.billingAddressCity,
        postalCode: snipcartOrder.billingAddressPostalCode,
        country: snipcartOrder.billingAddressCountry,
        sameAsShipping: false
      },
      paymentMethod: 'snipcart',
      paymentProvider: 'snipcart',
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      transactionId: snipcartOrder.token,
      total: snipcartOrder.finalGrandTotal,
      subtotal: snipcartOrder.itemsTotal,
      tax: snipcartOrder.taxesTotal,
      shippingCost: snipcartOrder.shippingInformationAmount
    });

    await order.save({ session });

    // Atomic stock decrement within the same transaction
    for (const item of orderItems) {
      if (!item.productId) continue;
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { session }
      );
      if (!result) {
        throw new Error(`Stock insuffisant pour ${item.name}`);
      }
    }

    await session.commitTransaction();
    logger.info(`Commande ${order.orderNumber} enregistree en DB`);

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Erreur handleOrderCompleted: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Handler: Changement statut commande
 */
async function handleOrderStatusChanged(snipcartOrder) {
  try {
    const order = await Order.findOne({ orderNumber: snipcartOrder.invoiceNumber });

    if (!order) {
      logger.warn(`⚠️  Commande ${snipcartOrder.invoiceNumber} introuvable en DB`);
      return;
    }

    // Mapper statut Snipcart -> Notre statut
    const statusMap = {
      'InProgress': 'processing',
      'Processed': 'confirmed',
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled'
    };

    const newStatus = statusMap[snipcartOrder.status] || 'pending';
    order.updateStatus(newStatus, 'Mis à jour depuis Snipcart');
    await order.save();

    logger.info(`✅ Statut commande ${order.orderNumber}: ${newStatus}`);

  } catch (error) {
    logger.error(`❌ Erreur handleOrderStatusChanged: ${error.message}`);
    throw error;
  }
}

/**
 * Handler: Remboursement
 */
async function handleOrderRefund(snipcartRefund) {
  try {
    const order = await Order.findOne({ transactionId: snipcartRefund.orderToken });

    if (!order) {
      logger.warn(`⚠️  Commande pour refund introuvable`);
      return;
    }

    order.paymentStatus = snipcartRefund.amount === order.total ? 'refunded' : 'partially_refunded';
    order.updateStatus('refunded', `Remboursement de ${snipcartRefund.amount}€`);
    await order.save();

    // Réintégrer stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.incrementStock(item.quantity);
      }
    }

    logger.info(`✅ Remboursement traité: ${snipcartRefund.amount}€`);

  } catch (error) {
    logger.error(`❌ Erreur handleOrderRefund: ${error.message}`);
    throw error;
  }
}

/**
 * Handler: Calcul frais de livraison personnalisés
 * Retourne les options de livraison
 */
async function handleShippingRatesFetch(req, res, content) {
  try {
    // content contient les détails du panier et l'adresse
    const { subtotal, itemsCount, shippingAddress } = content;

    // Règles de livraison personnalisées
    const rates = [];

    // Livraison standard (gratuite si > 50€)
    rates.push({
      cost: subtotal >= 50 ? 0 : 5.90,
      description: subtotal >= 50 ? 'Livraison standard GRATUITE' : 'Livraison standard (3-5 jours)',
      guaranteedDaysToDelivery: 5
    });

    // Livraison express
    rates.push({
      cost: 12.90,
      description: 'Livraison express (1-2 jours)',
      guaranteedDaysToDelivery: 2
    });

    // Point relais (moins cher)
    rates.push({
      cost: 3.90,
      description: 'Point relais (3-5 jours)',
      guaranteedDaysToDelivery: 5
    });

    logger.info(`📦 Calcul frais livraison: ${rates.length} options`);

    return res.json({
      rates
    });

  } catch (error) {
    logger.error(`❌ Erreur calcul livraison: ${error.message}`);
    return res.status(500).json({
      rates: [{
        cost: 5.90,
        description: 'Livraison standard'
      }]
    });
  }
}

/**
 * @route   GET /api/v1/snipcart/products/:id
 * @desc    Endpoint de validation produit pour Snipcart
 * @access  Public (Snipcart l'appelle)
 *
 * Snipcart appelle cet endpoint pour valider le prix avant paiement
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: req.params.id },
        { sku: req.params.id.toUpperCase() }
      ],
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable'
      });
    }

    // Vérifier stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Produit en rupture de stock'
      });
    }

    // Retourner les infos au format Snipcart
    res.json({
      id: product.sku,
      name: product.name,
      price: product.discountPrice || product.price,
      url: `${process.env.FRONTEND_URL}/products/${product.slug}`,
      description: product.shortDescription || product.description,
      image: product.primaryImage?.url,
      weight: product.weight,
      quantity: 1,
      stackable: true,
      maxQuantity: product.stock
    });

  } catch (error) {
    logger.error(`❌ Erreur validation produit Snipcart: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

/**
 * @route   GET /api/v1/snipcart/config
 * @desc    Obtenir la config publique Snipcart (API key)
 * @access  Public
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publicApiKey: process.env.SNIPCART_API_KEY,
      currency: 'eur',
      donationPercentage: process.env.DONATION_PERCENTAGE || 15
    }
  });
});

module.exports = router;
