import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import {
  RootState,
  goBackward,
  goForward,
  goToPosition,
} from "../app/store";
import { PieceDisplayMode } from "../types/chess";
import { ConnectionType } from "../types/visualization";
import { NotificationCallback } from "../types/lichessGame";
import { VerticalResizerHandle } from "../components/common/VerticalResizer";
import { BoardView } from "../components/controls/BoardViewControls";

interface GlobalKeybindingsOptions {
  submitUndoMove: () => void;
  showNotification: NotificationCallback;
  setDisplayMode: (mode: PieceDisplayMode) => void;
  onConnectionTypeChange: (type: ConnectionType) => void;
  setBoardView: (view: BoardView) => void;
  showMoveControls: boolean;
  setShowMoveControls: (show: boolean) => void;
  verticalResizerRef: React.RefObject<VerticalResizerHandle>;
}

const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement | null;
  element?.focus();
};

/**
 * Vim-style global keyboard shortcuts. Keys are ignored while an input,
 * select, or textarea is focused (except Escape, which blurs it).
 */
export function useGlobalKeybindings({
  submitUndoMove,
  showNotification,
  setDisplayMode,
  onConnectionTypeChange,
  setBoardView,
  showMoveControls,
  setShowMoveControls,
  verticalResizerRef,
}: GlobalKeybindingsOptions) {
  const dispatch = useAppDispatch();
  const chessGameState = useSelector((state: RootState) => state.chessGame);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() !== "escape" &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLSelectElement ||
          e.target instanceof HTMLTextAreaElement)
      ) {
        return;
      }
      switch (e.key) {
        case "Escape": {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
          break;
        }
        case "j":
          e.preventDefault();
          window.scrollBy({ top: 100, behavior: "smooth" });
          break;
        case "k":
          e.preventDefault();
          window.scrollBy({ top: -100, behavior: "smooth" });
          break;
        case "t":
          e.preventDefault();
          focusElement("#theme-selector");
          break;
        case "u":
          e.preventDefault();
          if (
            chessGameState.currentPositionIndex ===
            chessGameState.positions.length - 1
          ) {
            submitUndoMove();
          } else {
            showNotification("Must be at latest position to undo", "warning");
          }
          break;
        case "F":
          e.preventDefault();
          focusElement("#edit-string");
          break;
        case "f":
          e.preventDefault(); // Prevent alphabetical selection in dropdown
          focusElement("#position-selector");
          break;
        case "h":
          dispatch(goBackward());
          break;
        case "l":
          dispatch(goForward());
          break;
        case "^":
          dispatch(goToPosition(0));
          break;
        case "$":
          dispatch(goToPosition(chessGameState.positions.length - 1));
          break;
        case "c":
        case "C":
          e.preventDefault(); // Prevent default alphabetical selection
          if (!showMoveControls) setShowMoveControls(true); // Open Moves accordion
          focusElement("#selectedMove");
          break;
        case "M":
        case "m":
          e.preventDefault();
          if (!showMoveControls) setShowMoveControls(true); // Open Moves accordion
          focusElement("#move");
          break;
        case "v":
        case "]":
          e.preventDefault();
          verticalResizerRef.current?.increaseHeight();
          break;
        case "[":
          e.preventDefault();
          verticalResizerRef.current?.decreaseHeight();
          break;
        case "d":
        case "D":
          e.preventDefault();
          setBoardView("grid");
          break;
        case "p":
        case "P":
          e.preventDefault();
          setBoardView("heatmap");
          break;
        case "o":
        case "O":
          e.preventDefault();
          setBoardView("none");
          break;
        case "1":
          e.preventDefault();
          setDisplayMode("symbols");
          break;
        case "2":
          e.preventDefault();
          setDisplayMode("letters");
          break;
        case "3":
          e.preventDefault();
          setDisplayMode("full");
          break;
        case "4":
          e.preventDefault();
          setDisplayMode("masked");
          break;
        case "n":
        case "N":
          e.preventDefault();
          onConnectionTypeChange("none");
          break;
        case "a":
        case "A":
          e.preventDefault();
          onConnectionTypeChange("adjacencies");
          break;
        case "i":
        case "I":
          e.preventDefault();
          onConnectionTypeChange("links");
          break;
        case "g":
        case "G":
          e.preventDefault();
          onConnectionTypeChange("king_box");
          break;
        case "s":
        case "S":
          e.preventDefault();
          onConnectionTypeChange("shadows");
          break;
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    dispatch,
    chessGameState,
    submitUndoMove,
    showNotification,
    setDisplayMode,
    onConnectionTypeChange,
    setBoardView,
    showMoveControls,
    setShowMoveControls,
    verticalResizerRef,
  ]);
}
