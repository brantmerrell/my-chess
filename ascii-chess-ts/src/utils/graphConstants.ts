export const GRID_MARGIN = 50;
export const NODE_RADIUS = 18;

// Base height used for proportion calculations
const BASE_HEIGHT = 600;

// Font sizes as proportions of container height
export const getFontSizes = (height: number) => {
  const scale = height / BASE_HEIGHT;
  return {
    symbols: {
      main: 24 * scale,
      label: 10 * scale,
    },
    full: {
      main: 45 * scale,
      label: 10 * scale,
    },
    masked: {
      mainWithGrid: 36 * scale,
      mainNoGrid: 28 * scale,
      label: 10 * scale,
    },
    letters: {
      main: 24 * scale,
      label: 10 * scale,
    },
    default: {
      main: 24 * scale,
      label: 10 * scale,
    },
  };
};

// Text positioning as proportions of container height
export const getTextPositioning = (height: number) => {
  const scale = height / BASE_HEIGHT;
  return {
    symbols: {
      mainDy: 8 * scale,
      mainDyWithGrid: 8 * scale,
      mainDyNoGrid: 0,
      labelDy: 12 * scale,
    },
    full: {
      mainDy: 15 * scale,
      labelDy: -2 * scale,
    },
    masked: {
      mainDyWithGrid: 18 * scale,
      mainDyNoGrid: 8 * scale,
      labelDy: 2 * scale,
    },
    letters: {
      mainDyWithGrid: 8 * scale,
      mainDyNoGrid: 0,
      labelDy: 12 * scale,
    },
    default: {
      mainDy: 0,
      labelDy: 12 * scale,
    },
  };
};

export const STROKE_WIDTHS = {
  normal: 3,
  inCheck: 3,
} as const;

export const CHESS_FONT_FAMILY =
  "Noto Sans Mono, Source Code Pro, Consolas, DejaVu Sans Mono, monospace";
