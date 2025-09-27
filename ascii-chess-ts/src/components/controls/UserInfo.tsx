import React from "react";
import { ConnectionStatus } from "../ConnectionStatus";

interface UserInfoProps {
  username: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  connectionError?: string;
  onLogout: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  username,
  connectionStatus,
  connectionError,
  onLogout,
}) => {
  return (
    <div className="user-info">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>
          Playing as: <strong>{username || 'Guest'}</strong>
        </span>
        <button
          onClick={onLogout}
          style={{
            padding: '2px 8px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
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
      </div>
      <ConnectionStatus
        connectionStatus={connectionStatus}
        connectionError={connectionError}
      />
    </div>
  );
};

export default UserInfo;