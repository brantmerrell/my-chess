import React, { useState, useEffect } from 'react';
import { lichessAuth } from '../../services/lichess/auth';

interface LichessLoginProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

const LichessLogin: React.FC<LichessLoginProps> = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(isAuthenticated);
    }
  }, [isAuthenticated, onAuthChange]);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      if (lichessAuth.isAuthenticated()) {
        const user = await lichessAuth.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setUsername(user.username);
        } else {
          setIsAuthenticated(false);
          setUsername(null);
        }
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    lichessAuth.startAuth();
  };

  const handleLogout = () => {
    lichessAuth.logout();
    setIsAuthenticated(false);
    setUsername(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      backgroundColor: '#2a2a2a',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      {isAuthenticated ? (
        <>
          <span style={{ color: '#4CAF50' }}>♔</span>
          <span style={{ color: '#e0e0e0' }}>
            Logged in as <strong>{username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '4px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <span style={{ color: '#999' }}>Not logged in</span>
          <button
            onClick={handleLogin}
            style={{
              padding: '6px 16px',
              backgroundColor: '#669900',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#7ab200';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#669900';
            }}
          >
            Login with Lichess
          </button>
        </>
      )}
    </div>
  );
};

export default LichessLogin;