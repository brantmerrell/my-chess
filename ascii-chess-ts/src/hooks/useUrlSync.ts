import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { RootState, loadFen, makeMove } from "../app/store";
import { setSelectedSetup } from "../reducers/setups/setups.actions";
import {
  CUSTOM_SETUP_ID,
  SetupOptions,
  getSetupById,
  StaticPositionSetup,
} from "../models/SetupOptions";
import { SetupMode } from "../components/controls/SetupMode";

export type AppMode = SetupMode;

interface UrlState {
  mode: AppMode;
  setup: string;
  fen?: string;
  pgn?: string;
}

/**
 * Parses URL search params into app state
 */
export const parseUrlParams = (): UrlState => {
  const params = new URLSearchParams(window.location.search);

  const mode = (params.get("mode") as AppMode) || "analysis";
  const setup = params.get("setup") || SetupOptions.STANDARD;
  const fen = params.get("fen") || undefined;
  const pgn = params.get("pgn") || undefined;

  return { mode, setup, fen, pgn };
};

/**
 * Builds URL search params from app state
 */
const buildUrlParams = (
  mode: AppMode,
  setup: string,
  initialFen?: string,
  pgn?: string
): string => {
  const params = new URLSearchParams();

  // Always include mode
  params.set("mode", mode);

  // For play mode, that's all we need
  if (mode === "play") {
    return params.toString();
  }

  // For analysis mode, include setup
  params.set("setup", setup);

  // For custom setup, include FEN and PGN if present
  if (setup === CUSTOM_SETUP_ID) {
    if (initialFen) {
      params.set("fen", initialFen);
    }
    if (pgn) {
      params.set("pgn", pgn);
    }
  }

  return params.toString();
};

/**
 * Converts positions array to PGN-style move string
 * e.g., "1.e4 e5 2.Nf3 Nc6"
 */
const positionsToPgn = (positions: { san: string; ply: number }[]): string => {
  if (positions.length <= 1) return "";

  // Skip the first position (ply 0, which is the starting position)
  return positions
    .slice(1)
    .map((pos) => pos.san)
    .join(" ");
};

/**
 * Parses PGN string to array of SAN moves
 * e.g., "1.e4 e5 2.Nf3 Nc6" -> ["e4", "e5", "Nf3", "Nc6"]
 */
const parsePgnToMoves = (pgn: string): string[] => {
  if (!pgn) return [];

  // Remove move numbers and dots, split by whitespace
  return pgn
    .replace(/\d+\.+/g, "") // Remove move numbers like "1." or "1..."
    .split(/\s+/)
    .filter((move) => move.length > 0);
};

interface UseUrlSyncOptions {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

/**
 * Hook that syncs app state with URL parameters
 */
export const useUrlSync = ({ mode, onModeChange }: UseUrlSyncOptions) => {
  const dispatch = useAppDispatch();
  const selectedSetup = useSelector((state: RootState) => state.selectedSetup);
  const chessGameState = useSelector((state: RootState) => state.chessGame);
  const isInitialLoad = useRef(true);
  const isUpdatingFromUrl = useRef(false);

  // On mount, read URL and set initial state
  useEffect(() => {
    const urlState = parseUrlParams();

    isUpdatingFromUrl.current = true;

    // Set mode
    if (urlState.mode !== mode) {
      onModeChange(urlState.mode);
    }

    // Set setup
    if (urlState.setup && urlState.setup !== selectedSetup) {
      dispatch(setSelectedSetup(urlState.setup));

      // For non-static setups (puzzles), trigger the data fetch
      const setup = getSetupById(urlState.setup);
      if (setup && !(setup instanceof StaticPositionSetup)) {
        setup.load(dispatch);
      }
    }

    // For custom mode with FEN/PGN, load the position
    if (urlState.setup === CUSTOM_SETUP_ID && urlState.fen) {
      const moves = parsePgnToMoves(urlState.pgn || "");

      // Load the FEN first
      dispatch(loadFen({ fen: urlState.fen }));

      // Replay moves after a tick to ensure FEN is loaded
      if (moves.length > 0) {
        setTimeout(() => {
          moves.forEach((move) => {
            try {
              dispatch(makeMove(move));
            } catch (e) {
              console.error("Error replaying move from URL:", move, e);
            }
          });
          isUpdatingFromUrl.current = false;
        }, 0);
      } else {
        isUpdatingFromUrl.current = false;
      }
    } else {
      isUpdatingFromUrl.current = false;
    }

    isInitialLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when state changes
  useEffect(() => {
    // Skip during initial load or when updating from URL
    if (isInitialLoad.current || isUpdatingFromUrl.current) {
      return;
    }

    const initialFen = chessGameState.positions[0]?.fen;
    const pgn = positionsToPgn(chessGameState.positions);

    const newParams = buildUrlParams(mode, selectedSetup, initialFen, pgn);
    const currentParams = window.location.search.slice(1); // Remove leading "?"

    // Only update if params changed
    if (newParams !== currentParams) {
      const newUrl = `${window.location.pathname}?${newParams}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [mode, selectedSetup, chessGameState.positions]);

  return {
    parseUrlParams,
  };
};
