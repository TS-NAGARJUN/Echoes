/**
 * @file routes/messageRoutes.js
 * @description Message routes.
 * Protected endpoints for message operations.
 */

const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, editMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

/**
 * POST /api/messages
 * Send a new message
 * Protected - requires authentication
 * Body: { senderId, receiverId, text }
 */
router.post('/', protect, sendMessage);

/**
 * GET /api/messages/:userId
 * Get conversation between logged-in user and specified user
 * Protected - requires authentication
 */
router.get('/:userId', protect, getMessages);

/**
 * PUT /api/messages/:messageId
 * Edit a message (only sender can edit)
 * Protected - requires authentication
 * Body: { text: "new message text" }
 */
router.put('/:messageId', protect, editMessage);

/**
 * DELETE /api/messages/:messageId
 * Delete a message (only sender can delete) - soft delete
 * Protected - requires authentication
 */
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
