export interface LiChessPuzzleModel {
  puzzleId: string;
  gameId: string;
  puzzleRating: string;
  puzzlePlays: number;
  solution: string[];
  themes: string[];
  initialPuzzleFEN: string;
  setupHistory: Array<{
    ply: number;
    san: string;
    uci: string;
    fen: string;
  }>;
  fetchStatus: {
    loading: boolean;
    error: string | null | undefined;
  };
}
