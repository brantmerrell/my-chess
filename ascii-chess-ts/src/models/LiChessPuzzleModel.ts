import { Position, FetchStatus } from "../types/chess";

export interface LiChessPuzzleModel {
  puzzleId: string;
  gameId: string;
  puzzleRating: string;
  puzzlePlays: number;
  solution: string[];
  themes: string[];
  initialPuzzleFEN: string;
  setupHistory: Position[];
  fetchStatus: FetchStatus;
}
