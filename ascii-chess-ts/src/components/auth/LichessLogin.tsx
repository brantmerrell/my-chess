import React, { useEffect } from 'react';
import { useLichessAuth } from '../../hooks/useLichessAuth';

interface LichessLoginProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

const LichessLogin: React.FC<LichessLoginProps> = ({ onAuthChange }) => {
  const { isAuthenticated, username, loading, login, logout } = useLichessAuth();

  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(isAuthenticated);
    }
  }, [isAuthenticated, onAuthChange]);

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
            onClick={logout}
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
            onClick={login}
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