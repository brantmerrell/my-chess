import { GRID_MARGIN } from "./graphConstants";

export const squareToCoords = (square: string): [number, number] => {
  if (!square || square.length !== 2) {
    throw new Error(
      `Invalid square format: ${square}. Expected format like "a1"`,
    );
  }

  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]);

  if (file < 0 || file > 7 || rank < 1 || rank > 8 || isNaN(rank)) {
    throw new Error(`Invalid square: ${square}. Must be between a1 and h8`);
  }

  return [file, 8 - rank];
};

export const gridToScreen = (
  coords: [number, number],
  width: number,
  height: number,
): [number, number] => {
  const margin = GRID_MARGIN;
  const boardSize = Math.min(width - 2 * margin, height - 2 * margin);
  const gridSize = boardSize / 8;

  // Center the board horizontally if width > height
  const xOffset = width > height ? (width - boardSize) / 2 : margin;
  // Center the board vertically if height > width
  const yOffset = height > width ? (height - boardSize) / 2 : margin;

  return [
    xOffset + coords[0] * gridSize + gridSize / 2,
    yOffset + coords[1] * gridSize + gridSize / 2,
  ];
};

export const screenToSquare = (
  x: number,
  y: number,
  width: number,
  height: number,
): string | null => {
  const margin = GRID_MARGIN;
  const boardSize = Math.min(width - 2 * margin, height - 2 * margin);
  const gridSize = boardSize / 8;

  // Center the board horizontally if width > height
  const xOffset = width > height ? (width - boardSize) / 2 : margin;
  // Center the board vertically if height > width
  const yOffset = height > width ? (height - boardSize) / 2 : margin;

  const gridX = Math.round((x - xOffset - gridSize / 2) / gridSize);
  const gridY = Math.round((y - yOffset - gridSize / 2) / gridSize);

  if (gridX < 0 || gridX > 7 || gridY < 0 || gridY > 7) {
    return null;
  }

  const file = String.fromCharCode("a".charCodeAt(0) + gridX);
  const rank = 8 - gridY;
  return file + rank;
};
