import React from "react";

interface GameStatusProps {
  color: "white" | "black" | null;
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
          <>
            <span>W: {Math.floor(timeLeft.white / 1000)}s</span>
            <span>B: {Math.floor(timeLeft.black / 1000)}s</span>
            <button
              className="btn btn-danger time-control-btn"
              onClick={onResign}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
              }}
            >
              🏳️ Resign
            </button>
            {notification?.message && (
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              >
                <span style={{ marginRight: "4px" }}>
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
                      marginLeft: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameStatus;
