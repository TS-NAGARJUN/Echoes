/**
 * @file routes/userRoutes.js
 * @description User routes.
 * Protected endpoints for user-related operations.
 */

const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

/**
 * GET /api/users
 * Get all users except logged-in user
 * Protected - requires authentication
 */
router.get('/', protect, getUsers);

module.exports = router;

