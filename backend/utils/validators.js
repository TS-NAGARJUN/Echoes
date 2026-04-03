/**
 * @file utils/validators.js
 * @description Reusable validation functions.
 * Centralizes input validation logic to prevent duplication.
 */

const { REGEX, ERROR_MESSAGES } = require('./constants');

/**
 * Validate email format.
 * @param {String} email - Email address to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!REGEX.EMAIL.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  return { isValid: true };
};

/**
 * Validate password strength.
 * @param {String} password - Password to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }
  return { isValid: true };
};

/**
 * Validate user registration input.
 * @param {Object} data - Object containing name, email, password
 * @returns {Object} { isValid: boolean, errors?: Object }
 */
const validateRegistration = (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    ...(Object.keys(errors).length > 0 && { errors }),
  };
};

/**
 * Validate login input.
 * @param {Object} data - Object containing email, password
 * @returns {Object} { isValid: boolean, errors?: Object }
 */
const validateLogin = (data) => {
  const errors = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    ...(Object.keys(errors).length > 0 && { errors }),
  };
};

/**
 * Validate message input.
 * @param {Object} data - Object containing text and optional attachments
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateMessage = (data) => {
  if (!data.text || data.text.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.EMPTY_MESSAGE };
  }

  if (typeof data.text !== 'string') {
    return { isValid: false, error: 'Message must be text' };
  }

  // Check max length (5000 characters)
  if (data.text.length > 5000) {
    return { isValid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { isValid: true };
};

/**
 * Validate MongoDB ObjectId format.
 * @param {String} id - ID to validate
 * @returns {Boolean} True if valid ObjectId format
 */
const validateMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
  validateMessage,
  validateMongoId,
};
