import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { lichessGame } from '../services/lichess/game';
import { lichessAuth } from '../services/lichess/auth';
import { useLichessAuth } from './useLichessAuth';
import { makeMove, loadFen } from '../app/store';
import { ChessGame } from '../chess/chessGame';

interface GameState {
  gameId: string | null;
  gameUrl: string | null;
  isPlaying: boolean;
  color: 'white' | 'black' | null;
  opponentName: string | null;
  status: string;
  timeLeft: { white: number; black: number } | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  connectionError?: string;
}

interface MoveCache {
  processedMoves: string[];
  gameInstance: ChessGame;
  lastMoveIndex: number;
}

export const useLichessGame = () => {
  const dispatch = useDispatch();
  const { username } = useLichessAuth();
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    gameUrl: null,
    isPlaying: false,
    color: null,
    opponentName: null,
    status: 'idle',
    timeLeft: null,
    connectionStatus: 'disconnected'
  });

  const gameStreamRef = useRef<{ close: () => void } | null>(null);
  const eventStreamRef = useRef<{ close: () => void } | null>(null);
  const moveCacheRef = useRef<MoveCache>({
    processedMoves: [],
    gameInstance: new ChessGame(),
    lastMoveIndex: -1
  });

  const handleGameConnectionChange = useCallback((connected: boolean, error?: string) => {
    setGameState(prev => ({
      ...prev,
      connectionStatus: connected ? 'connected' : error ? 'error' : 'disconnected',
      connectionError: error
    }));
  }, []);

  const handleEventConnectionChange = useCallback((connected: boolean, error?: string) => {
    if (!connected && error) {
      console.error('Event stream connection error:', error);
    }
  }, []);

  const processMoves = useCallback((movesString: string) => {
    if (!movesString) {
      moveCacheRef.current = {
        processedMoves: [],
        gameInstance: new ChessGame(),
        lastMoveIndex: -1
      };
      dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));
      return;
    }

    const moves = movesString.split(' ').filter(m => m);
    const cache = moveCacheRef.current;

    if (moves.length < cache.processedMoves.length ||
        (cache.processedMoves.length > 0 &&
         !movesString.startsWith(cache.processedMoves.join(' ')))) {
      console.log('Full game reset detected, replaying all moves');
      cache.processedMoves = [];
      cache.gameInstance = new ChessGame();
      cache.lastMoveIndex = -1;
      dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));
    }

    const newMoves = moves.slice(cache.lastMoveIndex + 1);
    if (newMoves.length === 0) {
      return;
    }

    console.log(`Processing ${newMoves.length} new moves starting from index ${cache.lastMoveIndex + 1}`);

    for (const uciMove of newMoves) {
      try {
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.substring(4, 5);

        const legalMoves = cache.gameInstance.getVerboseMoves();
        const matchingMove = legalMoves.find((m: any) =>
          m.from === from && m.to === to &&
          (!promotion || m.promotion === promotion)
        );

        if (matchingMove) {
          cache.gameInstance.makeMove(matchingMove.san);
          dispatch(makeMove(matchingMove.san));
          cache.processedMoves.push(uciMove);
          cache.lastMoveIndex++;
        } else {
          console.error(`Invalid move ${uciMove} at index ${cache.lastMoveIndex + 1}`);
          console.log('Attempting to resync game state...');
          break;
        }
      } catch (error) {
        console.error(`Error processing move ${uciMove}:`, error);
        break;
      }
    }
  }, [dispatch]);

  const handleGameUpdate = useCallback((data: any) => {
    console.log('Game update:', data.type);

    if (data.type === 'gameFull') {
      const isWhite = data.white.id === username;
      console.log('Setting up game from gameFull event:', {
        gameId: data.id,
        username,
        isWhite
      });

      setGameState(prev => ({
        ...prev,
        gameId: data.id,
        gameUrl: `https://lichess.org/${data.id}`,
        isPlaying: true,
        color: isWhite ? 'white' : 'black',
        opponentName: isWhite ? data.black.name : data.white.name,
        status: data.state.status
      }));

      moveCacheRef.current = {
        processedMoves: [],
        gameInstance: new ChessGame(),
        lastMoveIndex: -1
      };

      processMoves(data.state.moves);
    } else if (data.type === 'gameState') {
      processMoves(data.moves);

      setGameState(prev => ({
        ...prev,
        status: data.status,
        timeLeft: {
          white: data.wtime,
          black: data.btime
        }
      }));

      if (data.status !== 'started') {
        setGameState(prev => ({
          ...prev,
          isPlaying: false
        }));

        if (gameStreamRef.current) {
          gameStreamRef.current.close();
          gameStreamRef.current = null;
        }
      }
    }
  }, [username, processMoves]);

  const sendMove = useCallback(async (from: string, to: string, promotion?: string) => {
    console.log('sendMove called with:', { from, to, promotion, gameId: gameState.gameId });

    if (!gameState.gameId || !gameState.isPlaying) {
      console.error('No active game');
      return false;
    }

    if (gameState.connectionStatus !== 'connected') {
      console.error('Game stream not connected');
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
  }, [gameState.gameId, gameState.isPlaying, gameState.connectionStatus]);

  const startGameStream = useCallback((gameId: string) => {
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
    }

    gameStreamRef.current = lichessGame.streamGame(
      gameId,
      handleGameUpdate,
      handleGameConnectionChange
    );
  }, [handleGameUpdate, handleGameConnectionChange]);

  // Handle incoming events (challenges, game starts)
  const handleEvent = useCallback((data: any) => {
    console.log('Lichess event received:', data);

    if (data.type === 'gameStart') {
      console.log('Game starting, gameId:', data.game.id);
      startGameStream(data.game.id);
    } else if (data.type === 'challenge') {
      console.log('Challenge received:', data.challenge);
      // TODO: show UI for this
    }
  }, [startGameStream]);

  useEffect(() => {
    if (lichessAuth.isAuthenticated()) {
      eventStreamRef.current = lichessGame.streamEvents(
        handleEvent,
        handleEventConnectionChange
      );
    }

    return () => {
      if (eventStreamRef.current) {
        eventStreamRef.current.close();
      }
      if (gameStreamRef.current) {
        gameStreamRef.current.close();
      }
    };
  }, [handleEvent, handleEventConnectionChange]);

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

      return true;
    } catch (error) {
      console.error('Failed to create seek:', error);
      setGameState(prev => ({ ...prev, status: 'error' }));
      return false;
    }
  }, []);

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
