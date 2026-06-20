import { fetchPuzzle } from "../fetchPuzzle";
import { CHESS_COM_URL } from "../../constants/env";
import { ChessComPuzzleResponse } from "../../models/ChessComPuzzleResponse";

export const getChessComDailyPuzzle = async (): Promise<ChessComPuzzleResponse> => {
  console.log("Fetching Chess.com daily puzzle from:", CHESS_COM_URL);
  return fetchPuzzle<ChessComPuzzleResponse>(`${CHESS_COM_URL}/pub/puzzle`);
};
