/**
 * @file routes/messageRoutes.js
 * @description Message routes.
 * Protected endpoints for message operations.
 */

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  reactToMessage, // ✅ new
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

/**
 * POST /api/messages
 * Send a new message (with optional replyTo)
 * Protected - requires authentication
 * Body: { senderId, receiverId, text, replyTo? }
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

/**
 * POST /api/messages/:messageId/react
 * Add, change, or remove an emoji reaction on a message
 * Protected - requires authentication
 * Body: { emoji: "👍" }
 *
 * Logic:
 *   No reaction yet      → add it
 *   Same emoji again     → remove it (toggle off)
 *   Different emoji      → replace old one
 */
router.post('/:messageId/react', protect, reactToMessage);

module.exports = router;