/**
 * @file hooks/useRegister.js
 * @description Custom hook for registration logic
 */

import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useForm } from './useForm';
import { validateRegisterForm } from '../utils/validators';
import api from '../utils/api';

export const useRegister = () => {
  const { storeAuthData, setError, setLoading } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegisterSubmit = useCallback(
    async (values) => {
      // Validate form
      const validationErrors = validateRegisterForm(values);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, error]) => {
          form.setFieldError(field, error);
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/register', {
          name: values.name,
          email: values.email,
          password: values.password,
          profilePic: values.profilePic || null,
        });

        if (response.success) {
          const successMsg = `✓ ${values.name} registered successfully! You are now logged in and will be redirected to the home page.`;
          setSuccessMessage(successMsg);
          storeAuthData(response.data, response.data.token);
          // Redirect handled by parent component
          return response.data;
        }
      } catch (error) {
        setError(error.message);
        // Handle specific field errors
        if (error.message.includes('already registered')) {
          form.setFieldError('email', error.message);
        } else {
          form.setFieldError('email', error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [storeAuthData, setError, setLoading]
  );

  const form = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePic: '',
    },
    handleRegisterSubmit
  );

  return {
    ...form,
    submitRegister: handleRegisterSubmit,
    successMessage,
    setSuccessMessage,
  };
};
