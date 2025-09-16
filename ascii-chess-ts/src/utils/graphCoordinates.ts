export const squareToCoords = (square: string): [number, number] => {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = 8 - parseInt(square[1]);
  return [file, rank];
};

export const gridToScreen = (
  coords: [number, number],
  width: number,
  height: number,
): [number, number] => {
  const margin = 50;
  const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;
  return [
    margin + coords[0] * gridSize + gridSize / 2,
    margin + coords[1] * gridSize + gridSize / 2,
  ];
};

export const screenToSquare = (
  x: number,
  y: number,
  width: number,
  height: number,
): string | null => {
  const margin = 50;
  const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;

  const gridX = Math.round((x - margin - gridSize / 2) / gridSize);
  const gridY = Math.round((y - margin - gridSize / 2) / gridSize);

  if (gridX < 0 || gridX > 7 || gridY < 0 || gridY > 7) {
    return null;
  }

  const file = String.fromCharCode("a".charCodeAt(0) + gridX);
  const rank = 8 - gridY;
  return file + rank;
};