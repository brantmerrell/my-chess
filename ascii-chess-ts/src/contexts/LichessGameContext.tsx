import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { lichessGame } from '../services/lichess/game';
import { lichessAuth } from '../services/lichess/auth';
import { useLichessAuth } from '../hooks/useLichessAuth';
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
  isMyTurn: boolean;
  winner?: 'white' | 'black' | null;
  gameResult?: {
    result: 'win' | 'loss' | 'draw';
    reason: 'mate' | 'resign' | 'timeout' | 'draw' | 'stalemate' | 'insufficient' | 'abort' | 'unknown';
    winner?: 'white' | 'black' | null;
  };
}

interface MoveCache {
  processedMoves: string[];
  gameInstance: ChessGame;
  lastMoveIndex: number;
}

interface LichessGameContextType {
  gameState: GameState;
  createSeek: (timeControl: { minutes: number; increment: number }) => Promise<boolean>;
  sendMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  resign: () => Promise<void>;
  getCurrentPosition: () => ChessGame;
  startNewGame: () => void;
}

const LichessGameContext = createContext<LichessGameContextType | null>(null);

export const LichessGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    connectionStatus: 'disconnected',
    isMyTurn: false,
    winner: null,
    gameResult: undefined
  });

  const gameStreamRef = useRef<{ close: () => void } | null>(null);
  const eventStreamRef = useRef<{ close: () => void } | null>(null);
  const moveCacheRef = useRef<MoveCache>({
    processedMoves: [],
    gameInstance: new ChessGame(),
    lastMoveIndex: -1
  });

  // Parse game result from Lichess data
  const parseGameResult = useCallback((data: any, myColor: 'white' | 'black' | null) => {
    const status = data.status;
    const winner = data.winner;

    console.log('[LichessGameContext] Parsing game result:', { status, winner, myColor });

    if (!myColor) return undefined;

    let reason: 'mate' | 'resign' | 'timeout' | 'draw' | 'stalemate' | 'insufficient' | 'abort' | 'unknown' = 'unknown';
    let result: 'win' | 'loss' | 'draw' = 'draw';

    // Determine reason for game end
    switch (status) {
      case 'mate':
        reason = 'mate';
        break;
      case 'resign':
        reason = 'resign';
        break;
      case 'timeout':
        reason = 'timeout';
        break;
      case 'draw':
        reason = 'draw';
        break;
      case 'stalemate':
        reason = 'stalemate';
        break;
      case 'variantEnd':
      case 'unknownFinish':
        reason = 'unknown';
        break;
      case 'aborted':
        reason = 'abort';
        break;
      default:
        reason = 'unknown';
    }

    // Determine result from my perspective
    if (winner) {
      result = winner === myColor ? 'win' : 'loss';
    } else {
      result = 'draw';
    }

    return {
      result,
      reason,
      winner: winner || null
    };
  }, []);

  // Handle connection status changes
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

  // Optimized move processing - only process new moves
  const processMoves = useCallback((movesString: string) => {
    if (!movesString) {
      console.log('[LichessGameContext] No moves string, resetting to initial position');
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
      console.log('[LichessGameContext] Full game reset detected, replaying all moves');
      cache.processedMoves = [];
      cache.gameInstance = new ChessGame();
      cache.lastMoveIndex = -1;
      dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));
    }

    const newMoves = moves.slice(cache.lastMoveIndex + 1);
    if (newMoves.length === 0) {
      return;
    }

    console.log(`[LichessGameContext] Processing ${newMoves.length} new moves starting from index ${cache.lastMoveIndex + 1}`);

    for (let i = 0; i < newMoves.length; i++) {
      const uciMove = newMoves[i];
      try {
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.substring(4, 5);

        const legalMoves = cache.gameInstance.getVerboseMoves();
        console.log(`[LichessGameContext] Processing UCI move: ${uciMove}, from: ${from}, to: ${to}, promotion: ${promotion}`);

        const matchingMove = legalMoves.find((m: any) =>
          m.from === from && m.to === to &&
          (!promotion || m.promotion === promotion)
        );

        if (matchingMove) {
          console.log(`[LichessGameContext] Found matching move: ${matchingMove.san} for UCI ${uciMove}`);
          cache.gameInstance.makeMove(matchingMove.san);
          dispatch(makeMove(matchingMove.san));
          cache.processedMoves.push(uciMove);
          cache.lastMoveIndex++;
        } else {
          console.error(`[LichessGameContext] No matching move found for UCI ${uciMove} (${from}-${to})`);

          // Mark this move as processed even though we couldn't apply it
          // This prevents infinite loops
          cache.lastMoveIndex++;
          console.log(`[LichessGameContext] Skipping invalid move and continuing...`);
          continue;
        }
      } catch (error) {
        console.error(`[LichessGameContext] Error processing move ${uciMove}:`, error);
        // Mark as processed to avoid infinite loops
        cache.lastMoveIndex++;
        continue;
      }
    }
  }, [dispatch]);

  // Handle incoming moves from Lichess
  const handleGameUpdate = useCallback((data: any) => {
    console.log('[LichessGameContext] Game update:', data.type);

    if (data.type === 'gameFull') {
      const isWhite = data.white.id === username || data.white.name === username;
      console.log('[LichessGameContext] Setting up game from gameFull event:', {
        gameId: data.id,
        username,
        whitePlayer: data.white,
        blackPlayer: data.black,
        isWhite
      });

      setGameState(prev => ({
        ...prev,
        gameId: data.id,
        gameUrl: `https://lichess.org/${data.id}`,
        isPlaying: true,
        color: isWhite ? 'white' : 'black',
        opponentName: isWhite ? (data.black.name || data.black.id) : (data.white.name || data.white.id),
        status: data.state.status === 'started' ? 'playing' : data.state.status,
        // Determine if it's my turn based on whose turn it is in the current position
        isMyTurn: isWhite === (data.state.moves.split(' ').length % 2 === 0)
      }));

      // Reset both cache and Redux store for new game
      moveCacheRef.current = {
        processedMoves: [],
        gameInstance: new ChessGame(),
        lastMoveIndex: -1
      };

      // Reset Redux store to starting position
      dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));

      processMoves(data.state.moves);
    } else if (data.type === 'gameState') {
      processMoves(data.moves);

      setGameState(prev => ({
        ...prev,
        status: data.status,
        timeLeft: {
          white: data.wtime,
          black: data.btime
        },
        // Update turn based on number of moves
        isMyTurn: prev.color === 'white' ? (data.moves.split(' ').length % 2 === 0) : (data.moves.split(' ').length % 2 === 1)
      }));

      if (data.status !== 'started') {
        console.log('[LichessGameContext] Game ended with status:', data.status);

        setGameState(prev => {
          const gameResult = parseGameResult(data, prev.color);
          return {
            ...prev,
            isPlaying: false,
            winner: data.winner || null,
            gameResult
          };
        });

        if (gameStreamRef.current) {
          gameStreamRef.current.close();
          gameStreamRef.current = null;
        }
      }
    }
  }, [username, processMoves]);

  // Send move to Lichess
  const sendMove = useCallback(async (from: string, to: string, promotion?: string) => {
    console.log('[LichessGameContext] sendMove called with:', {
      from,
      to,
      promotion,
      gameId: gameState.gameId,
      isMyTurn: gameState.isMyTurn,
      color: gameState.color,
      status: gameState.status
    });

    if (!gameState.gameId || !gameState.isPlaying) {
      console.error('[LichessGameContext] No active game');
      return false;
    }

    if (gameState.connectionStatus !== 'connected') {
      console.error('[LichessGameContext] Game stream not connected');
      return false;
    }

    if (!gameState.isMyTurn) {
      console.error('[LichessGameContext] Not my turn! Cannot send move.');
      return false;
    }

    // Validate move against current position
    const cache = moveCacheRef.current;
    const legalMoves = cache.gameInstance.getVerboseMoves();
    const moveIsLegal = legalMoves.some((m: any) =>
      m.from === from && m.to === to && (!promotion || m.promotion === promotion)
    );

    if (!moveIsLegal) {
      console.error('[LichessGameContext] Move is not legal in current position:', {
        from,
        to,
        promotion,
        legalMoves: legalMoves.map(m => `${m.from}-${m.to}`)
      });
      return false;
    }

    const uciMove = from + to + (promotion || '');
    console.log('[LichessGameContext] Sending UCI move to Lichess:', uciMove);

    try {
      const result = await lichessGame.makeMove(gameState.gameId, uciMove);
      console.log('[LichessGameContext] Lichess move result:', result);
      return true;
    } catch (error: any) {
      console.error('[LichessGameContext] Failed to send move to Lichess:', {
        error: error.message,
        status: error.status,
        response: error.response?.data,
        uciMove
      });

      if (error.status === 400) {
        console.error('[LichessGameContext] 400 error - likely not your turn or invalid move');
      }

      return false;
    }
  }, [gameState.gameId, gameState.isPlaying, gameState.connectionStatus, gameState.isMyTurn, gameState.color, gameState.status]);

  // Start listening to game events with reconnection support
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
    console.log('[LichessGameContext] Event received:', data);

    if (data.type === 'gameStart') {
      console.log('[LichessGameContext] Game starting event:', {
        gameId: data.game?.id,
        fullData: data
      });

      // Clear seeking status when game starts
      setGameState(prev => {
        const newState = {
          ...prev,
          status: 'starting',
          gameId: data.game?.id || prev.gameId,
          gameUrl: data.game?.id ? `https://lichess.org/${data.game.id}` : prev.gameUrl
        };
        console.log('[LichessGameContext] State transition on gameStart:', {
          from: prev,
          to: newState
        });
        return newState;
      });

      if (data.game?.id) {
        startGameStream(data.game.id);
      }
    } else if (data.type === 'challenge') {
      console.log('[LichessGameContext] Challenge received:', data.challenge);
      // TODO: show UI for this
    }
  }, [startGameStream]);

  // Start event stream when component mounts with reconnection support
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

      console.log('[LichessGameContext] Seek created:', result);
      return true;
    } catch (error) {
      console.error('[LichessGameContext] Failed to create seek:', error);
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
      console.error('[LichessGameContext] Failed to resign:', error);
    }
  }, [gameState.gameId]);

  // Get current position from cache for move validation
  const getCurrentPosition = useCallback(() => {
    return moveCacheRef.current.gameInstance;
  }, []);

  // Start a new game - resets game state for a fresh start
  const startNewGame = useCallback(() => {
    console.log('[LichessGameContext] Starting new game - resetting state');

    // Close any existing streams
    if (gameStreamRef.current) {
      gameStreamRef.current.close();
      gameStreamRef.current = null;
    }

    // Reset game state
    setGameState(prev => ({
      ...prev,
      gameId: null,
      gameUrl: null,
      isPlaying: false,
      color: null,
      opponentName: null,
      status: 'idle',
      timeLeft: null,
      isMyTurn: false,
      winner: null,
      gameResult: undefined
    }));

    // Reset move cache
    moveCacheRef.current = {
      processedMoves: [],
      gameInstance: new ChessGame(),
      lastMoveIndex: -1
    };

    // Reset Redux store to starting position
    dispatch(loadFen({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }));
  }, [dispatch]);

  const value: LichessGameContextType = {
    gameState,
    createSeek,
    sendMove,
    resign,
    getCurrentPosition,
    startNewGame
  };

  return (
    <LichessGameContext.Provider value={value}>
      {children}
    </LichessGameContext.Provider>
  );
};

export const useLichessGame = (): LichessGameContextType => {
  const context = useContext(LichessGameContext);
  if (!context) {
    throw new Error('useLichessGame must be used within a LichessGameProvider');
  }
  return context;
};
