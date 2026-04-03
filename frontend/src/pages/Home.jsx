/**
 * @file pages/Home.jsx
 * @description Dark theme landing page after login
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
      color: '#e2e8f0',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 980,
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.25)',
        background: 'rgba(15,23,42,0.8)',
        boxShadow: '0 16px 40px rgba(15,23,42,0.45)',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#7c6fff' }}>
          Welcome Home{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.25rem' }}>
          You have successfully logged in and reached the dark-themed home page. 
          Start exploring your chat dashboard and manage your conversations in real-time.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/login')}
            style={{
              padding: '0.7rem 1.2rem',
              border: '1px solid #334155',
              background: 'rgba(51,65,85,0.65)',
              color: '#f8fafc',
              borderRadius: '10px',
              cursor: 'pointer',
            }}>
            Go to Login page
          </button>
          <button onClick={handleLogout}
            style={{
              padding: '0.7rem 1.2rem',
              border: '1px solid #7c6fff',
              background: '#7c6fff',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer',
            }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
