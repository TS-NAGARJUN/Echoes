/**
 * @file pages/Home.jsx
 * @description Home page with chat layout and socket integration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { ChatLayout } from '../components/Auth';
import { ChatArea } from '../components/Auth';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [selectedUserData, setSelectedUserData] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserSelect = (userId, userData) => {
    setSelectedUserData(userData);
  };

  return (
    <ChatLayout onUserSelect={handleUserSelect}>
      {selectedUserData && (
        <ChatArea
          receiverId={selectedUserData._id}
          receiverData={selectedUserData}
        />
      )}
    </ChatLayout>
  );
};

export default Home;
