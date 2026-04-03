/**
 * @file routes/authRoutes.js
 * @description Authentication routes.
 * Public endpoints for user registration and login.
 */

const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Register a new user account
 * Body: { name, email, password, profilePic? }
 */
router.post('/register', registerUser);

/**
 * POST /api/auth/login
 * Authenticate user and get JWT token
 * Body: { email, password }
 */
router.post('/login', authUser);

module.exports = router;

