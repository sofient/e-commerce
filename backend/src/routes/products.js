const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Allowed sort fields to prevent MongoDB injection via sort parameter
const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'name', 'soldCount', 'averageRating'];

// Allowed fields for product creation/update (prevent mass assignment)
const PRODUCT_FIELDS = [
  'sku', 'name', 'slug', 'description', 'shortDescription',
  'price', 'discountPrice', 'stock', 'lowStockThreshold', 'isAvailable',
  'images', 'category', 'tags', 'weight', 'dimensions',
  'metaTitle', 'metaDescription', 'donationEnabled', 'donationPercentage',
  'isActive', 'isFeatured'
];

function pickFields(body, fields) {
  const result = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

function sanitizeSort(sortParam) {
  if (!sortParam) return '-createdAt';
  const direction = sortParam.startsWith('-') ? '-' : '';
  const field = sortParam.replace(/^-/, '');
  if (ALLOWED_SORT_FIELDS.includes(field)) return direction + field;
  return '-createdAt';
}

/**
 * Routes Produits
 * Base: /api/v1/products
 */

// Static routes MUST be defined before parameterized routes

// @route   GET /api/v1/products/meta/categories
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
      sort,
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

    // Validate pagination
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    // Sanitize sort
    const safeSort = sanitizeSort(sort);

    // Query
    const products = await Product.find(filter)
      .sort(safeSort)
      .skip(skip)
      .limit(parsedLimit)
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
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
      error: 'Erreur lors de la récupération des produits'
    });
  }
});

// @route   GET /api/v1/products/:identifier
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

    // Atomic viewCount increment (fire-and-forget)
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});

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
    const data = pickFields(req.body, PRODUCT_FIELDS);
    const product = new Product(data);
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
    const data = pickFields(req.body, PRODUCT_FIELDS);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
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

module.exports = router;
