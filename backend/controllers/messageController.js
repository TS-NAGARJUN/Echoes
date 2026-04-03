/**
 * @file controllers/messageController.js
 * @description Message controller.
 * Handles message sending, retrieval, editing, and deletion.
 */

const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Send a new message from authenticated user to another user.
 * Validates that both sender and receiver exist.
 * @async
 * @route POST /api/messages
 * @access Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {String} req.body.senderId - ID of message sender
 * @param {String} req.body.receiverId - ID of message receiver
 * @param {String} req.body.text - Message content
 * @returns {Object} Created message with timestamps
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  // Validation
  if (!senderId || !receiverId || !text) {
    res.status(400);
    throw new Error('Sender ID, Receiver ID, and message text are required');
  }

  if (text.trim().length === 0) {
    res.status(400);
    throw new Error('Message cannot be empty');
  }

  // Verify both users exist
  const senderExists = await User.findById(senderId);
  const receiverExists = await User.findById(receiverId);

  if (!senderExists || !receiverExists) {
    res.status(404);
    throw new Error('Sender or receiver not found');
  }

  if (senderId === receiverId) {
    res.status(400);
    throw new Error('Cannot send message to yourself');
  }

  // Create message
  const message = await Message.create({
    senderId,
    receiverId,
    text: text.trim(),
  });

  // Populate user references for response
  await message.populate(['senderId', 'receiverId']);

  res.status(201).json({
    success: true,
    data: message,
  });
});

/**
 * Get all messages in a conversation between logged-in user and a specific user.
 * Messages are sorted by creation date (oldest first).
 * Excludes soft-deleted messages by default.
 * @async
 * @route GET /api/messages/:userId
 * @access Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {String} req.params.userId - ID of the other user in conversation
 * @param {Object} req.user - Authenticated user (added by auth middleware)
 * @returns {Array} Array of message objects sorted by timestamp
 */
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  // Validate userId
  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find messages where logged-in user is sender OR receiver
  // AND the other party is the specified user
  // Exclude deleted messages (isDeleted = false)
  const messages = await Message.find({
    $and: [
      {
        $or: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      },
      { isDeleted: false }, // Only fetch non-deleted messages
    ],
  })
    .populate('senderId', 'name email profilePic') // Populate sender details
    .populate('receiverId', 'name email profilePic') // Populate receiver details
    .sort({ createdAt: 1 }); // Sort by creation date (ascending)

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

/**
 * Edit a message sent by the authenticated user.
 * Only the sender can edit their own messages.
 * Marks message as edited with timestamp.
 * @async
 * @route PUT /api/messages/:messageId
 * @access Private (requires authentication, only sender)
 * @param {Object} req - Express request object
 * @param {String} req.params.messageId - ID of message to edit
 * @param {String} req.body.text - New message text
 * @param {Object} req.user - Authenticated user
 * @returns {Object} Updated message object
 */
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  // Validation
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if message is already deleted
  if (message.isDeleted) {
    res.status(410); // Gone status
    throw new Error('Cannot edit a deleted message');
  }

  // Verify sender is the one editing
  if (message.senderId.toString() !== userId.toString()) {
    res.status(403); // Forbidden status
    throw new Error('You can only edit your own messages');
  }

  // Optional: Prevent editing messages older than 24 hours
  // const editWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // if (Date.now() - message.createdAt.getTime() > editWindow) {
  //   res.status(400);
  //   throw new Error('Cannot edit messages older than 24 hours');
  // }

  // Update message
  message.text = text.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  // Populate for response
  await message.populate(['senderId', 'receiverId']);

  res.status(200).json({
    success: true,
    data: message,
    message: 'Message edited successfully',
  });
});

/**
 * Delete a message sent by the authenticated user.
 * Only the sender can delete their own messages.
 * Implements soft delete to preserve audit trail.
 * @async
 * @route DELETE /api/messages/:messageId
 * @access Private (requires authentication, only sender)
 * @param {Object} req - Express request object
 * @param {String} req.params.messageId - ID of message to delete
 * @param {Object} req.user - Authenticated user
 * @returns {Object} Success response with deleted message info
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if already deleted
  if (message.isDeleted) {
    res.status(410); // Gone status
    throw new Error('Message already deleted');
  }

  // Verify sender is the one deleting
  if (message.senderId.toString() !== userId.toString()) {
    res.status(403); // Forbidden status
    throw new Error('You can only delete your own messages');
  }

  // Soft delete: mark as deleted but preserve data
  message.isDeleted = true;
  message.deletedAt = new Date();
  // Clear text for privacy (optional, remove if you want to keep deleted text)
  // message.text = '[Message deleted by sender]';
  await message.save();

  res.status(200).json({
    success: true,
    data: {
      messageId: message._id,
      isDeleted: true,
      deletedAt: message.deletedAt,
    },
    message: 'Message deleted successfully',
  });
});

module.exports = { sendMessage, getMessages, editMessage, deleteMessage };


