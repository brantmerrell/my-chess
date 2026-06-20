import { fetchPuzzle } from "../fetchPuzzle";
import { LICHESS_URL } from "../../constants/env";
import { LiChessPuzzleResponse } from "../../models/LiChessPuzzleResponse";
import defaultLiChessPuzzle from "../../data/liChessPuzzle.json";

export const getLiChessDailyPuzzle = async (): Promise<LiChessPuzzleResponse> => {
  try {
    return await fetchPuzzle<LiChessPuzzleResponse>(`${LICHESS_URL}/api/puzzle/daily`);
  } catch (error) {
    console.error("API Fetch Error:", error);
    return (defaultLiChessPuzzle as unknown) as LiChessPuzzleResponse;
  }
};
