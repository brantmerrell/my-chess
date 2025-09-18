import React from "react";
import { PieceDisplayMode } from "../types/chess";
import Selector from "./Selector";

interface PieceViewSelectorProps {
  displayMode: PieceDisplayMode;
  onDisplayModeChange: (mode: PieceDisplayMode) => void;
}

const PIECE_VIEW_OPTIONS = [
  { value: "symbols", label: "Unicode" },
  { value: "full", label: "Full" },
  { value: "letters", label: "Letters" },
  { value: "masked", label: "Asterisk" },
] as const;

const PieceViewSelector: React.FC<PieceViewSelectorProps> = ({
  displayMode,
  onDisplayModeChange,
}) => {
  return (
    <Selector
      id="piece-view-selector"
      label={
        <span>
          <u>P</u>iece View
        </span>
      }
      value={displayMode}
      onChange={onDisplayModeChange}
      options={PIECE_VIEW_OPTIONS}
    />
  );
};

export default PieceViewSelector;
