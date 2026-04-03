/**
 * @file controllers/authController.js
 * @description Authentication controller.
 * Handles user registration and login operations.
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user account.
 * Validates input, checks if user exists, hashes password, and returns JWT.
 * @async
 * @route POST /api/auth/register
 * @access Public
 * @param {Object} req - Express request object
 * @param {String} req.body.name - User's display name
 * @param {String} req.body.email - User's email address
 * @param {String} req.body.password - User's password (minimum 6 characters)
 * @param {String} req.body.profilePic - Optional user profile picture URL
 * @returns {Object} User data with token
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profilePic } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409); // Conflict status
    throw new Error(`User already registered with ${email}`);
  }

  // Create new user (password will be hashed by pre-save middleware)
  const user = await User.create({
    name,
    email,
    password,
    profilePic: profilePic || null,
  });

  // Return user data with token
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    },
  });
});

/**
 * Authenticate user and generate JWT token.
 * Validates credentials and returns user data with token on success.
 * @async
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req - Express request object
 * @param {String} req.body.email - User's email address
 * @param {String} req.body.password - User's password
 * @returns {Object} User data with token
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user by email and explicitly select password field (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401); // Unauthorized status
    throw new Error('Invalid email or password');
  }
});

module.exports = { registerUser, authUser };

