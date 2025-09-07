export interface LiChessPuzzleResponse {
  game: {
    id: string;
    perf: { key: string; name: string };
    rated: boolean;
    players: { name: string; color: string; rating: number }[];
    pgn: string;
    clock: string;
  };
  puzzle: {
    id: string;
    rating: string;
    plays: number;
    solution: string[];
    themes: string[];
    initialPly: number;
  };
}
