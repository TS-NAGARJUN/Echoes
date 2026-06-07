import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';
import './ChatWindow.css';
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ selectedUserId, selectedUser, onBack }) => {
  const { user } = useAuth();
  const { socket, sendMessage } = useSocket();
  const navigate = useNavigate(); // ✅ top level
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ top level — not inside useEffect or fetchMessages
  const handleCall = () => {
    if (!user?._id || !selectedUserId) return;
    const roomId = [user._id, selectedUserId].sort().join('_');
    navigate(`/video/${roomId}`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedUserId || !user?._id) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await api.get(`/messages/${selectedUserId}`);

        const fetchedMessages = response?.data || [];

        const filteredMessages = fetchedMessages.filter(msg => {
          const sender   = msg.senderId?._id   || msg.senderId;
          const receiver = msg.receiverId?._id || msg.receiverId;
          return (
            (sender === user._id && receiver === selectedUserId) ||
            (sender === selectedUserId && receiver === user._id)
          );
        });

        const normalized = filteredMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || msg.createdAt,
        }));

        setMessages(normalized);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUserId, user?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      if (
        message.receiverId === user?._id &&
        message.senderId === selectedUserId
      ) {
        setMessages((prev) => [
          ...prev,
          { ...message, timestamp: message.timestamp || message.createdAt },
        ]);
      }
    };

    socket.on('message', handleIncomingMessage);
    return () => socket.off('message', handleIncomingMessage);
  }, [socket, selectedUserId, user?._id]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmed = messageText.trim();
    if (!trimmed || !user?._id || !selectedUserId) return;

    const newMessage = {
      _id: `${Date.now()}`,
      senderId: user._id,
      receiverId: selectedUserId,
      text: trimmed,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(newMessage);

    api
      .post('/messages', {
        senderId: user._id,
        receiverId: selectedUserId,
        text: trimmed,
      })
      .catch((error) => {
        console.error('Error saving message to database:', error);
      });

    setMessageText('');
  };

  const initial = (selectedUser?.name || 'U')[0].toUpperCase();

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          {onBack && (
            <button
              className="back-btn"
              onClick={onBack}
              aria-label="Back to contacts"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}

          <div className="chat-avatar">
            {selectedUser?.profilePic ? (
              <img src={selectedUser.profilePic} alt={selectedUser.name} />
            ) : (
              <div className="avatar-placeholder">{initial}</div>
            )}
          </div>

          <div className="chat-header-info">
            <h3 className="chat-user-name">
              {selectedUser?.name || 'Unknown User'}
            </h3>
            <p className="chat-user-status">Active now</p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className="header-action-btn"
            title="Video call"
            aria-label="Video call"
            onClick={handleCall}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
            </svg>
          </button>
          <button className="header-action-btn" title="More" aria-label="More options">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages-container">
        <div className="chat-messages">
          {loadingMessages ? (
            <div className="no-messages-state">
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages-state">
              <div className="no-messages-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Start a conversation</h3>
              <p>Be the first to send a message to {selectedUser?.name}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`message ${
                  (message.senderId?._id || message.senderId) === user?._id
                    ? 'sent'
                    : 'received'
                }`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <button
            type="button"
            className="input-action-btn"
            title="Attach"
            aria-label="Attach file"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Aa"
            className="message-input"
            maxLength="1000"
            autoComplete="off"
            style={{ fontSize: '16px' }}
          />

          <button
            type="submit"
            className="send-button"
            disabled={!messageText.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16513324 C3.34915502,0.9080358 2.40734225,1.01397327 1.77946707,1.4852654 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.34915502,10.7521035 3.50612381,10.7521035 L16.6915026,11.5375905 C16.6915026,11.5375905 17.1624089,11.5375905 17.1624089,12.0088826 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;