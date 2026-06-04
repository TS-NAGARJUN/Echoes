/**
 * @file components/common/UsersList.jsx
 * @description Users list with online/offline sections
 */

import UserItem from './UserItem';

const UsersList = ({ filteredUsers, onlineUserIds, selectedUserId, onSelectUser }) => {
  const onlineUsersList = filteredUsers.filter(u => u?._id && onlineUserIds.has(u._id));
  const offlineUsersList = filteredUsers.filter(u => u?._id && !onlineUserIds.has(u._id));

  return (
    <div className="users-list">
      {/* Online users section */}
      {onlineUsersList.length > 0 && (
        <>
          <div className="users-section-header">
            <span>Online ({onlineUsersList.length})</span>
          </div>
          {onlineUsersList.map(userData => (
            <UserItem
              key={userData._id}
              userData={userData}
              isOnline={true}
              isSelected={selectedUserId === userData._id}
              onClick={() => onSelectUser(userData._id, userData)}
            />
          ))}
        </>
      )}

      {/* Offline users section */}
      {offlineUsersList.length > 0 && (
        <>
          <div className="users-section-header">
            <span>Offline ({offlineUsersList.length})</span>
          </div>
          {offlineUsersList.map(userData => (
            <UserItem
              key={userData._id}
              userData={userData}
              isOnline={false}
              isSelected={selectedUserId === userData._id}
              onClick={() => onSelectUser(userData._id, userData)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default UsersList;