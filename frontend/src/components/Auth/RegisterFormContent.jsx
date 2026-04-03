/**
 * @file components/Auth/RegisterFormContent.jsx
 * @description Register form with all fields and validation
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import { useAuth } from '../../hooks/useAuth';
import LoginFormField from './LoginFormField';
import { IconMail, IconLock, IconEye } from './icons';

const RegisterFormContent = () => {
  const navigate = useNavigate();
  const { error: authError } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    successMessage,
    setSuccessMessage,
  } = useRegister();

  // Redirect after successful registration to home
  useEffect(() => {
    if (successMessage) {
      navigate('/home');
    }
  }, [successMessage, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="lp-form-wrap">
      {/* Header */}
      <div className="lp-form-header fade-up">
        <h1>
          Create <span>account</span>
        </h1>
        <p>Join us today to start chatting.</p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div
          className="fade-up"
          style={{
            background: 'rgba(76,175,80,0.1)',
            border: '1px solid rgba(76,175,80,0.3)',
            borderRadius: 12,
            padding: '16px 18px',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#66BB6A',
            marginBottom: '1.25rem',
            animation: 'slideDown 0.3s ease-out',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error Banner */}
      {authError && (
        <div
          className="fade-up"
          style={{
            background: 'rgba(226,75,74,0.1)',
            border: '1px solid rgba(226,75,74,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: '#f09595',
            marginBottom: '1.25rem',
          }}
        >
          {authError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} noValidate>
        {/* Username Field */}
        <LoginFormField
          label="Username"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your username"
          error={errors.name}
          touched={touched.name}
          className="delay-1"
        />

        {/* Email Field */}
        <LoginFormField
          label="Email address"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          icon={IconMail}
          error={errors.email}
          touched={touched.email}
          className="delay-2"
        />

        {/* Password Field */}
        <LoginFormField
          label="Password"
          type={showPwd ? 'text' : 'password'}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Create a password"
          icon={IconLock}
          error={errors.password}
          touched={touched.password}
          className="delay-3"
          rightElement={
            <button
              type="button"
              className="lp-pwd-toggle"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              <IconEye off={showPwd} />
            </button>
          }
        />

        {/* Confirm Password Field */}
        <LoginFormField
          label="Confirm password"
          type={showConfirmPwd ? 'text' : 'password'}
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Confirm your password"
          icon={IconLock}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          className="delay-4"
          rightElement={
            <button
              type="button"
              className="lp-pwd-toggle"
              onClick={() => setShowConfirmPwd((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirmPwd ? 'Hide password' : 'Show password'}
            >
              <IconEye off={showConfirmPwd} />
            </button>
          }
        />

        {/* Terms and Conditions */}
        <div className="lp-extras fade-up delay-5">
          <label className="lp-terms">
            <input type="checkbox" required />
            <span>I agree to the <Link to="/terms" className="lp-link">Terms and Conditions</Link></span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="lp-btn fade-up delay-6"
          disabled={isSubmitting}
        >
          <div className="lp-btn-shimmer" />
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {/* Footer */}
      <p className="lp-footer fade-up delay-7">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterFormContent;