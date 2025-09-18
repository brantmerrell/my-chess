export const GRID_MARGIN = 50;
export const NODE_RADIUS = 18;

export const FONT_SIZES = {
  symbols: {
    main: "24px",
    label: "10px"
  },
  full: {
    main: "60px",
    label: "10px"
  },
  masked: {
    mainWithGrid: "36px",
    mainNoGrid: "28px",
    label: "10px"
  },
  letters: {
    main: "24px",
    label: "10px"
  },
  default: {
    main: "24px",
    label: "10px"
  }
} as const;

export const TEXT_POSITIONING = {
  symbols: {
    mainDy: 8,
    mainDyWithGrid: 8,
    mainDyNoGrid: 0,
    labelDy: "1.2em"
  },
  full: {
    mainDy: 18,
    labelDy: "-2px"
  },
  masked: {
    mainDyWithGrid: 18,
    mainDyNoGrid: 8,
    labelDy: "0.2em"
  },
  letters: {
    mainDyWithGrid: 8,
    mainDyNoGrid: 0,
    labelDy: "1.2em"
  },
  default: {
    mainDy: 0,
    labelDy: "1.2em"
  }
} as const;

export const STROKE_WIDTHS = {
  normal: 3,
  inCheck: 3
} as const;

export const CHESS_FONT_FAMILY = "Noto Sans Mono, Source Code Pro, Consolas, DejaVu Sans Mono, monospace";
