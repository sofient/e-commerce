const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema Utilisateur
 * Gère l'authentification, profils, adresses et rôles
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },

  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50
  },

  passwordHash: {
    type: String,
    required: [true, 'Mot de passe requis'],
    select: false // Ne pas retourner par défaut dans les queries
  },

  // Informations personnelles
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },

  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Numéro de téléphone invalide']
  },

  sexe: {
    type: String,
    enum: ['Homme', 'Femme', null],
    default: null
  },

  // Adresses de livraison et facturation
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping'],
      required: true
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'France' },
    isPrimary: { type: Boolean, default: false }
  }],

  // Rôles et permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  permissions: [{
    type: String,
    enum: ['manage_products', 'manage_orders', 'manage_users', 'view_analytics']
  }],

  // Tokens de rafraîchissement (pour logout de tous appareils)
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],

  // Vérification email
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,

  // Reset mot de passe
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Métadonnées
  lastLogin: Date,

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true, // createdAt, updatedAt automatiques
  toJSON: {
    transform: (doc, ret) => {
      delete ret.passwordHash;
      delete ret.refreshTokens;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.__v;
      return ret;
    }
  }
});

// Index pour performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

/**
 * Hash password avant sauvegarde
 */
userSchema.pre('save', async function(next) {
  // Ne hash que si le mot de passe a été modifié
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Méthode pour comparer le mot de passe
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison du mot de passe');
  }
};

/**
 * Méthode pour obtenir le profil public
 */
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

/**
 * Nettoyer les tokens expirés
 */
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(t => t.expiresAt > now);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
