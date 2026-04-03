/**
 * @file controllers/userController.js
 * @description User controller.
 * Handles user-related operations like retrieving user lists.
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Get all users except the currently logged-in user.
 * Useful for displaying available contacts in chat app.
 * @async
 * @route GET /api/users
 * @access Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user (added by auth middleware)
 * @returns {Array} List of user objects (without passwords)
 */
const getUsers = asyncHandler(async (req, res) => {
  // Find all users except the authenticated user
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    '-password' // Exclude password field
  );

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

module.exports = { getUsers };

