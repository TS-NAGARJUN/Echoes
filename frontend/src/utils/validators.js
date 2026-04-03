/**
 * @file utils/validators.js
 * @description Form validation utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return '';
};

/**
 * Validate name
 */
export const validateName = (name) => {
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return '';
};

/**
 * Validate register form
 */
export const validateRegisterForm = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Name is required';
  } else {
    const nameError = validateName(values.name);
    if (nameError) errors.name = nameError;
  }

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else {
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};
