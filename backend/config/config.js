/**
 * @file config/config.js
 * @description Centralized configuration management.
 * Loads environment variables and provides access to app config.
 */

require('dotenv').config();

/**
 * Application configuration object.
 * Validates required environment variables on load.
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoURI: process.env.MONGO_URI,

  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

/**
 * Validate critical environment variables on startup.
 * Prevents runtime errors due to missing configuration.
 */
const validateConfig = () => {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error(`\n✗ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

module.exports = { config, validateConfig };

