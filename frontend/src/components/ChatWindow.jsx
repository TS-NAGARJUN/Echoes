import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';
import './ChatWindow.css';
import { useNavigate } from 'react-router-dom';
import MessageContextMenu from './MessageContextMenu';

const ChatWindow = ({ selectedUserId, selectedUser, onBack }) => {
  const { user } = useAuth();
  const { socket, sendMessage } = useSocket();
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const longPressTimer = useRef(null);

  // ─── Context Menu open/close ──────────────────────────────────────────────
  const openMenu = useCallback((e, message) => {
    e.preventDefault();
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    setCtxMenu({ message, position: { x, y } });
  }, []);

  const closeMenu = useCallback(() => setCtxMenu(null), []);

  // ─── Long-press (mobile) ──────────────────────────────────────────────────
  const onTouchStart = useCallback((e, message) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openMenu(
        { preventDefault: () => {}, clientX: touch.clientX, clientY: touch.clientY },
        message,
      );
    }, 500);
  }, [openMenu]);

  const onTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  // ─── Context Menu Actions ─────────────────────────────────────────────────
  const handleAction = useCallback((action, payload) => {
    switch (action) {

      case 'copy':
        navigator.clipboard.writeText(payload.text);
        break;

      case 'reply':
        setReplyingTo(payload);
        setTimeout(() => inputRef.current?.focus(), 50);
        break;

      case 'forward':
        // TODO: open forward dialog
        break;

      case 'delete':
        api
          .delete(`/messages/${payload._id}`)
          .then(() => {
            setMessages((prev) => prev.filter((m) => m._id !== payload._id));
            // ✅ Notify receiver via socket
            socket?.emit('delete_message', {
              messageId:  payload._id,
              senderId:   user?._id,
              receiverId: selectedUserId,
            });
          })
          .catch(console.error);
        break;

      case 'star':
        // TODO: toggle star
        break;

      // ✅ FIXED: react case now calls the API and updates state
      case 'react': {
        // payload = { emoji, message } from MessageContextMenu
        const { emoji, message: targetMessage } = payload;

        api
          .post(`/messages/${targetMessage._id}/react`, { emoji })
          .then(({ data }) => {
            // data.data = updated reactions array from backend
            const updatedReactions = data.data;

            // Update local message state
            setMessages((prev) =>
              prev.map((m) =>
                m._id === targetMessage._id
                  ? { ...m, reactions: updatedReactions }
                  : m,
              ),
            );

            // Broadcast reaction update to receiver via socket
            socket?.emit('react_message', {
              messageId:  targetMessage._id,
              reactions:  updatedReactions,
              senderId:   user?._id,
              receiverId: selectedUserId,
            });
          })
          .catch(console.error);
        break;
      }

      default:
        break;
    }
  }, [socket, user?._id, selectedUserId]);

  // ─── Video Call ───────────────────────────────────────────────────────────
  const handleCall = () => {
    if (!user?._id || !selectedUserId) return;
    const roomId = [user._id, selectedUserId].sort().join('_');
    navigate(`/video/${roomId}`);
  };

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Fetch history ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedUserId || !user?._id) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await api.get(`/messages/${selectedUserId}`);
        // ✅ api.get returns response.data — your backend wraps in { success, data }
        const fetched = response?.data?.data || response?.data || [];

        const filtered = fetched.filter((msg) => {
          const sender   = msg.senderId?._id   || msg.senderId;
          const receiver = msg.receiverId?._id || msg.receiverId;
          return (
            (sender === user._id && receiver === selectedUserId) ||
            (sender === selectedUserId && receiver === user._id)
          );
        });

        setMessages(
          filtered.map((msg) => ({
            ...msg,
            reactions: msg.reactions || [], // ✅ ensure reactions always an array
            timestamp: msg.timestamp || msg.createdAt,
          })),
        );
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUserId, user?._id]);

  // ─── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Incoming new message
    const handleIncoming = (message) => {
      if (
        message.receiverId === user?._id &&
        message.senderId === selectedUserId
      ) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            reactions: message.reactions || [], // ✅ ensure reactions always an array
            timestamp: message.timestamp || message.createdAt,
          },
        ]);
      }
    };

    // ✅ Real-time reaction update from other user
    const handleReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
      );
    };

    // ✅ Real-time delete from other user
    const handleDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on('message',          handleIncoming);
    socket.on('message_reaction', handleReaction);
    socket.on('message_deleted',  handleDeleted);

    return () => {
      socket.off('message',          handleIncoming);
      socket.off('message_reaction', handleReaction);
      socket.off('message_deleted',  handleDeleted);
    };
  }, [socket, selectedUserId, user?._id]);

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || !user?._id || !selectedUserId) return;

    const replySnapshot = replyingTo
      ? {
          messageId: replyingTo._id,
          text: replyingTo.text,
          senderId: replyingTo.senderId?._id || replyingTo.senderId,
          senderName:
            (replyingTo.senderId?._id || replyingTo.senderId) === user._id
              ? 'You'
              : selectedUser?.name,
        }
      : null;

    const newMessage = {
      _id: `${Date.now()}`,
      senderId:  user._id,
      receiverId: selectedUserId,
      text: trimmed,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      replyTo:   replySnapshot,
      reactions: [], // ✅ new messages start with empty reactions
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(newMessage);

    api
      .post('/messages', {
        senderId:   user._id,
        receiverId: selectedUserId,
        text:       trimmed,
        replyTo:    replySnapshot,
      })
      .catch(console.error);

    setMessageText('');
    setReplyingTo(null);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const initial = (selectedUser?.name || 'U')[0].toUpperCase();

  const senderName = (message) =>
    (message.senderId?._id || message.senderId) === user?._id
      ? 'You'
      : selectedUser?.name;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="chat-window">

      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header-left">
          {onBack && (
            <button className="back-btn" onClick={onBack} aria-label="Back to contacts">
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
            <h3 className="chat-user-name">{selectedUser?.name || 'Unknown User'}</h3>
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

      {/* ── Messages ── */}
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
            messages.map((message) => {
              const isSent =
                (message.senderId?._id || message.senderId) === user?._id;

              // ✅ Group reactions by emoji for the pill display
              const reactionGroups = (message.reactions || []).reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || []);
                acc[r.emoji].push(r.userId?._id || r.userId);
                return acc;
              }, {});

              return (
                <div
                  key={message._id}
                  id={`msg-${message._id}`}
                  className={`message ${isSent ? 'sent' : 'received'}`}
                >
                  <div
                    className={`message-content ${
                      ctxMenu?.message._id === message._id ? 'ctx-selected' : ''
                    }`}
                    onContextMenu={(e) => openMenu(e, message)}
                    onTouchStart={(e) => onTouchStart(e, message)}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchEnd}
                  >
                    {/* ── Quoted reply ── */}
                    {message.replyTo && (
                      <div
                        className="message-quote"
                        onClick={() => {
                          const el = document.getElementById(
                            `msg-${message.replyTo.messageId}`,
                          );
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <span className="message-quote__name">
                          {message.replyTo.senderName}
                        </span>
                        <span className="message-quote__text">
                          {message.replyTo.text}
                        </span>
                      </div>
                    )}

                    <p className="message-text">{message.text}</p>

                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* ✅ Reaction pills — outside message-content so they sit below the bubble */}
                  {Object.keys(reactionGroups).length > 0 && (
                    <div className="message-reactions">
                      {Object.entries(reactionGroups).map(([emoji, userIds]) => {
                        const iMine = userIds.includes(user?._id);
                        return (
                          <button
                            key={emoji}
                            className={`reaction-pill ${iMine ? 'reaction-pill--mine' : ''}`}
                            onClick={() =>
                              handleAction('react', { emoji, message })
                            }
                          >
                            {emoji}
                            {userIds.length > 1 && (
                              <span>{userIds.length}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div className="chat-input-container">

        {/* Reply preview bar */}
        {replyingTo && (
          <div className="reply-preview">
            <div className="reply-preview__bar" />
            <div className="reply-preview__content">
              <span className="reply-preview__name">{senderName(replyingTo)}</span>
              <span className="reply-preview__text">{replyingTo.text}</span>
            </div>
            <button
              className="reply-preview__close"
              onClick={() => setReplyingTo(null)}
              aria-label="Cancel reply"
            >
              ✕
            </button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <button type="button" className="input-action-btn" title="Attach" aria-label="Attach file">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={replyingTo ? `Reply to ${senderName(replyingTo)}…` : 'Aa'}
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

      {/* ── Context Menu ── */}
      {ctxMenu && (
        <MessageContextMenu
          message={ctxMenu.message}
          position={ctxMenu.position}
          onClose={closeMenu}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default ChatWindow;