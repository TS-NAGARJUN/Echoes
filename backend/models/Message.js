/**
 * @file models/Message.js
 * @description Message schema and model definition.
 * Stores individual chat messages with sender/receiver references,
 * reply context (snapshot), and emoji reactions.
 */

const mongoose = require('mongoose');

/**
 * ReplyTo Sub-Schema
 * Snapshot of the original message at reply time.
 * Stored as a snapshot so quotes survive edits/deletes of the original.
 */
const replyToSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Reply preview text cannot exceed 500 characters'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

/**
 * Reaction Sub-Schema
 * Each entry = one user's reaction on this message.
 * A user can only have ONE active emoji per message (upserted by userId).
 *
 * @property {ObjectId} userId    - Who reacted
 * @property {String}   emoji     - The emoji character e.g. "👍"
 * @property {Date}     reactedAt - When they reacted
 */
const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
      maxlength: [10, 'Emoji value too long'],
    },
    reactedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

/**
 * Message Schema
 *
 * @property {ObjectId}    senderId   - User who sent the message
 * @property {ObjectId}    receiverId - User who receives the message
 * @property {String}      text       - Message content
 * @property {ReplyTo}     replyTo    - Optional reply snapshot (null for top-level)
 * @property {Reaction[]}  reactions  - Array of emoji reactions
 * @property {Boolean}     isEdited   - Was the message edited?
 * @property {Date}        editedAt   - When it was last edited
 * @property {Boolean}     isDeleted  - Soft delete flag
 * @property {Date}        deletedAt  - When it was soft-deleted
 * @property {Date}        createdAt  - Auto timestamp
 * @property {Date}        updatedAt  - Auto timestamp
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

    // ── Reply context ──────────────────────────────────────────────────────
    replyTo: {
      type: replyToSchema,
      default: null,
    },

    // ── Emoji reactions ────────────────────────────────────────────────────
    // One entry per user. Use the route to upsert/remove so a user
    // always has at most one active emoji per message.
    reactions: {
      type: [reactionSchema],
      default: [],
    },

    // ── Edit tracking ──────────────────────────────────────────────────────
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },

    // ── Soft delete tracking ───────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────────────────
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ 'replyTo.messageId': 1 }); // fetch all replies to a message
messageSchema.index({ 'reactions.userId': 1 });   // fetch all messages a user reacted to

module.exports = mongoose.model('Message', messageSchema);