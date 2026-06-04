import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './Home.css';

/**
 * Home Component - Main chat application layout
 * Full-screen chat interface with sidebar and chat window
 */
const Home = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (userId, userData) => {
    setSelectedUserId(userId);
    setSelectedUser(userData);
  };

  return (
    <div className="home-container">
      <div className="chat-wrapper">
        <aside className="chat-sidebar">
          <Sidebar
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main-content">
          {selectedUserId && selectedUser ? (
            <ChatWindow
              selectedUserId={selectedUserId}
              selectedUser={selectedUser}
            />
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2>Select a user to start messaging</h2>
                <p>Choose a contact from the list to begin your conversation</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
