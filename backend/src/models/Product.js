const mongoose = require('mongoose');

/**
 * Schema Produit
 * Gère les produits du catalogue avec images, stock, reviews
 */
const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  name: {
    type: String,
    required: [true, 'Nom du produit requis'],
    trim: true,
    maxlength: 200
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    required: [true, 'Description requise'],
    maxlength: 2000
  },

  shortDescription: {
    type: String,
    maxlength: 200
  },

  // Prix et promotions
  price: {
    type: Number,
    required: [true, 'Prix requis'],
    min: 0
  },

  discountPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Le prix réduit doit être inférieur au prix normal'
    }
  },

  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },

  // Stock et disponibilité
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 5
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    altText: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Catégories et tags
  category: {
    type: String,
    enum: ['enfant-garcon', 'enfant-fille', 'adulte-homme', 'adulte-femme', 'education', 'lego', 'bonbon', 'autre'],
    required: true
  },

  tags: [{
    type: String,
    lowercase: true
  }],

  // Caractéristiques physiques
  weight: {
    type: Number, // en grammes
    min: 0
  },

  dimensions: {
    length: Number, // en cm
    width: Number,
    height: Number
  },

  // Reviews et ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // SEO
  metaTitle: {
    type: String,
    maxlength: 70
  },

  metaDescription: {
    type: String,
    maxlength: 160
  },

  // Donation
  donationEnabled: {
    type: Boolean,
    default: true
  },

  donationPercentage: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },

  // Métadonnées
  isActive: {
    type: Boolean,
    default: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  viewCount: {
    type: Number,
    default: 0
  },

  soldCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Full-text search

// Virtual pour prix effectif
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual pour statut stock
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual pour image principale
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

/**
 * Méthode pour décrémenter le stock
 */
productSchema.methods.decrementStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Stock insuffisant');
  }
  this.stock -= quantity;
  this.soldCount += quantity;
  await this.save();
};

/**
 * Méthode pour incrémenter le stock (annulation, retour)
 */
productSchema.methods.incrementStock = async function(quantity) {
  this.stock += quantity;
  this.soldCount = Math.max(0, this.soldCount - quantity);
  await this.save();
};

/**
 * Hook pre-save pour calculer discount percentage
 */
productSchema.pre('save', function(next) {
  if (this.discountPrice && this.price) {
    this.discountPercentage = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
