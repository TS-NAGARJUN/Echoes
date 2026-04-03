/**
 * @file models/Message.js
 * @description Message schema and model definition.
 * Stores individual chat messages with sender/receiver references.
 */

const mongoose = require('mongoose');

/**
 * Message Schema
 * @typedef {Object} Message
 * @property {ObjectId} senderId - Reference to User who sent message (required)
 * @property {ObjectId} receiverId - Reference to User who receives message (required)
 * @property {String} text - Message content (required)
 * @property {Boolean} isEdited - Flag to track if message was edited
 * @property {Date} editedAt - Timestamp when message was last edited
 * @property {Boolean} isDeleted - Flag for soft delete (message preserved for audit)
 * @property {Date} deletedAt - Timestamp when message was deleted
 * @property {Date} createdAt - Message timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
    },
    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    // Soft delete tracking
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Index for efficient querying of conversations between two users.
 * Speeds up message retrieval for a specific conversation.
 */
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Message', messageSchema);

