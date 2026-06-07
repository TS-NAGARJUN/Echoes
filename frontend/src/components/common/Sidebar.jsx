import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Use custom hooks for data management
  const { allUsers, loading, error } = useUsers();
  const { filteredUsers, onlineUserIds } = useFilteredUsers(
    allUsers,
    user,
    searchQuery,
    onlineUsers
  );

  const totalUsers = Array.isArray(allUsers) && allUsers.length > 0 ? allUsers.length - 1 : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <UsersList
            filteredUsers={filteredUsers}
            onlineUserIds={onlineUserIds}
            selectedUserId={selectedUserId}
            onSelectUser={onSelectUser}
          />
        )}
      </div>
      
      {/* Footer with user info and logout */}
      <div className="sidebar-footer">
        <p className="user-count">
          Total: {totalUsers} users
        </p>
        <div className="sidebar-user-section">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.name} />
              ) : (
                <div className="avatar-placeholder-small">{(user?.name || 'U')[0].toUpperCase()}</div>
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <button
              className="more-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More options"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
          {showMoreMenu && (
            <div className="more-menu">
              <button className="menu-item logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
