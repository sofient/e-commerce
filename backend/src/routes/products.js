const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * Routes Produits
 * Base: /api/v1/products
 */

// @route   GET /api/v1/products
// @desc    Obtenir tous les produits (avec filtres et pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      inStock
    } = req.query;

    // Construire le filtre
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Search full-text
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
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
      error: 'Erreur lors de la récupération des produits'
    });
  }
});

// @route   GET /api/v1/products/:id
// @desc    Obtenir un produit par ID ou slug
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Chercher par ID ou slug
    const product = await Product.findOne({
      $or: [
        { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null },
        { slug: identifier },
        { sku: identifier.toUpperCase() }
      ],
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable'
      });
    }

    // Incrémenter view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du produit'
    });
  }
});

// @route   POST /api/v1/products
// @desc    Créer un nouveau produit
// @access  Private (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: { product }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/v1/products/:id
// @desc    Mettre à jour un produit
// @access  Private (Admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Produit mis à jour',
      data: { product }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/products/:id
// @desc    Supprimer (désactiver) un produit
// @access  Private (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Produit désactivé'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/v1/products/categories/list
// @desc    Obtenir la liste des catégories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    });
  }
});

module.exports = router;
