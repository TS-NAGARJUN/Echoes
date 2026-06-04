import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[useUsers] Fetching users from database...');
        const response = await api.get('/users');
        console.log('[useUsers] API Response:', response);

        // API interceptor returns response.data which is the array of users
        const usersData = Array.isArray(response?.data) ? response.data : [];

        console.log('[useUsers] Users fetched:', usersData.length, usersData);
        setAllUsers(usersData);
      } catch (error) {
        console.error('[useUsers] Error fetching users:', error.message);
        setError(error?.message || 'Failed to fetch users');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { allUsers, loading, error };
};