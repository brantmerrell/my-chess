import * as d3 from "d3";

export const renderGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
) => {
  const margin = 50;
  const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;

  const gridLines = g.append("g").attr("class", "grid");

  for (let i = 0; i <= 8; i++) {
    gridLines
      .append("line")
      .attr("x1", margin + i * gridSize)
      .attr("y1", margin)
      .attr("x2", margin + i * gridSize)
      .attr("y2", margin + 8 * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    gridLines
      .append("line")
      .attr("x1", margin)
      .attr("y1", margin + i * gridSize)
      .attr("x2", margin + 8 * gridSize)
      .attr("y2", margin + i * gridSize)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
  }
};

export const renderCoordinates = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
) => {
  const margin = 50;
  const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;
  const coordinates = g.append("g").attr("class", "coordinates");

  for (let i = 0; i < 8; i++) {
    const file = String.fromCharCode("a".charCodeAt(0) + i);
    coordinates
      .append("text")
      .attr("x", margin + i * gridSize + gridSize / 2)
      .attr("y", margin + 8 * gridSize + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-family", "monospace")
      .attr("fill", "#666")
      .text(file);
  }

  for (let i = 0; i < 8; i++) {
    const rank = 8 - i;
    coordinates
      .append("text")
      .attr("x", margin - 20)
      .attr("y", margin + i * gridSize + gridSize / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "18px")
      .attr("font-family", "monospace")
      .attr("fill", "#666")
      .text(rank);
  }
};
