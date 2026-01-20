import { ChessGame } from "../chess/chessGame";

export interface GameState {
  gameId: string | null;
  gameUrl: string | null;
  isPlaying: boolean;
  color: "white" | "black" | null;
  opponentName: string | null;
  status: string;
  timeLeft: { white: number; black: number } | null;
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";
  connectionError?: string;
  isMyTurn: boolean;
  winner?: "white" | "black" | null;
  gameResult?: GameResult;
}

export interface GameResult {
  result: "win" | "loss" | "draw";
  reason: GameEndReason;
  winner?: "white" | "black" | null;
}

export type GameEndReason =
  | "mate"
  | "resign"
  | "timeout"
  | "draw"
  | "stalemate"
  | "insufficient"
  | "abort"
  | "unknown";

export interface MoveCache {
  processedMoves: string[];
  gameInstance: ChessGame;
  lastMoveIndex: number;
}

export type NotificationCallback = (
  message: string,
  type: "error" | "warning" | "success" | "info",
) => void;

export interface LichessGameContextType {
  gameState: GameState;
  createSeek: (timeControl: {
    minutes: number;
    increment: number;
  }) => Promise<boolean>;
  sendMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  resign: () => Promise<void>;
  getCurrentPosition: () => ChessGame;
  startNewGame: () => void;
  setNotificationCallback: (callback: NotificationCallback | null) => void;
}

export const initialGameState: GameState = {
  gameId: null,
  gameUrl: null,
  isPlaying: false,
  color: null,
  opponentName: null,
  status: "idle",
  timeLeft: null,
  connectionStatus: "disconnected",
  isMyTurn: false,
  winner: null,
  gameResult: undefined,
};
