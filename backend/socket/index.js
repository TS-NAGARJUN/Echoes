/**
 * @file socket/index.js
 * @description Socket.io initialization and real-time messaging handlers.
 * Manages WebSocket connections and real-time message delivery.
 */

const { Server } = require('socket.io');
const { setupMessageEvents } = require('./messageEvents');
const { config } = require('../config/config');

let io;

// Track online users - Maps userId to socket details
const onlineUsers = new Map();

/**
 * Initialize Socket.io server for real-time communication.
 * Sets up connection handlers and message event listeners.
 * @param {http.Server} server - HTTP server instance from Express
 * @returns {void}
 */
const initSocket = (server) => {
  // Create Socket.io server with CORS configuration
  // Handle comma-separated origins from env variable (split into array if needed)
  let corsOrigin = config.corsOrigin || '*';
  if (corsOrigin.includes(',')) {
    corsOrigin = corsOrigin.split(',').map((origin) => origin.trim());
  }

  // Debug: show CORS origin(s) used for socket.io
  console.log('Socket.io CORS origin:', corsOrigin);

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
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
     * Expected payload: { userId: string, userData: object }
     */
    socket.on('join', (data) => {
      const userId = typeof data === 'string' ? data : data.userId;
      const userData = typeof data === 'object' ? data.userData : null;

      // Join user to their personal room
      socket.join(userId);
      socket.userId = userId;

      // Track user as online
      onlineUsers.set(userId, {
        socketId: socket.id,
        userId,
        userData,
        joinedAt: new Date(),
      });

      console.log(`✓ User ${userId} joined room. Online users: ${onlineUsers.size}`);

      // Send current online users list to the newly connected user
      socket.emit('userJoined', {
        userId,
        userData,
        onlineUsers: Array.from(onlineUsers.values()),
      });

      // Broadcast to all other clients that a new user joined
      socket.broadcast.emit('userJoined', {
        userId,
        userData,
        onlineUsers: Array.from(onlineUsers.values()),
      });
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
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`✗ Socket disconnected: ${socket.id}. User ${userId} went offline. Online users: ${onlineUsers.size}`);

        // Broadcast updated user list to all remaining clients
        io.emit('userLeft', {
          userId,
          onlineUsers: Array.from(onlineUsers.values()),
        });
      }
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

/**
 * Get current online users
 * @returns {Array} Array of online user objects
 */
const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

module.exports = { initSocket, getIO, getOnlineUsers };
