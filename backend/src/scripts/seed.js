/**
 * Script de seed pour alimenter la base de données
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ MongoDB connecté');
  } catch (error) {
    logger.error(`❌ Erreur connexion: ${error.message}`);
    process.exit(1);
  }
};

// Données de seed
const products = [
  {
    sku: 'PACK-01',
    name: 'Pack 01: Enfant - Garçon',
    slug: 'pack-01-enfant-garcon',
    description: 'Sélection d\'articles pour garçon (jouets, friandises, petit cadeau).',
    shortDescription: 'Pack cadeau pour garçon',
    price: 19.99,
    stock: 50,
    category: 'enfant-garcon',
    weight: 800,
    images: [{
      url: 'https://placehold.co/400x300/ff7f50/ffffff?text=Pack+01+Enfant',
      altText: 'Pack 01 Enfant Garçon',
      isPrimary: true
    }],
    tags: ['enfant', 'garcon', 'jouet', 'cadeau'],
    metaTitle: 'Pack Cadeau Garçon - Jouets et Friandises',
    metaDescription: 'Pack cadeau complet pour garçon avec jouets et gourmandises.',
    isAvailable: true,
    isFeatured: true
  },
  {
    sku: 'PACK-02',
    name: 'Pack 02: Enfant - Fille',
    slug: 'pack-02-enfant-fille',
    description: 'Coffret pour fille avec petits jouets et gourmandises.',
    shortDescription: 'Pack cadeau pour fille',
    price: 19.99,
    stock: 50,
    category: 'enfant-fille',
    weight: 800,
    images: [{
      url: 'https://placehold.co/400x300/ffb6c1/ffffff?text=Pack+02+Enfant',
      altText: 'Pack 02 Enfant Fille',
      isPrimary: true
    }],
    tags: ['enfant', 'fille', 'jouet', 'cadeau'],
    metaTitle: 'Pack Cadeau Fille - Jouets et Gourmandises',
    metaDescription: 'Coffret cadeau pour fille avec jouets et douceurs.',
    isAvailable: true,
    isFeatured: true
  },
  {
    sku: 'PACK-03',
    name: 'Pack 03: Adulte - Homme',
    slug: 'pack-03-adulte-homme',
    description: 'Sélection masculine: gourmandises et accessoires pratiques.',
    shortDescription: 'Pack cadeau pour homme',
    price: 24.99,
    stock: 40,
    category: 'adulte-homme',
    weight: 1200,
    images: [{
      url: 'https://placehold.co/400x300/87ceeb/ffffff?text=Pack+03+Homme',
      altText: 'Pack 03 Adulte Homme',
      isPrimary: true
    }],
    tags: ['adulte', 'homme', 'cadeau'],
    metaTitle: 'Pack Cadeau Homme - Accessoires et Gourmandises',
    metaDescription: 'Pack cadeau homme avec accessoires et douceurs.',
    isAvailable: true
  },
  {
    sku: 'PACK-04',
    name: 'Pack 04: Adulte - Femme',
    slug: 'pack-04-adulte-femme',
    description: 'Coffret féminin: douceurs et petits soins.',
    shortDescription: 'Pack cadeau pour femme',
    price: 24.99,
    stock: 40,
    category: 'adulte-femme',
    weight: 1200,
    images: [{
      url: 'https://placehold.co/400x300/f4a460/ffffff?text=Pack+04+Femme',
      altText: 'Pack 04 Adulte Femme',
      isPrimary: true
    }],
    tags: ['adulte', 'femme', 'cadeau', 'soin'],
    metaTitle: 'Pack Cadeau Femme - Soins et Douceurs',
    metaDescription: 'Coffret cadeau femme avec soins et gourmandises.',
    isAvailable: true
  },
  {
    sku: 'PACK-05',
    name: 'Pack 05: Education',
    slug: 'pack-05-education',
    description: 'Ressources et activités éducatives pour enfants.',
    shortDescription: 'Pack éducatif',
    price: 14.99,
    stock: 60,
    category: 'education',
    weight: 600,
    images: [{
      url: 'https://placehold.co/400x300/ffe4b5/111111?text=Pack+05+Education',
      altText: 'Pack 05 Education',
      isPrimary: true
    }],
    tags: ['education', 'enfant', 'apprentissage'],
    metaTitle: 'Pack Éducatif - Ressources pour Enfants',
    metaDescription: 'Pack éducatif avec activités et ressources pédagogiques.',
    isAvailable: true,
    isFeatured: true
  },
  {
    sku: 'PACK-06',
    name: 'Pack 06: Pack Lego - Mekka',
    slug: 'pack-06-lego-mekka',
    description: 'Kit Lego thématique: Mekka - constructions et livret explicatif.',
    shortDescription: 'Kit Lego Mekka',
    price: 34.99,
    stock: 30,
    category: 'lego',
    weight: 2000,
    images: [{
      url: 'https://placehold.co/400x300/ffd700/111111?text=Pack+06+Lego',
      altText: 'Pack 06 Lego Mekka',
      isPrimary: true
    }],
    tags: ['lego', 'mekka', 'construction', 'educatif'],
    metaTitle: 'Kit Lego Mekka - Construction Thématique',
    metaDescription: 'Kit Lego thématique Mekka avec livret explicatif.',
    isAvailable: true,
    isFeatured: true
  },
  {
    sku: 'PACK-07',
    name: 'Pack 07: Pack Lego - Medina',
    slug: 'pack-07-lego-medina',
    description: 'Kit Lego thématique: Medina - constructions et livret explicatif.',
    shortDescription: 'Kit Lego Medina',
    price: 34.99,
    stock: 30,
    category: 'lego',
    weight: 2000,
    images: [{
      url: 'https://placehold.co/400x300/ffdead/111111?text=Pack+07+Lego',
      altText: 'Pack 07 Lego Medina',
      isPrimary: true
    }],
    tags: ['lego', 'medina', 'construction', 'educatif'],
    metaTitle: 'Kit Lego Medina - Construction Thématique',
    metaDescription: 'Kit Lego thématique Medina avec livret explicatif.',
    isAvailable: true
  },
  {
    sku: 'PACK-08',
    name: 'Pack 08: Pack Lego - Al Quds',
    slug: 'pack-08-lego-al-quds',
    description: 'Kit Lego thématique: Al Quds - constructions et livret explicatif.',
    shortDescription: 'Kit Lego Al Quds',
    price: 34.99,
    stock: 30,
    category: 'lego',
    weight: 2000,
    images: [{
      url: 'https://placehold.co/400x300/d3d3d3/111111?text=Pack+08+Lego',
      altText: 'Pack 08 Lego Al Quds',
      isPrimary: true
    }],
    tags: ['lego', 'al-quds', 'construction', 'educatif'],
    metaTitle: 'Kit Lego Al Quds - Construction Thématique',
    metaDescription: 'Kit Lego thématique Al Quds avec livret explicatif.',
    isAvailable: true
  },
  {
    sku: 'PACK-09',
    name: 'Pack 09: Pack Lego - Triptyque',
    slug: 'pack-09-lego-triptyque',
    description: 'Triptyque thématique Lego: trois modèles à assembler, parfait comme coffret cadeau.',
    shortDescription: 'Kit Lego Triptyque',
    price: 44.99,
    discountPrice: 39.99,
    stock: 20,
    category: 'lego',
    weight: 2500,
    images: [{
      url: 'https://placehold.co/400x300/b0e0e6/111111?text=Pack+09+Triptyque',
      altText: 'Pack 09 Lego Triptyque',
      isPrimary: true
    }],
    tags: ['lego', 'triptyque', 'construction', 'cadeau-premium'],
    metaTitle: 'Kit Lego Triptyque - 3 Modèles Thématiques',
    metaDescription: 'Triptyque Lego avec 3 constructions thématiques.',
    isAvailable: true,
    isFeatured: true
  },
  {
    sku: 'PACK-10',
    name: 'Pack 10: Pack bonbon',
    slug: 'pack-10-bonbon',
    description: 'Assortiment de bonbons et douceurs pour petits et grands.',
    shortDescription: 'Pack bonbons',
    price: 9.99,
    stock: 100,
    category: 'bonbon',
    weight: 400,
    images: [{
      url: 'https://placehold.co/400x300/ff69b4/ffffff?text=Pack+10+Bonbon',
      altText: 'Pack 10 Bonbon',
      isPrimary: true
    }],
    tags: ['bonbon', 'gourmandise', 'friandise'],
    metaTitle: 'Pack Bonbons - Assortiment de Douceurs',
    metaDescription: 'Assortiment de bonbons et friandises pour tous.',
    isAvailable: true
  }
];

const users = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@cercle-eboutique.com',
    passwordHash: process.env.ADMIN_PASSWORD || 'Admin123!',
    firstName: 'Admin',
    lastName: '[STRANGERTHINGS]',
    role: 'admin',
    isVerified: true,
    permissions: ['manage_products', 'manage_orders', 'manage_users', 'view_analytics']
  },
  {
    email: 'test@example.com',
    passwordHash: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Nettoyer les collections
    logger.info('🗑️  Nettoyage des collections...');
    await Product.deleteMany({});
    await User.deleteMany({});

    // Insérer les produits
    logger.info('📦 Insertion des produits...');
    await Product.insertMany(products);
    logger.info(`✅ ${products.length} produits insérés`);

    // Insérer les utilisateurs
    logger.info('👥 Insertion des utilisateurs...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // Le pre-save hook va hasher le password
    }
    logger.info(`✅ ${users.length} utilisateurs insérés`);

    logger.info('🎉 Seed terminé avec succès!');
    logger.info('📧 Admin email:', users[0].email);
    logger.info('🔑 Admin password:', process.env.ADMIN_PASSWORD || 'Admin123!');

    process.exit(0);

  } catch (error) {
    logger.error(`❌ Erreur seed: ${error.message}`);
    process.exit(1);
  }
};

// Exécuter le seed
seedDatabase();
