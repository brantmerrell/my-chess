import * as d3 from "d3";
import { GRID_MARGIN } from "../../utils/graphConstants";

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
      .attr("fill", "#666")
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
      .attr("fill", "#666")
      .text(rank);
  }
};
