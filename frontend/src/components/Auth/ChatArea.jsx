/**
 * @file components/Auth/ChatArea.jsx
 * @description Chat area component for displaying messages and message input
 */

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import './ChatArea.css';

/**
 * ChatArea Component - Displays messages and handles input
 * @param {Object} props - Component props
 * @param {string} props.receiverId - ID of the recipient user
 * @param {Object} props.receiverData - Receiver user data
 * @returns {JSX.Element} Chat area component
 */
const ChatArea = ({ receiverId, receiverData }) => {
  const { user } = useAuth();
  const { socket, sendMessage, emitTyping, emitStoppedTyping } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle incoming messages via socket
   */
  useEffect(() => {
    if (!socket || !receiverId) return;

    const handleMessage = (message) => {
      if (message.senderId === receiverId || message.receiverId === user?._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket, receiverId, user?._id]);

  /**
   * Handle typing indicator
   */
  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessageText(text);

    if (text && !isTyping) {
      setIsTyping(true);
      emitTyping(receiverId);
    }

    // Reset typing state after 1 second of no activity
    clearTimeout(typingTimeoutRef.current);
    if (text) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        emitStoppedTyping(receiverId);
      }, 1000);
    }
  };

  /**
   * Send message
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !receiverId || !user) return;

    const message = {
      text: messageText,
      senderId: user._id,
      receiverId,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Add message to local state
    setMessages(prev => [...prev, message]);

    // Send via socket
    sendMessage(message);

    // Clear input
    setMessageText('');
    setIsTyping(false);
    emitStoppedTyping(receiverId);
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-area">
      {/* Messages container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(msg => (
              <div
                key={msg._id}
                className={`message ${
                  msg.senderId === user?._id ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  <p className="message-text">{msg.text}</p>
                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={handleMessageChange}
          placeholder={`Message ${receiverData?.name || 'user'}...`}
          className="message-input"
          autoFocus
        />
        <button type="submit" className="send-button" disabled={!messageText.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.9702544,11.6889879 22.3424671,3.50612381 21.714504,2.16346091 C21.1868816,1.1208766 20.0152527,0.9637792 19.3873905,0.9637792 C18.5979217,0.9637792 17.6560444,1.27788954 16.6915026,1.89662632 L4.13399899,10.4943845 C3.34915502,10.9656767 2.40734225,11.1227741 2.40734225,11.9082609 C2.40734225,12.6315722 3.03521743,12.9456826 3.50612381,12.9456826 L16.6915026,12.4744748 Z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
