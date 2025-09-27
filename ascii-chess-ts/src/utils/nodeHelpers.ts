import { PieceDisplayMode } from "../types/chess";
import { LinkNode } from "../types/visualization";
import { FONT_SIZES, TEXT_POSITIONING } from "./graphConstants";

type SimulationNode = LinkNode & { x?: number; y?: number };
type SimulationLink = {
  source: SimulationNode;
  target: SimulationNode;
  type: string;
};

export const calculateNodeCheckStatus = (
  node: SimulationNode,
  links: SimulationLink[],
): boolean => {
  if (node.piece_type.toLowerCase() !== "k") {
    return false;
  }

  return links.some(
    (link) => link.type === "threat" && link.target.square === node.square,
  );
};

export const getNodeFontSize = (
  displayMode: PieceDisplayMode,
  showGrid: boolean,
  isLabel: boolean = false,
): string => {
  if (isLabel) {
    return FONT_SIZES[displayMode]?.label || FONT_SIZES.default.label;
  }

  if (displayMode === "symbols") {
    return FONT_SIZES.symbols.main;
  }

  if (displayMode === "full") {
    return FONT_SIZES.full.main;
  }

  if (displayMode === "masked") {
    return showGrid
      ? FONT_SIZES.masked.mainWithGrid
      : FONT_SIZES.masked.mainNoGrid;
  }

  return FONT_SIZES[displayMode]?.main || FONT_SIZES.default.main;
};

export const getNodeTextPositioning = (
  displayMode: PieceDisplayMode,
  showGrid: boolean,
  isLabel: boolean = false,
): string | number => {
  if (isLabel) {
    const positioning =
      TEXT_POSITIONING[displayMode] || TEXT_POSITIONING.default;
    return positioning.labelDy;
  }

  if (displayMode === "full") {
    return TEXT_POSITIONING.full.mainDy;
  }

  if (displayMode === "symbols") {
    return showGrid
      ? TEXT_POSITIONING.symbols.mainDyWithGrid
      : TEXT_POSITIONING.symbols.mainDyNoGrid;
  }

  if (displayMode === "masked") {
    return showGrid
      ? TEXT_POSITIONING.masked.mainDyWithGrid
      : TEXT_POSITIONING.masked.mainDyNoGrid;
  }

  if (displayMode === "letters") {
    return showGrid
      ? TEXT_POSITIONING.letters.mainDyWithGrid
      : TEXT_POSITIONING.letters.mainDyNoGrid;
  }

  return TEXT_POSITIONING.default.mainDy;
};
