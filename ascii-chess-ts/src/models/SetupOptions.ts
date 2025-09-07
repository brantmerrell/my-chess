import { AppDispatch } from "../app/store";
import {
  fetchChessComDailyPuzzle,
  fetchLiChessDailyPuzzle,
} from "../reducers/puzzles/puzzles.actions";

export abstract class ChessSetup {
  constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly category?: string,
  ) {}

  abstract load(dispatch: AppDispatch): void;
}

export class StaticPositionSetup extends ChessSetup {
  constructor(
    id: string,
    displayName: string,
    public readonly fen: string,
    category?: string,
  ) {
    super(id, displayName, category);
  }

  load(dispatch: AppDispatch): void {
    // No-op: StaticPositionSetup is handled by the component via setFen()
  }

  getFen(): string {
    return this.fen;
  }
}

export class DailyPuzzleSetup extends ChessSetup {
  constructor(
    id: string,
    displayName: string,
    private readonly fetchAction: () => any,
  ) {
    super(id, displayName);
  }

  load(dispatch: AppDispatch): void {
    dispatch(this.fetchAction());
  }
}

export const STANDARD_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const CHESS_SETUPS = [
  new StaticPositionSetup(
    "standard",
    "Standard Starting Position",
    STANDARD_FEN,
  ),
  new DailyPuzzleSetup(
    "lichess-daily-puzzle",
    "Daily Lichess Puzzle",
    fetchLiChessDailyPuzzle,
  ),
  new DailyPuzzleSetup(
    "chess-com-daily-puzzle",
    "Daily Chess.com Puzzle",
    fetchChessComDailyPuzzle,
  ),
  // King Box Demos
  new StaticPositionSetup(
    "king-vs-king",
    "King vs King",
    "rnbq1bnr/pppppppp/5k2/8/5K2/8/PPPPPPPP/RNBQ1BNR w KQkq - 0 1",
    "King Box Demos",
  ),
  new StaticPositionSetup(
    "fools-mate",
    "Fool's Mate",
    "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
    "King Box Demos",
  ),
  new StaticPositionSetup(
    "embedded-mate",
    "Embedded Mate",
    "rnb4N/ppppk1pQ/8/2b5/2B5/8/PPP2nPP/RN4RK w - - 1 14",
    "King Box Demos",
  ),
  new StaticPositionSetup(
    "open-board-mate",
    "Open Board Mate",
    "8/b7/4b3/6kp/3qBQ2/5K2/8/8 b - - 1 6",
    "King Box Demos",
  ),
];

export const getSetupById = (id: string): ChessSetup | undefined => {
  return CHESS_SETUPS.find((setup) => setup.id === id);
};

export const getSetupsByCategory = (category: string): ChessSetup[] => {
  return CHESS_SETUPS.filter((setup) => setup.category === category);
};

export const SetupOptions = {
  STANDARD: "standard",
  LICHESS_DAILY_PUZZLE: "lichess-daily-puzzle",
  CHESS_COM_DAILY_PUZZLE: "chess-com-daily-puzzle",
  KING_VS_KING: "king-vs-king",
  FOOLS_MATE: "fools-mate",
  EMBEDDED_MATE: "embedded-mate",
  OPEN_BOARD_MATE: "open-board-mate",
} as const;
