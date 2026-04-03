/**
 * @file hooks/useLogin.js
 * @description Custom hook for login logic
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useForm } from './useForm';
import { validateLoginForm, validateEmail } from '../utils/validators';
import api from '../utils/api';

export const useLogin = () => {
  const { storeAuthData, setError, setLoading } = useAuth();

  const handleLoginSubmit = useCallback(
    async (values) => {
      // Validate form
      const validationErrors = validateLoginForm(values);
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, error]) => {
          form.setFieldError(field, error);
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        });

        if (response.success) {
          storeAuthData(response.data, response.data.token);
          // Redirect handled by parent component
          return response.data;
        }
      } catch (error) {
        setError(error.message);
        form.setFieldError('email', error.message);
      } finally {
        setLoading(false);
      }
    },
    [storeAuthData, setError, setLoading]
  );

  const form = useForm(
    {
      email: '',
      password: '',
    },
    handleLoginSubmit
  );

  return {
    ...form,
    submitLogin: handleLoginSubmit,
  };
};
