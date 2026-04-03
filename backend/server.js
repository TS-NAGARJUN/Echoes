/**
 * @file server.js
 * @description Main entry point for the real-time chat backend server.
 * Initializes Express app, connects to MongoDB, and sets up Socket.io for real-time messaging.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { initSocket } = require('./socket');

const app = express();

// ============= MIDDLEWARE SETUP =============

// Enable CORS for frontend communication
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// ============= ROUTES SETUP =============

// Authentication routes (register, login)
app.use('/api/auth', authRoutes);

// User routes (get all users)
app.use('/api/users', userRoutes);

// Message routes (send, retrieve messages)
app.use('/api/messages', messageRoutes);

// ============= ERROR HANDLING =============

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

// ============= SERVER INITIALIZATION =============

const PORT = process.env.PORT || 5000;

/**
 * Start server and connect to database
 */
connectDB().then(() => {
  // Create HTTP server wrapper for Socket.io
  const server = http.createServer(app);

  // Initialize Socket.io for real-time messaging
  initSocket(server);

  // Start listening on specified port
  server.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
});
