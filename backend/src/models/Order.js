const mongoose = require('mongoose');

/**
 * Schema Commande
 * Gère les commandes clients avec items, paiement, livraison
 */
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Permettre commandes invités
  },

  // Informations client (si invité)
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true
  },

  guestName: {
    type: String,
    trim: true
  },

  // Items de la commande
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: String,
    name: String,
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    discountApplied: {
      type: Number,
      default: 0
    },
    subtotal: Number // price * quantity
  }],

  // Montants
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },

  tax: {
    type: Number,
    default: 0,
    min: 0
  },

  taxRate: {
    type: Number,
    default: 20 // TVA 20% en France
  },

  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  total: {
    type: Number,
    required: true,
    min: 0
  },

  donationAmount: {
    type: Number,
    default: 0
  },

  // Coupon de réduction
  couponCode: {
    type: String,
    uppercase: true,
    trim: true
  },

  // Adresses
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'France' },
    phone: String
  },

  billingAddress: {
    fullName: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    sameAsShipping: { type: Boolean, default: true }
  },

  // Paiement
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer', 'snipcart'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },

  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'snipcart']
  },

  transactionId: {
    type: String,
    trim: true
  },

  paymentDetails: {
    last4: String, // Derniers 4 chiffres carte
    brand: String, // Visa, Mastercard, etc.
    receiptUrl: String
  },

  // Statut de la commande
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },

  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Livraison
  shippingCarrier: {
    type: String,
    enum: ['colissimo', 'chronopost', 'ups', 'dhl', 'other']
  },

  trackingNumber: String,

  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'relay_point']
  },

  estimatedDelivery: Date,

  actualDelivery: Date,

  // Notes et métadonnées
  customerNotes: {
    type: String,
    maxlength: 500
  },

  internalNotes: {
    type: String,
    maxlength: 1000
  },

  // Email notifications envoyés
  emailsSent: [{
    type: {
      type: String,
      enum: ['confirmation', 'shipping', 'delivery', 'cancellation']
    },
    sentAt: { type: Date, default: Date.now }
  }],

  // Facture
  invoiceUrl: String,

  invoiceNumber: String

}, {
  timestamps: true
});

// Index pour performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ guestEmail: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Générer numéro de commande unique
 */
orderSchema.statics.generateOrderNumber = async function() {
  const year = new Date().getFullYear();
  const lastOrder = await this.findOne({ orderNumber: new RegExp(`^ORD-${year}-`) })
    .sort({ orderNumber: -1 });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Calculer le montant total
 */
orderSchema.methods.calculateTotals = function() {
  // Calculer subtotal des items
  this.subtotal = this.items.reduce((sum, item) => {
    item.subtotal = item.price * item.quantity;
    return sum + item.subtotal;
  }, 0);

  // Appliquer réduction
  const subtotalAfterDiscount = this.subtotal - this.discount;

  // Calculer TVA
  this.tax = (subtotalAfterDiscount * this.taxRate) / 100;

  // Calculer total
  this.total = subtotalAfterDiscount + this.tax + this.shippingCost;

  // Calculer donation (15% du subtotal)
  this.donationAmount = (this.subtotal * (process.env.DONATION_PERCENTAGE || 15)) / 100;
};

/**
 * Mettre à jour le statut
 */
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note,
    updatedBy
  });
};

/**
 * Hook pre-save
 */
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Calculer totaux automatiquement
    this.calculateTotals();

    // Ajouter statut initial à l'historique
    if (this.statusHistory.length === 0) {
      this.statusHistory.push({
        status: this.orderStatus,
        date: new Date()
      });
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
