/**
 * @file components/Auth/ChatBubble.jsx
 * @description Single chat message bubble with animation
 */

const ChatBubble = ({ side, avatar, avatarClass, message, animationDelay }) => {
  return (
    <div
      className={`chat-bubble ${side === 'right' ? 'right' : ''}`}
      style={{ animationDelay }}
    >
      <div className={`chat-avatar ${avatarClass}`}>{avatar}</div>
      <div className="chat-msg">{message}</div>
    </div>
  );
};

export default ChatBubble;
