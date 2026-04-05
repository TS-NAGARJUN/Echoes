/**
 * @file components/Auth/ChatLayout.jsx
 * @description Main chat layout component with sidebar and chat area
 * Combines sidebar for user selection with main chat interface
 */

import { useState } from 'react';
import { Sidebar } from '../common';
import './ChatLayout.css';

/**
 * ChatLayout Component - Main layout for chat interface
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Chat content to display
 * @param {Function} props.onUserSelect - Callback when user is selected
 * @returns {JSX.Element} Chat layout with sidebar
 */
const ChatLayout = ({ children, onUserSelect }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);

  /**
   * Handle user selection from sidebar
   */
  const handleSelectUser = (userId, userData) => {
    setSelectedUserId(userId);
    setSelectedUserData(userData);
    if (onUserSelect) {
      onUserSelect(userId, userData);
    }
  };

  return (
    <div className="chat-layout">
      {/* Sidebar - User List */}
      <div className="chat-layout-sidebar">
        <Sidebar
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
        />
      </div>

      {/* Main Chat Area */}
      <div className="chat-layout-main">
        {selectedUserData ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-user">
                {selectedUserData.profilePic ? (
                  <img
                    src={selectedUserData.profilePic}
                    alt={selectedUserData.name}
                    className="chat-header-avatar"
                  />
                ) : (
                  <div className="chat-header-avatar placeholder">
                    {selectedUserData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="chat-header-info">
                  <h3 className="chat-header-name">
                    {selectedUserData.name}
                  </h3>
                  <p className="chat-header-email">
                    {selectedUserData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            <div className="chat-content">
              {children}
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="empty-state-icon">💬</div>
            <h2>Select a user to start chatting</h2>
            <p>Choose someone from the sidebar to begin your conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
