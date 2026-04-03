/**
 * @file socket/messageEvents.js
 * @description Socket.io event handlers for real-time message operations.
 * Handles message editing, deletion, and broadcast notifications.
 */

const Message = require('../models/Message');

/**
 * Register message event handlers on socket instance.
 * @param {Server} io - Socket.io server instance
 * @param {Socket} socket - Client socket instance
 */
const setupMessageEvents = (io, socket) => {
  /**
   * Handle message edited event.
   * Broadcast the edited message to both sender and receiver.
   * Event: messageEdited
   * Expected payload: {
   *   messageId: string,
   *   newText: string,
   *   senderId: string,
   *   receiverId: string,
   *   editedAt: Date
   * }
   */
  socket.on('messageEdited', async (data) => {
    try {
      const { messageId, newText, senderId, receiverId, editedAt } = data;

      // Fetch updated message from database for full details
      const message = await Message.findById(messageId)
        .populate('senderId', 'name email profilePic')
        .populate('receiverId', 'name email profilePic');

      if (message) {
        // Broadcast to both parties in the conversation
        // Emit to sender
        io.to(senderId).emit('messageEdited', {
          messageId,
          text: newText,
          isEdited: true,
          editedAt,
          updatedMessage: message,
        });

        // Emit to receiver
        io.to(receiverId).emit('messageEdited', {
          messageId,
          text: newText,
          isEdited: true,
          editedAt,
          updatedMessage: message,
        });

        console.log(`✓ Message ${messageId} edited by ${senderId}`);
      }
    } catch (error) {
      console.error(`Socket error on messageEdited: ${error.message}`);
      socket.emit('error', { message: 'Failed to update message' });
    }
  });

  /**
   * Handle message deleted event.
   * Broadcast deletion to both sender and receiver.
   * Event: messageDeleted
   * Expected payload: {
   *   messageId: string,
   *   senderId: string,
   *   receiverId: string,
   *   deletedAt: Date
   * }
   */
  socket.on('messageDeleted', async (data) => {
    try {
      const { messageId, senderId, receiverId, deletedAt } = data;

      // Verify message exists and is marked as deleted
      const message = await Message.findById(messageId);
      if (message && message.isDeleted) {
        // Broadcast to both parties in the conversation
        // Emit to sender
        io.to(senderId).emit('messageDeleted', {
          messageId,
          isDeleted: true,
          deletedAt,
        });

        // Emit to receiver
        io.to(receiverId).emit('messageDeleted', {
          messageId,
          isDeleted: true,
          deletedAt,
        });

        console.log(`✓ Message ${messageId} deleted by ${senderId}`);
      }
    } catch (error) {
      console.error(`Socket error on messageDeleted: ${error.message}`);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });
};

module.exports = { setupMessageEvents };
