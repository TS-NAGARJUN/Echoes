import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { useFilteredUsers } from '../../hooks/useFilteredUsers';
import UsersList from './UsersList';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hooks for data management
  const { allUsers, loading, error } = useUsers();
  const { filteredUsers, onlineUserIds } = useFilteredUsers(
    allUsers,
    user,
    searchQuery,
    onlineUsers
  );

  const totalUsers = Array.isArray(allUsers) && allUsers.length > 0 ? allUsers.length - 1 : 0;

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
          <UsersList
            filteredUsers={filteredUsers}
            onlineUserIds={onlineUserIds}
            selectedUserId={selectedUserId}
            onSelectUser={onSelectUser}
          />
        )}
      </div>
      <div className="sidebar-footer">
        <p className="user-count">
          Total: {totalUsers} users
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
