import { GameResult, GameEndReason } from "../types/lichessGame";

interface LichessGameEndData {
  status: string;
  winner?: "white" | "black";
}

export function parseGameResult(
  data: LichessGameEndData,
  myColor: "white" | "black" | null,
): GameResult | undefined {
  const { status, winner } = data;

  console.log("[gameResultParser] Parsing game result:", {
    status,
    winner,
    myColor,
  });

  if (!myColor) return undefined;

  let reason: GameEndReason = "unknown";
  let result: "win" | "loss" | "draw" = "draw";

  switch (status) {
    case "mate":
      reason = "mate";
      break;
    case "resign":
      reason = "resign";
      break;
    case "timeout":
    case "outoftime":
      reason = "timeout";
      break;
    case "draw":
      reason = "draw";
      break;
    case "stalemate":
      reason = "stalemate";
      break;
    case "variantEnd":
    case "unknownFinish":
      reason = "unknown";
      break;
    case "aborted":
      reason = "abort";
      break;
    default:
      console.warn("[gameResultParser] Unknown game status:", status);
      reason = "unknown";
  }

  if (winner) {
    result = winner === myColor ? "win" : "loss";
  } else {
    result = "draw";
  }

  return {
    result,
    reason,
    winner: winner || null,
  };
}
