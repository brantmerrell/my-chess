import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useDispatch } from "react-redux";
import { lichessGame } from "../services/lichess/game";
import { useLichessAuth } from "../hooks/useLichessAuth";
import { loadFen } from "../app/store";
import {
  GameState,
  LichessGameContextType,
  initialGameState,
} from "../types/lichessGame";
import { parseGameResult } from "../utils/gameResultParser";
import { useMoveProcessor } from "../hooks/useMoveProcessor";
import { useLichessStreams } from "../hooks/useLichessStreams";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const LichessGameContext = createContext<LichessGameContextType | null>(null);

export const LichessGameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { username, isAuthenticated } = useLichessAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const {
    processMoves,
    resetToStartingPosition,
    addPendingMove,
    getGameInstance,
    setNotificationCallback,
    moveCacheRef,
  } = useMoveProcessor();

  // Handle game connection status changes
  const handleGameConnectionChange = useCallback(
    (connected: boolean, error?: string) => {
      setGameState((prev) => ({
        ...prev,
        connectionStatus: connected
          ? "connected"
          : error
            ? "error"
            : "disconnected",
        connectionError: error,
      }));
    },
    [],
  );

  // Handle incoming game updates from Lichess
  const handleGameUpdate = useCallback(
    (data: any) => {
      console.log("[LichessGameContext] Game update:", data.type);

      if (data.type === "gameFull") {
        const isWhite =
          data.white.id === username || data.white.name === username;
        console.log(
          "[LichessGameContext] Setting up game from gameFull event:",
          {
            gameId: data.id,
            username,
            whitePlayer: data.white,
            blackPlayer: data.black,
            isWhite,
          },
        );

        const isGameActive = data.state.status === "started";
        const myColor = isWhite ? "white" : "black";

        // Parse game result if the game has already ended
        let gameResult: GameState["gameResult"] = undefined;
        let winner: "white" | "black" | null = null;
        if (!isGameActive) {
          console.log("[LichessGameContext] Game already ended in gameFull:", {
            status: data.state.status,
            winner: data.state.winner,
          });
          gameResult = parseGameResult(data.state, myColor);
          winner = data.state.winner || null;
        }

        setGameState((prev) => ({
          ...prev,
          gameId: data.id,
          gameUrl: `https://lichess.org/${data.id}`,
          isPlaying: isGameActive,
          color: myColor,
          opponentName: isWhite
            ? data.black.name || data.black.id
            : data.white.name || data.white.id,
          status:
            data.state.status === "started" ? "playing" : data.state.status,
          isMyTurn:
            isWhite ===
            (data.state.moves.trim() === ""
              ? true
              : data.state.moves.split(" ").length % 2 === 0),
          winner: winner,
          gameResult: gameResult,
        }));

        // Reset and process moves for new game
        resetToStartingPosition();
        processMoves(data.state.moves);
      } else if (data.type === "gameState") {
        processMoves(data.moves);

        setGameState((prev) => ({
          ...prev,
          status: data.status,
          timeLeft: {
            white: data.wtime,
            black: data.btime,
          },
          isMyTurn:
            prev.color === "white"
              ? data.moves.trim() === ""
                ? true
                : data.moves.split(" ").length % 2 === 0
              : data.moves.trim() === ""
                ? false
                : data.moves.split(" ").length % 2 === 1,
        }));

        if (data.status !== "started") {
          console.log("[LichessGameContext] Game ended with full data:", {
            status: data.status,
            winner: data.winner,
            wtime: data.wtime,
            btime: data.btime,
            fullData: data,
          });

          setGameState((prev) => {
            const gameResult = parseGameResult(data, prev.color);
            return {
              ...prev,
              isPlaying: false,
              winner: data.winner || null,
              gameResult,
            };
          });
        }
      }
    },
    [username, processMoves, resetToStartingPosition],
  );

  // Handle events like game start, challenges
  const handleEvent = useCallback((data: any) => {
    if (data.type === "gameStart") {
      setGameState((prev) => {
        const newState = {
          ...prev,
          status: "starting",
          gameId: data.game?.id || prev.gameId,
          gameUrl: data.game?.id
            ? `https://lichess.org/${data.game.id}`
            : prev.gameUrl,
        };
        console.log("[LichessGameContext] State transition on gameStart:", {
          from: prev,
          to: newState,
        });
        return newState;
      });
    }
  }, []);

  const { closeGameStream } = useLichessStreams(
    handleGameUpdate,
    handleGameConnectionChange,
    handleEvent,
  );

  // Send move to Lichess
  const sendMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      console.log("[LichessGameContext] sendMove called with:", {
        from,
        to,
        promotion,
        gameId: gameState.gameId,
        isMyTurn: gameState.isMyTurn,
        color: gameState.color,
        status: gameState.status,
      });

      if (!gameState.gameId || !gameState.isPlaying) {
        console.error("[LichessGameContext] No active game");
        return false;
      }

      if (gameState.connectionStatus !== "connected") {
        console.error("[LichessGameContext] Game stream not connected");
        return false;
      }

      if (!gameState.isMyTurn) {
        console.error("[LichessGameContext] Not my turn! Cannot send move.");
        return false;
      }

      // Validate move against current position
      const cache = moveCacheRef.current;
      const legalMoves = cache.gameInstance.getVerboseMoves();
      const moveIsLegal = legalMoves.some(
        (m: any) =>
          m.from === from &&
          m.to === to &&
          (!promotion || m.promotion === promotion),
      );

      if (!moveIsLegal) {
        console.error(
          "[LichessGameContext] Move is not legal in current position:",
          {
            from,
            to,
            promotion,
            legalMoves: legalMoves.map((m) => `${m.from}-${m.to}`),
          },
        );
        return false;
      }

      const uciMove = from + to + (promotion || "");
      console.log("[LichessGameContext] Sending UCI move to Lichess:", uciMove);

      addPendingMove(uciMove);

      try {
        const result = await lichessGame.makeMove(gameState.gameId, uciMove);
        console.log("[LichessGameContext] Lichess move result:", result);
        return true;
      } catch (error: any) {
        console.error("[LichessGameContext] Failed to send move to Lichess:", {
          error: error.message,
          status: error.status,
          response: error.response?.data,
          uciMove,
        });

        if (error.status === 400) {
          console.error(
            "[LichessGameContext] 400 error - likely not your turn or invalid move",
          );
        }

        return false;
      }
    },
    [
      gameState.gameId,
      gameState.isPlaying,
      gameState.connectionStatus,
      gameState.isMyTurn,
      gameState.color,
      gameState.status,
      moveCacheRef,
      addPendingMove,
    ],
  );

  // Create a seek and wait for pairing
  const createSeek = useCallback(
    async (timeControl: { minutes: number; increment: number }) => {
      try {
        setGameState((prev) => ({ ...prev, status: "seeking" }));

        const result = await lichessGame.createSeek({
          rated: false,
          time: timeControl.minutes,
          increment: timeControl.increment,
          variant: "standard",
          color: "random",
        });

        console.log("[LichessGameContext] Seek created:", result);
        return true;
      } catch (error) {
        console.error("[LichessGameContext] Failed to create seek:", error);
        setGameState((prev) => ({ ...prev, status: "error" }));
        return false;
      }
    },
    [],
  );

  // Resign from current game
  const resign = useCallback(async () => {
    if (!gameState.gameId) return;

    try {
      await lichessGame.resign(gameState.gameId);
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        status: "resigned",
      }));
    } catch (error) {
      console.error("[LichessGameContext] Failed to resign:", error);
    }
  }, [gameState.gameId]);

  // Get current position from cache for move validation
  const getCurrentPosition = useCallback(() => {
    return getGameInstance();
  }, [getGameInstance]);

  // Start a new game - resets game state for a fresh start
  const startNewGame = useCallback(() => {
    console.log("[LichessGameContext] Starting new game - resetting state");

    closeGameStream();

    setGameState(initialGameState);
    resetToStartingPosition();
    dispatch(loadFen({ fen: STARTING_FEN }));
  }, [dispatch, closeGameStream, resetToStartingPosition]);

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated && gameState.gameId) {
      startNewGame();
    }
  }, [isAuthenticated, gameState.gameId, startNewGame]);

  const value: LichessGameContextType = {
    gameState,
    createSeek,
    sendMove,
    resign,
    getCurrentPosition,
    startNewGame,
    setNotificationCallback,
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
    throw new Error("useLichessGame must be used within a LichessGameProvider");
  }
  return context;
};
