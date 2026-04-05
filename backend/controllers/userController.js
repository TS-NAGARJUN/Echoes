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
  try {
    const authenticatedUserId = req.user?._id;
    console.log('✓ getUsers endpoint called');
    console.log('✓ Authenticated user ID:', authenticatedUserId);
    
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Find all users except the authenticated user
    const users = await User.find({ _id: { $ne: authenticatedUserId } })
      .select('-password -token') // Exclude password and token fields
      .lean() // Return plain objects for better performance
      .sort({ name: 1 }); // Sort by name

    console.log(`✓ Found ${users.length} other users in database`);

    // Ensure we always return an array
    res.status(200).json({
      success: true,
      count: users.length,
      data: Array.isArray(users) ? users : [],
    });
  } catch (error) {
    console.error('✗ Error in getUsers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

module.exports = { getUsers };

