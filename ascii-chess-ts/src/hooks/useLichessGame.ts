import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { lichessGame } from '../services/lichess/game';
import { lichessAuth } from '../services/lichess/auth';
import { useLichessAuth } from './useLichessAuth';
import { makeMove, loadFen } from '../app/store';
import { ChessGame } from '../chess/chessGame';

interface GameState {
  gameId: string | null;
  isPlaying: boolean;
  color: 'white' | 'black' | null;
  opponentName: string | null;
  status: string;
  timeLeft: { white: number; black: number } | null;
}

export const useLichessGame = () => {
  const dispatch = useDispatch();
  const { username } = useLichessAuth();
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    isPlaying: false,
    color: null,
    opponentName: null,
    status: 'idle',
    timeLeft: null
  });

  const gameStreamRef = useRef<{ close: () => void } | null>(null);
  const eventStreamRef = useRef<{ close: () => void } | null>(null);

  // Handle incoming moves from Lichess
  const handleGameUpdate = useCallback((data: any) => {
    console.log('Game update:', data);

    if (data.type === 'gameFull') {
      // Initial game state
      const isWhite = data.white.id === username;
      console.log('Setting up game from gameFull event:', {
        gameId: data.id,
        username,
        white: data.white,
        black: data.black,
        isWhite,
        data
      });

      setGameState(prev => ({
        ...prev,
        gameId: data.id,
        isPlaying: true,
        color: isWhite ? 'white' : 'black',
        opponentName: isWhite ? data.black.name : data.white.name,
        status: data.state.status
      }));

      // Set initial position
      if (data.state.moves) {
        // Parse moves and update board
        const moves = data.state.moves.split(' ');
        const game = new ChessGame();
        moves.forEach((move: string) => {
          if (move) {
            // Convert UCI to SAN
            const from = move.substring(0, 2);
            const to = move.substring(2, 4);
            const promotion = move.substring(4, 5);

            // Find the matching move
            const legalMoves = game.getVerboseMoves();
            const matchingMove = legalMoves.find((m: any) =>
              m.from === from && m.to === to &&
              (!promotion || m.promotion === promotion)
            );

            if (matchingMove) {
              game.makeMove(matchingMove.san);
              dispatch(makeMove(matchingMove.san));
            }
          }
        });
      }
    } else if (data.type === 'gameState') {
      // Move update
      if (data.moves) {
        const moves = data.moves.split(' ');
        const game = new ChessGame();

        // Clear board and replay all moves
        dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));

        moves.forEach((move: string) => {
          if (move) {
            const from = move.substring(0, 2);
            const to = move.substring(2, 4);
            const promotion = move.substring(4, 5);

            const legalMoves = game.getVerboseMoves();
            const matchingMove = legalMoves.find((m: any) =>
              m.from === from && m.to === to &&
              (!promotion || m.promotion === promotion)
            );

            if (matchingMove) {
              game.makeMove(matchingMove.san);
              dispatch(makeMove(matchingMove.san));
            }
          }
        });
      }

      // Update game status
      setGameState(prev => ({
        ...prev,
        status: data.status,
        timeLeft: {
          white: data.wtime,
          black: data.btime
        }
      }));

      if (data.status !== 'started') {
        // Game ended
        setGameState(prev => ({
          ...prev,
          isPlaying: false
        }));

        // Clean up stream
        if (gameStreamRef.current) {
          gameStreamRef.current.close();
          gameStreamRef.current = null;
        }
      }
    }
  }, [dispatch]);

  // Send move to Lichess
  const sendMove = useCallback(async (from: string, to: string, promotion?: string) => {
    console.log('sendMove called with:', { from, to, promotion, gameState });

    if (!gameState.gameId || !gameState.isPlaying) {
      console.error('No active game - gameId:', gameState.gameId, 'isPlaying:', gameState.isPlaying);
      return false;
    }

    const uciMove = from + to + (promotion || '');
    console.log('Sending UCI move to Lichess:', uciMove);

    try {
      const result = await lichessGame.makeMove(gameState.gameId, uciMove);
      console.log('Lichess move result:', result);
      return true;
    } catch (error) {
      console.error('Failed to send move to Lichess:', error);
      return false;
    }
  }, [gameState.gameId, gameState.isPlaying]);

  // Start listening to game events
  const startGameStream = useCallback((gameId: string) => {
    // Close existing stream if any
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
    }

    // Start new stream
    gameStreamRef.current = lichessGame.streamGame(gameId, handleGameUpdate);
  }, [handleGameUpdate]);

  // Handle incoming events (challenges, game starts)
  const handleEvent = useCallback((data: any) => {
    console.log('Lichess event received:', data);

    if (data.type === 'gameStart') {
      // A game has started
      console.log('Game starting, gameId:', data.game.id);
      startGameStream(data.game.id);
    } else if (data.type === 'challenge') {
      // Received a challenge
      console.log('Challenge received:', data.challenge);
      // You might want to auto-accept or show UI for this
    }
  }, [startGameStream]);

  // Start event stream when component mounts
  useEffect(() => {
    if (lichessAuth.isAuthenticated()) {
      eventStreamRef.current = lichessGame.streamEvents(handleEvent);
    }

    return () => {
      if (eventStreamRef.current) {
        eventStreamRef.current.close();
      }
      if (gameStreamRef.current) {
        gameStreamRef.current.close();
      }
    };
  }, [handleEvent]);

  // Create a seek and wait for pairing
  const createSeek = useCallback(async (timeControl: { minutes: number; increment: number }) => {
    try {
      setGameState(prev => ({ ...prev, status: 'seeking' }));

      const result = await lichessGame.createSeek({
        rated: false,
        time: timeControl.minutes,
        increment: timeControl.increment,
        variant: 'standard',
        color: 'random'
      });

      console.log('Seek created:', result);
      // The event stream will handle when a game starts

      return true;
    } catch (error) {
      console.error('Failed to create seek:', error);
      setGameState(prev => ({ ...prev, status: 'error' }));
      return false;
    }
  }, []);

  // Resign from current game
  const resign = useCallback(async () => {
    if (!gameState.gameId) return;

    try {
      await lichessGame.resign(gameState.gameId);
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        status: 'resigned'
      }));
    } catch (error) {
      console.error('Failed to resign:', error);
    }
  }, [gameState.gameId]);

  return {
    gameState,
    createSeek,
    sendMove,
    resign
  };
};