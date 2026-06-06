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
        // Attach a client debug id to correlate with server logs
        let clientId = localStorage.getItem('clientDebugId');
        if (!clientId) {
          clientId = `client_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          localStorage.setItem('clientDebugId', clientId);
        }
        console.log('[useUsers] Fetching users from database...', { clientId, time: new Date().toISOString() });
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