import {useRef,useEffect} from 'react';

const MENU_ITEMS = [
  { label: "Reply", icon: "↩", action: "reply"   },
  { label: "Edit",  icon: "✎", action: "edit", senderOnly: true },
  { label: "Copy",  icon: "⎘", action: "copy"    },
  { label: "Star",  icon: "☆", action: "star"    },
  { label: "Delete", icon: "🗑", action: "delete", danger: true },
];

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function MessageContextMenu({ message, position, isSender, onClose, onAction }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const flipX = position.x + 200 > window.innerWidth;
  const flipY = position.y + 300 > window.innerHeight;

  const style = {
    position: "fixed",
    left: position.x,
    top: position.y,
    transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
    zIndex: 1000,
  };

  // Filter out sender-only actions when the current user is not the sender
  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.senderOnly || isSender,
  );

  return (
    <>
      {/* backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={onClose} />

      <div ref={menuRef} className="ctx-menu" style={style}>
        {/* Emoji reaction bar */}
        <div className="ctx-emoji-bar">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="ctx-emoji-btn"
              onClick={() => { onAction("react", { emoji, message }); onClose(); }}
            >
              {emoji}
            </button>
          ))}
          <button className="ctx-emoji-btn" onClick={onClose}>＋</button>
        </div>

        {/* Action items */}
        {visibleItems.map((item) => (
          <button
            key={item.action}
            className={`ctx-item ${item.danger ? "ctx-item--danger" : ""}`}
            onClick={() => { onAction(item.action, message); onClose(); }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
