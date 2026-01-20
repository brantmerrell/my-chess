import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { makeMove, loadFen } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { MoveCache, NotificationCallback } from "../types/lichessGame";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function useMoveProcessor() {
  const dispatch = useDispatch();

  const moveCacheRef = useRef<MoveCache>({
    processedMoves: [],
    gameInstance: new ChessGame(),
    lastMoveIndex: -1,
  });

  const pendingSentMovesRef = useRef<Set<string>>(new Set());
  const notificationCallbackRef = useRef<NotificationCallback | null>(null);

  const setNotificationCallback = useCallback(
    (callback: NotificationCallback | null) => {
      notificationCallbackRef.current = callback;
    },
    [],
  );

  const resetCache = useCallback(() => {
    moveCacheRef.current = {
      processedMoves: [],
      gameInstance: new ChessGame(),
      lastMoveIndex: -1,
    };
    pendingSentMovesRef.current.clear();
  }, []);

  const resetToStartingPosition = useCallback(() => {
    resetCache();
    dispatch(loadFen({ fen: STARTING_FEN }));
  }, [dispatch, resetCache]);

  const addPendingMove = useCallback((uciMove: string) => {
    pendingSentMovesRef.current.add(uciMove);
  }, []);

  const getGameInstance = useCallback(() => {
    return moveCacheRef.current.gameInstance;
  }, []);

  const processMoves = useCallback(
    (movesString: string) => {
      if (!movesString) {
        console.log(
          "[useMoveProcessor] No moves string, resetting to initial position",
        );
        resetToStartingPosition();
        return;
      }

      const moves = movesString.split(" ").filter((m) => m);
      const cache = moveCacheRef.current;

      // Check if a full reset is necessary (game restart or different game)
      if (
        moves.length < cache.processedMoves.length ||
        (cache.processedMoves.length > 0 &&
          !movesString.startsWith(cache.processedMoves.join(" ")))
      ) {
        console.log(
          "[useMoveProcessor] Full game reset detected, replaying all moves",
        );
        cache.processedMoves = [];
        cache.gameInstance = new ChessGame();
        cache.lastMoveIndex = -1;
        dispatch(loadFen({ fen: STARTING_FEN }));
      }

      const newMoves = moves.slice(cache.lastMoveIndex + 1);
      if (newMoves.length === 0) {
        return;
      }

      console.log(
        `[useMoveProcessor] Processing ${newMoves.length} new moves starting from index ${cache.lastMoveIndex + 1}`,
      );

      for (let i = 0; i < newMoves.length; i++) {
        const uciMove = newMoves[i];
        try {
          const from = uciMove.substring(0, 2);
          const to = uciMove.substring(2, 4);
          const promotion = uciMove.substring(4, 5);

          const legalMoves = cache.gameInstance.getVerboseMoves();
          console.log(
            `[useMoveProcessor] Processing UCI move: ${uciMove}, from: ${from}, to: ${to}, promotion: ${promotion}`,
          );

          // Special logging for castling moves
          const isCastling =
            (from === "e1" && (to === "g1" || to === "c1")) ||
            (from === "e8" && (to === "g8" || to === "c8"));
          if (isCastling) {
            console.log(`[useMoveProcessor] CASTLING DETECTED: ${uciMove}`);
            console.log(
              `[useMoveProcessor] Current FEN before move: ${cache.gameInstance.toFen()}`,
            );
            console.log(
              `[useMoveProcessor] Available castling moves:`,
              legalMoves.filter(
                (m: any) =>
                  m.flags && (m.flags.includes("k") || m.flags.includes("q")),
              ),
            );
          }

          const matchingMove = legalMoves.find(
            (m: any) =>
              m.from === from &&
              m.to === to &&
              (!promotion || m.promotion === promotion),
          );

          if (matchingMove) {
            console.log(
              `[useMoveProcessor] Found matching move: ${matchingMove.san} for UCI ${uciMove}`,
            );
            if (isCastling) {
              console.log(`[useMoveProcessor] Castling move details:`, {
                san: matchingMove.san,
                flags: matchingMove.flags,
                from: matchingMove.from,
                to: matchingMove.to,
              });
            }

            try {
              const moveResult = cache.gameInstance.makeMove(matchingMove.san);
              console.log(
                `[useMoveProcessor] Move result:`,
                moveResult ? "SUCCESS" : "FAILED",
              );
              if (isCastling) {
                console.log(
                  `[useMoveProcessor] FEN after castling: ${cache.gameInstance.toFen()}`,
                );
              }
              dispatch(makeMove(matchingMove.san));
              cache.processedMoves.push(uciMove);
              cache.lastMoveIndex++;

              if (notificationCallbackRef.current) {
                if (pendingSentMovesRef.current.has(uciMove)) {
                  pendingSentMovesRef.current.delete(uciMove);
                  notificationCallbackRef.current(
                    `${uciMove} confirmed by Lichess`,
                    "success",
                  );
                } else {
                  notificationCallbackRef.current(
                    `${uciMove} received from opponent`,
                    "info",
                  );
                }
              }
            } catch (error) {
              console.error(
                `[useMoveProcessor] Failed to make move ${matchingMove.san}:`,
                error,
              );
              cache.lastMoveIndex++;
              continue;
            }
          } else {
            console.error(
              `[useMoveProcessor] No matching move found for UCI ${uciMove} (${from}-${to})`,
            );
            if (isCastling) {
              console.error(`[useMoveProcessor] Castling rights and position:`, {
                fen: cache.gameInstance.toFen(),
                availableMoves: legalMoves
                  .map((m: any) => `${m.from}-${m.to}`)
                  .slice(0, 10),
              });
            }

            // Mark this move as processed even though it couldn't be applied
            // This prevents infinite loops
            cache.lastMoveIndex++;
            console.log(
              `[useMoveProcessor] Skipping invalid move and continuing...`,
            );
            continue;
          }
        } catch (error) {
          console.error(
            `[useMoveProcessor] Error processing move ${uciMove}:`,
            error,
          );
          // Mark as processed to avoid infinite loops
          cache.lastMoveIndex++;
          continue;
        }
      }
    },
    [dispatch, resetToStartingPosition],
  );

  return {
    processMoves,
    resetCache,
    resetToStartingPosition,
    addPendingMove,
    getGameInstance,
    setNotificationCallback,
    moveCacheRef,
  };
}
