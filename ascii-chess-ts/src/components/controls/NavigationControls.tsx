import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../app/hooks";
import {
  RootState,
  goForward,
  goBackward,
  goToPosition,
} from "../../app/store";
import "./NavigationControls.css";

const NavigationControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { positions, currentPositionIndex } = useSelector(
    (state: RootState) => state.chessGame,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionsPerMinute, setActionsPerMinute] = useState(20);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const canGoBackward = currentPositionIndex > 0;
  const canGoForward = currentPositionIndex < positions.length - 1;
  const intervalMs = Math.round(60000 / actionsPerMinute);

  const handleBackward = () => {
    if (canGoBackward) {
      dispatch(goBackward());
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      dispatch(goForward());
    }
  };

  const handleGoToStart = () => {
    dispatch(goToPosition(0));
  };

  const handleGoToEnd = () => {
    dispatch(goToPosition(positions.length - 1));
  };

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (canGoForward) {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        dispatch(goForward());
      }, intervalMs);
    }
  }, [isPlaying, canGoForward, dispatch, intervalMs]);

  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        dispatch(goForward());
      }, intervalMs);
    }
  }, [intervalMs, isPlaying, dispatch]);

  const handlePaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAPM = parseInt(e.target.value);
    setActionsPerMinute(newAPM);
  };

  useEffect(() => {
    if (isPlaying && !canGoForward) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isPlaying, canGoForward]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="navigation-controls">
      <div className="pace-control">
        <label htmlFor="pace-slider" className="pace-label">
          Pace: {actionsPerMinute} APM ({(intervalMs / 1000).toFixed(1)}s/move)
        </label>
        <input
          id="pace-slider"
          type="range"
          min="5"
          max="60"
          step="10"
          value={actionsPerMinute}
          onChange={handlePaceChange}
          className="pace-slider"
          title="Adjust playback speed"
        />
      </div>
      <div className="navigation-buttons">
        <button
          onClick={handleGoToStart}
          disabled={!canGoBackward}
          className="nav-button start-button"
          title="Go to start (^)"
        >
          ⏮ <span className="keybinding">^</span>
        </button>
        <button
          onClick={handleBackward}
          disabled={!canGoBackward}
          className="nav-button backward-button"
          title="Previous move (h)"
        >
          ◀ <span className="keybinding">h</span>
        </button>
        <button
          onClick={togglePlayPause}
          disabled={!canGoForward && !isPlaying}
          className={`nav-button play-pause-button ${isPlaying ? 'playing' : ''}`}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="nav-button forward-button"
          title="Next move (l)"
        >
          ▶ <span className="keybinding">l</span>
        </button>
        <button
          onClick={handleGoToEnd}
          disabled={!canGoForward}
          className="nav-button end-button"
          title="Go to end ($)"
        >
          ⏭ <span className="keybinding">$</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
