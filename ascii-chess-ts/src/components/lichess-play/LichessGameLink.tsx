import React from 'react';
import './LichessGameLink.css';

interface LichessGameLinkProps {
  gameUrl: string | null;
  gameId: string | null;
  isPlaying: boolean;
}

export const LichessGameLink: React.FC<LichessGameLinkProps> = ({
  gameUrl,
  gameId,
  isPlaying
}) => {
  if (!gameUrl || !gameId) {
    return null;
  }

  const handleClick = () => {
    window.open(gameUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    if (gameUrl) {
      try {
        await navigator.clipboard.writeText(gameUrl);
        console.log('Game link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <div className="lichess-game-link">
      <div className="lichess-game-link__actions">
        <button
          className="lichess-game-link__button lichess-game-link__button--open"
          onClick={handleClick}
          title="Open game on Lichess"
        >
          <span className="lichess-game-link__icon">🔗</span>
          <span className="lichess-game-link__text">Open Game</span>
        </button>
        <button
          className="lichess-game-link__button lichess-game-link__button--copy"
          onClick={handleCopy}
          title="Copy game link"
        >
          <span className="lichess-game-link__icon">📋</span>
          <span className="lichess-game-link__text">Copy Link</span>
        </button>
      </div>
      <div className="lichess-game-link__id">
        Game ID: {gameId}
      </div>
    </div>
  );
};
