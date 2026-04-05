/**
 * @file components/common/Sidebar.jsx
 * @description Sidebar component displaying online users with scrolling
 * Shows all connected users with online status indicator
 */

import { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import './Sidebar.css';

/**
 * Sidebar Component - Displays list of online users
 * @param {Object} props - Component props
 * @param {string} props.selectedUserId - Currently selected user ID
 * @param {Function} props.onSelectUser - Callback when user is selected
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = ({ selectedUserId, onSelectUser }) => {
  const { user } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all users from the database
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Sidebar] Fetching users from database...');
        const response = await api.get('/users');
        console.log('[Sidebar] API Response:', response);
        
        // API interceptor returns response.data which is { success, count, data: [...] }
        // So response.data is the array of users
        const usersData = Array.isArray(response?.data) ? response.data : [];
        
        console.log('[Sidebar] Users fetched:', usersData.length, usersData);
        setAllUsers(usersData);
      } catch (error) {
        console.error('[Sidebar] Error fetching users:', error.message);
        setError(error?.message || 'Failed to fetch users');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Get set of online user IDs for quick lookup - memoized to prevent infinite loops
   */
  const onlineUserIds = useMemo(
    () => new Set((onlineUsers || []).map(u => u?.userId).filter(Boolean)),
    [onlineUsers]
  );

  /**
   * Filter and sort users based on online status and search query
   */
  useEffect(() => {
    if (!Array.isArray(allUsers)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = allUsers.filter(u => u?._id !== user?._id); // Exclude current user

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u?.name?.toLowerCase?.().includes(query) ||
        u?.email?.toLowerCase?.().includes(query)
      );
    }

    // Sort: online users first, then by name
    filtered.sort((a, b) => {
      const aOnline = onlineUserIds.has(a?._id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b?._id) ? 1 : 0;
      if (bOnline !== aOnline) return bOnline - aOnline;
      return (a?.name || '').localeCompare(b?.name || '');
    });

    setFilteredUsers(filtered);
  }, [allUsers, searchQuery, onlineUserIds, user?._id]);

  /**
   * Render user item component
   */
  const UserItem = ({ userData }) => {
    if (!userData?._id) return null;

    const isOnline = onlineUserIds.has(userData._id);
    const isSelected = selectedUserId === userData._id;
    const userInitial = (userData?.name || 'U').charAt(0).toUpperCase();

    return (
      <div
        className={`sidebar-user-item ${isSelected ? 'active' : ''}`}
        onClick={() => onSelectUser(userData._id, userData)}
      >
        <div className="user-item-avatar">
          {userData?.profilePic ? (
            <img src={userData.profilePic} alt={userData?.name || 'User'} />
          ) : (
            <div className="avatar-placeholder">
              {userInitial}
            </div>
          )}
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
        </div>

        <div className="user-item-content">
          <div className="user-name">{userData?.name || 'Unknown'}</div>
          <div className="user-email">{userData?.email || 'no-email'}</div>
        </div>

        <div className="user-status">
          {isOnline && <span className="status-badge">Online</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar-container">
      {/* Header */}
      <div className="sidebar-header">
        <h2>Messages</h2>
        <div className="connection-status">
          <div className={`status-dot ${isConnected === true ? 'connected' : isConnected === false ? 'disconnected' : 'checking'}`} />
          <span>
            {isConnected === true ? 'Connected' : isConnected === false ? 'Connecting...' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Users list with scroll */}
      <div className="sidebar-users-scroll">
        {loading ? (
          <div className="loading-state">
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchQuery ? 'No users found' : 'No users available'}
            </p>
          </div>
        ) : (
          <div className="users-list">
            {/* Online users section */}
            {filteredUsers.some(u => u?._id && onlineUserIds.has(u._id)) && (
              <>
                <div className="users-section-header">
                  <span>Online ({filteredUsers.filter(u => u?._id && onlineUserIds.has(u._id)).length})</span>
                </div>
                {filteredUsers
                  .filter(u => u?._id && onlineUserIds.has(u._id))
                  .map(userData => userData?._id && (
                    <UserItem key={userData._id} userData={userData} />
                  ))}
              </>
            )}

            {/* Offline users section */}
            {filteredUsers.some(u => u?._id && !onlineUserIds.has(u._id)) && (
              <>
                <div className="users-section-header">
                  <span>Offline ({filteredUsers.filter(u => u?._id && !onlineUserIds.has(u._id)).length})</span>
                </div>
                {filteredUsers
                  .filter(u => u?._id && !onlineUserIds.has(u._id))
                  .map(userData => userData?._id && (
                    <UserItem key={userData._id} userData={userData} />
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="user-count">
          Total: {Array.isArray(allUsers) && allUsers.length > 0 ? allUsers.length - 1 : 0} users
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
