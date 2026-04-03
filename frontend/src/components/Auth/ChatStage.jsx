/**
 * @file components/Auth/ChatStage.jsx
 * @description Chat illustration stage with bubbles and typing indicator
 */

import ChatBubble from './ChatBubble';

const CHAT_BUBBLES = [
  { side: 'left', avatar: 'AK', avatarClass: 'av-purple', message: 'Hey! Just shipped the new feature 🚀', delay: '0.2s' },
  { side: 'right', avatar: 'ME', avatarClass: 'av-pink', message: 'Looks amazing! Checking it out now', delay: '0.8s' },
  { side: 'left', avatar: 'AK', avatarClass: 'av-purple', message: 'Let me know what you think 😄', delay: '1.4s' },
  { side: 'right', avatar: 'ME', avatarClass: 'av-pink', message: 'Love it. The animations are 🔥', delay: '2s' },
];

const ChatStage = () => {
  return (
    <div className="chat-stage">
      {CHAT_BUBBLES.map((bubble, idx) => (
        <ChatBubble
          key={idx}
          side={bubble.side}
          avatar={bubble.avatar}
          avatarClass={bubble.avatarClass}
          message={bubble.message}
          animationDelay={bubble.delay}
        />
      ))}

      {/* Typing indicator */}
      <div className="chat-typing">
        <div className="chat-avatar av-teal">JS</div>
        <div className="typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default ChatStage;
