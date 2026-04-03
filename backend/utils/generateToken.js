/**
 * @file utils/generateToken.js
 * @description JWT token generation utility.
 * Creates signed bearer tokens for authenticated users.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user.
 * Token is signed with JWT_SECRET and expires in 30 days.
 * @param {String} userId - MongoDB ObjectId of the user
 * @returns {String} Signed JWT token
 * @throws {Error} If JWT_SECRET is not defined
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = generateToken;

