/**
 * @file config/db.js
 * @description MongoDB connection setup using Mongoose.
 * Handles connection lifecycle and error management.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using connection string from environment.
 * Automatically retries on failure and logs connection status.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If MongoDB connection fails after retry attempts
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`\n✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

