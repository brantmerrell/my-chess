import React from "react";

interface GameStatusProps {
  color: 'white' | 'black' | null;
  opponentName: string | null;
  status: string;
  timeLeft: { white: number; black: number } | null;
  notification?: {
    message: string;
    type: "error" | "warning" | "success" | "info";
  };
  onResign: () => void;
  onClearNotification?: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({
  color,
  opponentName,
  status,
  timeLeft,
  notification,
  onResign,
  onClearNotification,
}) => {
  return (
    <div className="status-stack">
      <div className="game-status-compact">
        <span className="game-active">🟢 Active</span>
        <span>
          {color} vs {opponentName}
        </span>
        <span>{status}</span>
        {timeLeft && (
          <div className="time-display">
            <span>
              White: {Math.floor(timeLeft.white / 1000)}s
            </span>
            <span>
              Black: {Math.floor(timeLeft.black / 1000)}s
            </span>
            <button
              className="btn btn-danger time-control-btn"
              onClick={onResign}
              style={{
                fontSize: "13px",
                padding: "6px 10px",
                marginLeft: "20px",
              }}
            >
              🏳️ Resign
            </button>
            {notification?.message && (
              <span
                style={{
                  marginLeft: "20px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                }}
              >
                <span style={{ marginRight: "6px" }}>
                  {notification.type === "error" && "✾"}
                  {notification.type === "warning" && "‼"}
                  {notification.type === "success" && "🗸"}
                  {notification.type === "info" && "🛈"}
                </span>
                <span>{notification.message}</span>
                {onClearNotification && (
                  <button
                    onClick={onClearNotification}
                    title="Clear notification"
                    style={{
                      background: "none",
                      border: "none",
                      marginLeft: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      opacity: 0.7,
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStatus;