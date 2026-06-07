/**
 * @file server.js
 * @description Main entry point for the real-time chat backend server.
 * Initializes Express app, connects to MongoDB, and sets up Socket.io for real-time messaging.
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { initSocket } = require('./socket');
const { config, validateConfig } = require('./config/config');

const app = express();

// ============= MIDDLEWARE SETUP =============

// Enable CORS for frontend communication
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// ============= ROUTES SETUP =============

// Root health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
  });
});

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

// Validate required env vars early
validateConfig();

// Debug: show if MONGO_URI is present (mask password for safety)
const rawMongo = process.env.MONGO_URI || '<missing>';
let maskedMongo = rawMongo;
try {
  maskedMongo = rawMongo.replace(/\/\/(.+?):(.+?)@/, '//$1:*****@');
} catch (e) {}
console.log(`\n🔎 Using MONGO_URI: ${maskedMongo}\n`);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Create HTTP server wrapper for Socket.io
    const server = http.createServer(app);

    // Initialize Socket.io for real-time messaging
    initSocket(server);

    // Start listening on specified port and bind to all interfaces for Render
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  })
  .catch((err) => {
    console.error('FULL ERROR:');
    console.error(err);
    console.error('NAME:', err.name);
    console.error('MESSAGE:', err.message);
    console.error('CAUSE:', err.cause);
    process.exit(1);
  });
