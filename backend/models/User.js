/**
 * @file models/User.js
 * @description User schema and model definition.
 * Handles user data structure, password hashing, and authentication methods.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * @typedef {Object} User
 * @property {String} name - User's display name (required)
 * @property {String} email - User's email address (required, unique)
 * @property {String} password - Hashed password (required)
 * @property {String} profilePic - URL to user's profile picture (optional)
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: [true, 'Email already registered'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Exclude from default queries
    },
    profilePic: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to hash password before storing.
 * Only hashes if password is new or modified.
 */
userSchema.pre('save', async function () {
  // If password is not modified, skip hashing
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to compare candidate password with hashed password.
 * @async
 * @param {String} enteredPassword - Plain text password to compare
 * @returns {Promise<Boolean>} True if passwords match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

