/**
 * @file components/common/UserItem.jsx
 * @description Individual user item component
 */

const UserItem = ({ userData, isOnline, isSelected, onClick }) => {
  if (!userData?._id) return null;

  const userInitial = (userData?.name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`sidebar-user-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="user-item-avatar">
        {userData?.profilePic ? (
          <img src={userData.profilePic} alt={userData?.name || 'User'} />
        ) : (
          <div className="avatar-placeholder">
            {userInitial}
          </div>
        )}
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
      </div>

      <div className="user-item-content">
        <div className="user-name">{userData?.name || 'Unknown'}</div>
        <div className="user-email">{userData?.email || 'no-email'}</div>
      </div>

      <div className="user-status">
        {isOnline && <span className="status-badge">Online</span>}
      </div>
    </div>
  );
};

export default UserItem;