/**
 * @file utils/constants.js
 * @description Application-wide constants.
 * Centralizes magic numbers, messages, and configuration values.
 */

// ============= PASSWORD CONSTANTS =============
const PASSWORD = {
  MIN_LENGTH: 6,
  SALT_ROUNDS: 10,
};

// ============= JWT CONSTANTS =============
const JWT = {
  EXPIRY: '30d',
  ERROR_MESSAGES: {
    EXPIRED: 'Token expired',
    INVALID: 'Invalid token',
    MISSING: 'No token provided',
    MALFORMED: 'Malformed token',
  },
};

// ============= HTTP STATUS CODES =============
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// ============= ERROR MESSAGES =============
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already registered with this email',
  USER_NOT_FOUND: 'User not found',

  // Validation
  MISSING_FIELDS: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD.MIN_LENGTH} characters`,
  EMPTY_MESSAGE: 'Message cannot be empty',
  CANNOT_MESSAGE_SELF: 'Cannot send message to yourself',

  // Authorization
  NOT_AUTHORIZED: 'Not authorized to access this resource',
  NO_TOKEN: 'No token provided in Authorization header',
  TOKEN_INVALID: 'Invalid or expired token',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found',
};

// ============= SUCCESS MESSAGES =============
const SUCCESS_MESSAGES = {
  REGISTERED: 'User registered successfully',
  LOGGED_IN: 'Logged in successfully',
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGES_RETRIEVED: 'Messages retrieved successfully',
  USERS_RETRIEVED: 'Users retrieved successfully',
};

// ============= DATABASE LIMITS =============
const DB_LIMITS = {
  MESSAGE_PAGE_SIZE: 50,
  USER_PAGE_SIZE: 100,
  MAX_MESSAGE_LENGTH: 5000,
};

// ============= SOCKET EVENTS =============
const SOCKET_EVENTS = {
  // Client to Server
  JOIN: 'join',
  NEW_MESSAGE: 'newMessage',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  DISCONNECT: 'disconnect',

  // Server to Client
  MESSAGE: 'message',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  TYPING: 'userTyping',
  STOPPED_TYPING: 'userStoppedTyping',
};

// ============= REGEX PATTERNS =============
const REGEX = {
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

module.exports = {
  PASSWORD,
  JWT,
  STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DB_LIMITS,
  SOCKET_EVENTS,
  REGEX,
};
