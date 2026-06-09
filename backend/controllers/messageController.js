/**
 * @file controllers/messageController.js
 * @description Message controller.
 * Handles message sending, retrieval, editing, deletion, and emoji reactions.
 */

const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../socket');

/**
 * Send a new message from authenticated user to another user.
 * Supports optional replyTo snapshot for reply context.
 * @async
 * @route POST /api/messages
 * @access Private (requires authentication)
 * @param {Object} req.body.senderId   - ID of message sender
 * @param {Object} req.body.receiverId - ID of message receiver
 * @param {String} req.body.text       - Message content
 * @param {Object} [req.body.replyTo]  - Optional reply context
 * @param {String} req.body.replyTo.messageId  - Original message ID
 * @param {String} req.body.replyTo.text       - Snapshot of original text
 * @param {String} req.body.replyTo.senderId   - Original sender ID
 * @param {String} req.body.replyTo.senderName - Original sender display name
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, text, replyTo } = req.body;

  // ── Validate required fields ──────────────────────────────────────────────
  if (!senderId || !receiverId || !text) {
    res.status(400);
    throw new Error('Sender ID, Receiver ID, and message text are required');
  }

  if (text.trim().length === 0) {
    res.status(400);
    throw new Error('Message cannot be empty');
  }

  if (senderId === receiverId) {
    res.status(400);
    throw new Error('Cannot send message to yourself');
  }

  // ── Verify both users exist ───────────────────────────────────────────────
  const [senderExists, receiverExists] = await Promise.all([
    User.findById(senderId),
    User.findById(receiverId),
  ]);

  if (!senderExists || !receiverExists) {
    res.status(404);
    throw new Error('Sender or receiver not found');
  }

  // ── Validate replyTo if provided ──────────────────────────────────────────
  let replyToData = null;
  if (replyTo) {
    const { messageId, text: replyText, senderId: replySenderId, senderName } = replyTo;

    if (!messageId || !replyText || !replySenderId || !senderName) {
      res.status(400);
      throw new Error('replyTo must include messageId, text, senderId, and senderName');
    }

    // Confirm original message exists and is not deleted
    const originalMessage = await Message.findOne({
      _id: messageId,
      isDeleted: false,
    });

    if (!originalMessage) {
      res.status(404);
      throw new Error('Original message not found or has been deleted');
    }

    replyToData = {
      messageId,
      text: replyText.slice(0, 500), // enforce snapshot max length
      senderId: replySenderId,
      senderName,
    };
  }

  // ── Create message ────────────────────────────────────────────────────────
  const message = await Message.create({
    senderId,
    receiverId,
    text: text.trim(),
    replyTo: replyToData,
  });

  await message.populate([
    { path: 'senderId',   select: 'name email profilePic' },
    { path: 'receiverId', select: 'name email profilePic' },
  ]);

  res.status(201).json({
    success: true,
    data: message,
  });
});

/**
 * Get all messages in a conversation between logged-in user and a specific user.
 * Sorted oldest first. Excludes soft-deleted messages.
 * @async
 * @route GET /api/messages/:userId
 * @access Private (requires authentication)
 */
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const userExists = await User.findById(userId);
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }

  const messages = await Message.find({
    $and: [
      {
        $or: [
          { senderId: myId,   receiverId: userId },
          { senderId: userId, receiverId: myId   },
        ],
      },
      { isDeleted: false },
    ],
  })
    .populate('senderId',   'name email profilePic')
    .populate('receiverId', 'name email profilePic')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

/**
 * Edit a message sent by the authenticated user.
 * Only the sender can edit. Marks message as edited with timestamp.
 * @async
 * @route PUT /api/messages/:messageId
 * @access Private (requires authentication, only sender)
 */
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.isDeleted) {
    res.status(410);
    throw new Error('Cannot edit a deleted message');
  }

  if (message.senderId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('You can only edit your own messages');
  }

  // Optional: Prevent editing messages older than 24 hours
  // const editWindow = 24 * 60 * 60 * 1000;
  // if (Date.now() - message.createdAt.getTime() > editWindow) {
  //   res.status(400);
  //   throw new Error('Cannot edit messages older than 24 hours');
  // }

  message.text = text.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate([
    { path: 'senderId',   select: 'name email profilePic' },
    { path: 'receiverId', select: 'name email profilePic' },
  ]);

  // ── Real-time broadcast (REST-driven edit) ─────────────────────────────────
  try {
    const io = getIO();
    const payload = {
      messageId: message._id.toString(),
      newText: message.text,
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      editedAt: message.editedAt,
    };
    io.to(payload.senderId).emit('messageEdited', payload);
    io.to(payload.receiverId).emit('messageEdited', payload);
  } catch (socketErr) {
    // Socket not initialized (e.g. tests) — non-fatal
    console.warn('Socket emit skipped:', socketErr.message);
  }

  res.status(200).json({
    success: true,
    data: message,
    message: 'Message edited successfully',
  });
});

/**
 * Soft-delete a message sent by the authenticated user.
 * Only the sender can delete. Preserves data for audit trail.
 * @async
 * @route DELETE /api/messages/:messageId
 * @access Private (requires authentication, only sender)
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.isDeleted) {
    res.status(410);
    throw new Error('Message already deleted');
  }

  if (message.senderId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('You can only delete your own messages');
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  // Optionally clear text for privacy:
  // message.text = '[Message deleted]';
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

/**
 * Add, change, or remove an emoji reaction on a message.
 *
 * Rules:
 *   - User has no reaction       → ADD it
 *   - User sends the SAME emoji  → REMOVE it (toggle off)
 *   - User sends DIFFERENT emoji → REPLACE old one
 *
 * @async
 * @route POST /api/messages/:messageId/react
 * @access Private (requires authentication)
 * @param {String} req.params.messageId - ID of message to react to
 * @param {String} req.body.emoji       - Emoji character e.g. "👍"
 * @returns {Array} Updated reactions array for the message
 */
const reactToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  // ── Validate emoji ────────────────────────────────────────────────────────
  if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
    res.status(400);
    throw new Error('A valid emoji is required');
  }

  // ── Find message ──────────────────────────────────────────────────────────
  const message = await Message.findOne({ _id: messageId, isDeleted: false });
  if (!message) {
    res.status(404);
    throw new Error('Message not found or has been deleted');
  }

  // ── Upsert / remove reaction ──────────────────────────────────────────────
  const existingIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === userId.toString(),
  );

  if (existingIndex === -1) {
    // No existing reaction → ADD
    message.reactions.push({
      userId,
      emoji: emoji.trim(),
      reactedAt: new Date(),
    });
  } else if (message.reactions[existingIndex].emoji === emoji.trim()) {
    // Same emoji → REMOVE (toggle off)
    message.reactions.splice(existingIndex, 1);
  } else {
    // Different emoji → REPLACE
    message.reactions[existingIndex].emoji = emoji.trim();
    message.reactions[existingIndex].reactedAt = new Date();
  }

  await message.save();

  res.status(200).json({
    success: true,
    data: message.reactions,
    message: 'Reaction updated successfully',
  });
});

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  reactToMessage,
};