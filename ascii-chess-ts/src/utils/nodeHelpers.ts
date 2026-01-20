import { PieceDisplayMode } from "../types/chess";
import { LinkNode } from "../types/visualization";
import { getFontSizes, getTextPositioning } from "./graphConstants";

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
  height: number,
  isLabel: boolean = false,
): number => {
  const fontSizes = getFontSizes(height);

  if (isLabel) {
    return fontSizes[displayMode]?.label || fontSizes.default.label;
  }

  if (displayMode === "symbols") {
    return fontSizes.symbols.main;
  }

  if (displayMode === "full") {
    return fontSizes.full.main;
  }

  if (displayMode === "masked") {
    return showGrid
      ? fontSizes.masked.mainWithGrid
      : fontSizes.masked.mainNoGrid;
  }

  return fontSizes[displayMode]?.main || fontSizes.default.main;
};

export const getNodeTextPositioning = (
  displayMode: PieceDisplayMode,
  showGrid: boolean,
  height: number,
  isLabel: boolean = false,
): number => {
  const positioning = getTextPositioning(height);

  if (isLabel) {
    const modePositioning = positioning[displayMode] || positioning.default;
    return modePositioning.labelDy;
  }

  if (displayMode === "full") {
    return positioning.full.mainDy;
  }

  if (displayMode === "symbols") {
    return showGrid
      ? positioning.symbols.mainDyWithGrid
      : positioning.symbols.mainDyNoGrid;
  }

  if (displayMode === "masked") {
    return showGrid
      ? positioning.masked.mainDyWithGrid
      : positioning.masked.mainDyNoGrid;
  }

  if (displayMode === "letters") {
    return showGrid
      ? positioning.letters.mainDyWithGrid
      : positioning.letters.mainDyNoGrid;
  }

  return positioning.default.mainDy;
};
