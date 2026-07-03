import { chessGameSlice, ChessGameState } from "./positions.reducers";
import { ChessGame } from "../../chess/chessGame";
import { STANDARD_FEN } from "../../models/SetupOptions";
import { Position } from "../../types/chess";

const {
  loadFen,
  makeMove,
  undoMove,
  goToPosition,
  goForward,
  goBackward,
} = chessGameSlice.actions;

const reducer = chessGameSlice.reducer;

const initialState = (): ChessGameState =>
  reducer(undefined, { type: "@@INIT" });

const movesFromFen = (fen: string) => new ChessGame(fen).getMoves();

// state arrays are frozen by Redux Toolkit, so sort a copy
const sorted = (moves: string[]) => [...moves].sort();

describe("chessGameSlice", () => {
  describe("loadFen", () => {
    it("loads a plain FEN and resets history", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
      const state = reducer(initialState(), loadFen({ fen }));

      expect(state.fen).toBe(fen);
      expect(state.history).toEqual([]);
      expect(state.positions).toEqual([
        { ply: 0, san: "-", uci: "-", fen },
      ]);
      expect(state.currentPositionIndex).toBe(0);
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(fen)));
    });

    it("loads a FEN with setup history", () => {
      const afterE4 =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
      const afterE5 =
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";
      const setupHistory: Position[] = [
        { ply: 0, san: "-", uci: "-", fen: STANDARD_FEN },
        { ply: 1, san: "1.e4", uci: "e2e4", fen: afterE4 },
        { ply: 2, san: "1...e5", uci: "e7e5", fen: afterE5 },
      ];

      const state = reducer(
        initialState(),
        loadFen({ fen: afterE5, setupHistory }),
      );

      expect(state.fen).toBe(afterE5);
      expect(state.positions).toEqual(setupHistory);
      expect(state.history).toEqual(["e4", "e5"]);
      expect(state.currentPositionIndex).toBe(2);
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(afterE5)));
    });
  });

  describe("makeMove", () => {
    it("appends a position with formatted SAN, UCI, and new FEN", () => {
      let state = reducer(initialState(), makeMove("e4"));

      expect(state.history).toEqual(["e4"]);
      expect(state.positions).toHaveLength(2);
      expect(state.positions[1]).toMatchObject({
        ply: 1,
        san: "1.e4",
        uci: "e2e4",
      });
      expect(state.fen).toBe(state.positions[1].fen);
      expect(state.currentPositionIndex).toBe(1);
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(state.fen)));

      state = reducer(state, makeMove("e5"));
      expect(state.positions[2]).toMatchObject({
        ply: 2,
        san: "1...e5",
        uci: "e7e5",
      });

      state = reducer(state, makeMove("Nf3"));
      expect(state.positions[3]).toMatchObject({
        ply: 3,
        san: "2.Nf3",
        uci: "g1f3",
      });
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(state.fen)));
    });

    it("handles castling", () => {
      let state = initialState();
      for (const move of ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O"]) {
        state = reducer(state, makeMove(move));
      }
      expect(state.positions[7]).toMatchObject({ san: "4.O-O", uci: "e1g1" });
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(state.fen)));
    });

    it("throws on an illegal move", () => {
      expect(() => reducer(initialState(), makeMove("e5"))).toThrow();
    });
  });

  describe("undoMove", () => {
    it("restores the previous position and legal moves", () => {
      let state = reducer(initialState(), makeMove("e4"));
      const fenAfterE4 = state.fen;
      state = reducer(state, makeMove("e5"));
      state = reducer(state, undoMove());

      expect(state.fen).toBe(fenAfterE4);
      expect(state.history).toEqual(["e4"]);
      expect(state.positions).toHaveLength(2);
      expect(state.currentPositionIndex).toBe(1);
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(fenAfterE4)));
    });

    it("does nothing at the starting position", () => {
      const state = reducer(initialState(), undoMove());
      expect(state.positions).toHaveLength(1);
      expect(state.fen).toBe(STANDARD_FEN);
    });
  });

  describe("navigation", () => {
    const play = (): ChessGameState => {
      let state = initialState();
      for (const move of ["e4", "e5", "Nf3"]) {
        state = reducer(state, makeMove(move));
      }
      return state;
    };

    it("goToPosition sets fen and legal moves for that ply", () => {
      let state = play();
      const fenAtPly1 = state.positions[1].fen;
      state = reducer(state, goToPosition(1));

      expect(state.currentPositionIndex).toBe(1);
      expect(state.fen).toBe(fenAtPly1);
      expect(sorted(state.moves)).toEqual(sorted(movesFromFen(fenAtPly1)));
      // history is untouched by navigation
      expect(state.history).toEqual(["e4", "e5", "Nf3"]);
      expect(state.positions).toHaveLength(4);
    });

    it("goToPosition ignores out-of-range indices", () => {
      let state = play();
      const before = state;
      state = reducer(state, goToPosition(99));
      expect(state).toEqual(before);
      state = reducer(state, goToPosition(-1));
      expect(state).toEqual(before);
    });

    it("goBackward and goForward step through positions", () => {
      let state = play();
      state = reducer(state, goBackward());
      expect(state.currentPositionIndex).toBe(2);
      expect(state.fen).toBe(state.positions[2].fen);
      expect(sorted(state.moves)).toEqual(
        sorted(movesFromFen(state.positions[2].fen)),
      );

      state = reducer(state, goForward());
      expect(state.currentPositionIndex).toBe(3);
      expect(state.fen).toBe(state.positions[3].fen);

      // goForward at the latest position is a no-op
      state = reducer(state, goForward());
      expect(state.currentPositionIndex).toBe(3);

      // goBackward at ply 0 is a no-op
      state = reducer(state, goToPosition(0));
      state = reducer(state, goBackward());
      expect(state.currentPositionIndex).toBe(0);
    });
  });
});
