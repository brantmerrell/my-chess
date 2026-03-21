import * as d3 from "d3";
import { GRID_MARGIN } from "../../utils/graphConstants";
import { LinkNode } from "../../types/visualization";
import { squareToCoords } from "../../utils/graphCoordinates";

export const renderGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
) => {
  const margin = GRID_MARGIN;
  const boardSize = Math.min(width - 2 * margin, height - 2 * margin);
  const gridSize = boardSize / 8;

  // Center the board horizontally if width > height
  const xOffset = width > height ? (width - boardSize) / 2 : margin;
  // Center the board vertically if height > width
  const yOffset = height > width ? (height - boardSize) / 2 : margin;

  const gridSquares = g.append("g").attr("class", "grid-squares");

  // Draw alternating colored squares
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      gridSquares
        .append("rect")
        .attr("x", xOffset + col * gridSize)
        .attr("y", yOffset + row * gridSize)
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("fill", isLight ? "#374151" : "#1f2937");
    }
  }

  const gridLines = g.append("g").attr("class", "grid");

  for (let i = 0; i <= 8; i++) {
    gridLines
      .append("line")
      .attr("x1", xOffset + i * gridSize)
      .attr("y1", yOffset)
      .attr("x2", xOffset + i * gridSize)
      .attr("y2", yOffset + 8 * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    gridLines
      .append("line")
      .attr("x1", xOffset)
      .attr("y1", yOffset + i * gridSize)
      .attr("x2", xOffset + 8 * gridSize)
      .attr("y2", yOffset + i * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
  }
};

/**
 * Renders the board with heatmap coloring, replacing the alternating grid.
 * Darkness encodes total pressure (hw + hb): more pressure = darker square.
 * Redness encodes imbalance abs(hw - hb): one-sided = redder, balanced = neutral gray.
 * Zero-pressure squares get a neutral dark gray.
 */
export const renderHeatmap = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: LinkNode[],
  width: number,
  height: number,
  flipBoard: boolean = false,
) => {
  const margin = GRID_MARGIN;
  const boardSize = Math.min(width - 2 * margin, height - 2 * margin);
  const gridSize = boardSize / 8;

  const xOffset = width > height ? (width - boardSize) / 2 : margin;
  const yOffset = height > width ? (height - boardSize) / 2 : margin;

  // Build a lookup from square name to heatmap values
  const heatBySquare = new Map<string, { hw: number; hb: number }>();
  const maxSum = 5;
  nodes.forEach((node) => {
    if (node.hw != null && node.hb != null) {
      heatBySquare.set(node.square, { hw: node.hw, hb: node.hb });
    }
  });

  const heatmapSquares = g.append("g").attr("class", "heatmap-squares");

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const fileIndex = flipBoard ? 7 - col : col;
      const rankIndex = flipBoard ? row : 7 - row;
      const square = String.fromCharCode(97 + fileIndex) + (rankIndex + 1);
      const heat = heatBySquare.get(square);

      const sum = heat ? heat.hw + heat.hb : 0;
      // Interpolate from light (55,65,81) at sum=0 to dark (31,41,55) at sum=maxSum
      const t = Math.min(sum / maxSum, 1);
      const r = Math.round(55 + (31 - 55) * t);
      const g = Math.round(65 + (41 - 65) * t);
      const b = Math.round(81 + (55 - 81) * t);
      const fill = `rgb(${r}, ${g}, ${b})`;

      heatmapSquares
        .append("rect")
        .attr("x", xOffset + col * gridSize)
        .attr("y", yOffset + row * gridSize)
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("fill", fill);
    }
  }

  // Grid lines on top
  const gridLines = g.append("g").attr("class", "grid");
  for (let i = 0; i <= 8; i++) {
    gridLines
      .append("line")
      .attr("x1", xOffset + i * gridSize)
      .attr("y1", yOffset)
      .attr("x2", xOffset + i * gridSize)
      .attr("y2", yOffset + 8 * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.3);

    gridLines
      .append("line")
      .attr("x1", xOffset)
      .attr("y1", yOffset + i * gridSize)
      .attr("x2", xOffset + 8 * gridSize)
      .attr("y2", yOffset + i * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.3);
  }
};

export const renderCoordinates = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  flipBoard: boolean = false,
) => {
  const margin = GRID_MARGIN;
  const boardSize = Math.min(width - 2 * margin, height - 2 * margin);
  const gridSize = boardSize / 8;

  // Center the board horizontally if width > height
  const xOffset = width > height ? (width - boardSize) / 2 : margin;
  // Center the board vertically if height > width
  const yOffset = height > width ? (height - boardSize) / 2 : margin;

  const coordinates = g.append("g").attr("class", "coordinates");

  for (let i = 0; i < 8; i++) {
    const fileIndex = flipBoard ? 7 - i : i;
    const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
    coordinates
      .append("text")
      .attr("x", xOffset + i * gridSize + gridSize / 2)
      .attr("y", yOffset + 8 * gridSize + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-family", "monospace")
      .attr("fill", "FloralWhite")
      .text(file);
  }

  for (let i = 0; i < 8; i++) {
    const rank = flipBoard ? i + 1 : 8 - i;
    coordinates
      .append("text")
      .attr("x", xOffset - 20)
      .attr("y", yOffset + i * gridSize + gridSize / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "18px")
      .attr("font-family", "monospace")
      .attr("fill", "FloralWhite")
      .text(rank);
  }
};
