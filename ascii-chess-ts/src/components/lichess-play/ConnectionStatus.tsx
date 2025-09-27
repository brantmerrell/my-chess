import React from "react";
import "./ConnectionStatus.css";

interface ConnectionStatusProps {
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";
  connectionError?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionStatus,
  connectionError,
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return "🟢";
      case "connecting":
        return "🟡";
      case "disconnected":
        return "⚪";
      case "error":
        return "🔴";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected to Lichess";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return connectionError || "Connection error";
    }
  };

  return (
    <div className={`connection-status connection-status--${connectionStatus}`}>
      <span className="connection-status__icon">{getStatusIcon()}</span>
      <span className="connection-status__text">{getStatusText()}</span>
    </div>
  );
};
