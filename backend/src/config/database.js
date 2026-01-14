const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Configuration et connexion à MongoDB
 * Gère la connexion, reconnexion et logging des événements
 */
const connectDB = async () => {
  try {
    const options = {
      // useNewUrlParser: true,  // Deprecated in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated in Mongoose 6+
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);

    // Event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB erreur de connexion: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB déconnecté. Tentative de reconnexion...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnecté');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
