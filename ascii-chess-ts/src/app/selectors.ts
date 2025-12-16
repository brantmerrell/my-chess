import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { ChessGame } from "../chess/chessGame";

// Base selectors
const selectChessGame = (state: RootState) => state.chessGame;
const selectPositions = (state: RootState) => state.chessGame.positions;
const selectHistory = (state: RootState) => state.chessGame.history;
const selectCurrentPositionIndex = (state: RootState) =>
  state.chessGame.currentPositionIndex;

// Memoized fenHistory - computed from positions
export const selectFenHistory = createSelector(
  [selectPositions, selectHistory],
  (positions, history) => {
    const game = new ChessGame(positions[0].fen);
    const fens = [game.getFen()];
    history.forEach((move) => {
      game.makeMove(move);
      fens.push(game.getFen());
    });
    return fens;
  }
);

// Memoized piece counts for all positions
export const selectPieceData = createSelector(
  [selectFenHistory],
  (fenHistory) => fenHistory.map(ChessGame.countPiecesFromFen)
);

// Memoized mobility data for all positions
export const selectMobilityData = createSelector(
  [selectFenHistory],
  (fenHistory) => fenHistory.map(ChessGame.calculateMobilityFromFen)
);

// Memoized point data for all positions
export const selectPointData = createSelector(
  [selectFenHistory],
  (fenHistory) => {
    const piecePointValues: { [key: string]: number } = {
      k: 0,
      K: 0,
      q: 9,
      Q: 9,
      r: 5,
      R: 5,
      b: 3,
      B: 3,
      n: 3,
      N: 3,
      p: 1,
      P: 1,
    };

    return fenHistory.map((fen) => {
      const position = fen.split(" ")[0];
      let whitePoints = 0;
      let blackPoints = 0;

      for (const char of position) {
        if (piecePointValues[char] !== undefined) {
          if (char === char.toUpperCase()) {
            whitePoints += piecePointValues[char];
          } else {
            blackPoints += piecePointValues[char];
          }
        }
      }

      return { white: whitePoints, black: blackPoints };
    });
  }
);

// Is at latest position
export const selectIsAtLatestPosition = createSelector(
  [selectCurrentPositionIndex, selectPositions],
  (currentIndex, positions) => currentIndex === positions.length - 1
);
