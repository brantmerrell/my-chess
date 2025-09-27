import React, { useEffect } from 'react';
import { useLichessAuth } from '../../hooks/useLichessAuth';
import './LichessLogin.css';

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
      <div className="lichess-login__loading">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="lichess-login">
      {isAuthenticated ? (
        <>
          <span className="lichess-login__icon">♔</span>
          <span className="lichess-login__text">
            Logged in as <span className="lichess-login__username">{username}</span>
          </span>
          <button
            onClick={logout}
            className="lichess-login__logout-btn"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <span className="lichess-login__not-logged-in">Not logged in</span>
          <button
            onClick={login}
            className="lichess-login__login-btn"
          >
            Login with Lichess
          </button>
        </>
      )}
    </div>
  );
};

export default LichessLogin;