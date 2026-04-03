/**
 * @file socket/index.js
 * @description Socket.io initialization and real-time messaging handlers.
 * Manages WebSocket connections and real-time message delivery.
 */

const { Server } = require('socket.io');
const { setupMessageEvents } = require('./messageEvents');

let io;

/**
 * Initialize Socket.io server for real-time communication.
 * Sets up connection handlers and message event listeners.
 * @param {http.Server} server - HTTP server instance from Express
 * @returns {void}
 */
const initSocket = (server) => {
  // Create Socket.io server with CORS configuration
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  /**
   * Handle new client connections
   */
  io.on('connection', (socket) => {
    console.log(`\n✓ New socket connection: ${socket.id}`);

    /**
     * Join a user to their personal room using userId.
     * This allows targeted message delivery to specific users.
     * Event: join
     * Expected payload: { userId: string }
     */
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`✓ User ${userId} joined room`);

      // Notify others that user is online
      io.emit('userOnline', { userId, status: 'online' });
    });

    /**
     * Handle incoming message and broadcast to receiver.
     * Emitted by sender when they send a message.
     * Event: newMessage
     * Expected payload: {
     *   senderId: string,
     *   receiverId: string,
     *   text: string,
     *   _id: string,
     *   createdAt: string
     * }
     */
    socket.on('newMessage', (message) => {
      const { receiverId } = message;

      // Emit message to receiver's room
      io.to(receiverId).emit('message', {
        ...message,
        status: 'received',
      });

      console.log(`✓ Message sent from ${message.senderId} to ${receiverId}`);
    });

    /**
     * Setup message-related events (edit, delete)
     */
    setupMessageEvents(io, socket);

    /**
     * Handle typing indicator for real-time feedback.
     * Event: userTyping
     * Expected payload: { userId, receiverId }
     */
    socket.on('userTyping', ({ userId, receiverId }) => {
      io.to(receiverId).emit('userTyping', { userId });
    });

    /**
     * Handle typing stopped indicator.
     * Event: userStoppedTyping
     * Expected payload: { userId, receiverId }
     */
    socket.on('userStoppedTyping', ({ userId, receiverId }) => {
      io.to(receiverId).emit('userStoppedTyping', { userId });
    });

    /**
     * Handle client disconnection.
     * Cleanup and notify other users.
     */
    socket.on('disconnect', () => {
      console.log(`✗ Socket disconnected: ${socket.id}`);

      // Notify others that user is offline
      io.emit('userOffline', { userId: socket.id, status: 'offline' });
    });

    /**
     * Handle connection errors
     */
    socket.on('error', (error) => {
      console.error(`Socket error: ${error.message}`);
    });
  });
};

/**
 * Get the Socket.io instance.
 * Used by controllers to emit events programmatically if needed.
 * @returns {Server} Socket.io server instance
 * @throws {Error} If Socket.io is not initialized
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
