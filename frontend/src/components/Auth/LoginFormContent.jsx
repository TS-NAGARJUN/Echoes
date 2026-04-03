/**
 * @file components/Auth/LoginFormContent.jsx
 * @description Login form with all fields and validation
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { useAuth } from '../../hooks/useAuth';
import LoginFormField from './LoginFormField';
import { IconMail, IconLock, IconEye } from './icons';

const LoginFormContent = () => {
  const navigate = useNavigate();
  const { error: authError, isAuthenticated } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <div className="lp-form-wrap">
      {/* Header */}
      <div className="lp-form-header fade-up">
        <h1>
          Sign <span>in</span>
        </h1>
        <p>Welcome back — your chats are waiting.</p>
      </div>

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
          className="delay-1"
        />

        {/* Password Field */}
        <LoginFormField
          label="Password"
          type={showPwd ? 'text' : 'password'}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password"
          icon={IconLock}
          error={errors.password}
          touched={touched.password}
          className="delay-2"
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

        {/* Extras Row */}
        <div className="lp-extras fade-up delay-3">
          <label className="lp-remember">
            <input type="checkbox" />
            Remember me
          </label>
          <Link to="/forgot-password" className="lp-forgot">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="lp-btn fade-up delay-4"
          disabled={isSubmitting}
        >
          <div className="lp-btn-shimmer" />
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Footer */}
      <p className="lp-footer fade-up delay-5">
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
};

export default LoginFormContent;
