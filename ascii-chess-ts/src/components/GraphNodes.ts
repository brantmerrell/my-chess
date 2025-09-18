import * as d3 from "d3";
import { PieceDisplayMode } from "../types/chess";
import { LinkNode } from "../types/visualization";
import { getPieceDisplay } from "../utils/chessDisplay";
import { getNodeStyle } from "../utils/graphStyles";
import {
  calculateNodeCheckStatus,
  getNodeFontSize,
  getNodeTextPositioning
} from "../utils/nodeHelpers";
import { NODE_RADIUS, CHESS_FONT_FAMILY, STROKE_WIDTHS } from "../utils/graphConstants";

type SimulationNode = LinkNode & d3.SimulationNodeDatum;
type SimulationLink = {
  source: SimulationNode;
  target: SimulationNode;
  type: string;
};

export const renderNodes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  visibleNodes: SimulationNode[],
  links: SimulationLink[],
  displayMode: PieceDisplayMode,
  showGrid: boolean,
  dragBehavior: d3.DragBehavior<SVGGElement, SimulationNode, SimulationNode | d3.SubjectPosition>,
) => {
  const nodeCheckStatus = new Map<string, boolean>();
  visibleNodes.forEach(node => {
    nodeCheckStatus.set(node.square, calculateNodeCheckStatus(node, links));
  });

  const node = g
    .append("g")
    .selectAll<SVGGElement, SimulationNode>("g")
    .data(visibleNodes)
    .join("g")
    .call(dragBehavior);

  if (displayMode !== "full") {
    node
      .append("circle")
      .attr("r", NODE_RADIUS)
      .attr("fill", (d) => getNodeStyle(d.color).background)
      .attr("stroke", (d) => {
        const isInCheck = nodeCheckStatus.get(d.square) || false;
        return isInCheck ? "crimson" : getNodeStyle(d.color).stroke;
      })
      .attr("stroke-width", (d) => {
        const isInCheck = nodeCheckStatus.get(d.square) || false;
        return isInCheck ? STROKE_WIDTHS.inCheck : STROKE_WIDTHS.normal;
      });
  }

  node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .attr("fill", (d) => {
      const isInCheck = nodeCheckStatus.get(d.square) || false;
      return isInCheck ? "crimson" : getNodeStyle(d.color).fill;
    })
    .each(function (d) {
      const textElement = d3.select(this);
      const isInCheck = nodeCheckStatus.get(d.square) || false;

      textElement
        .append("tspan")
        .attr("x", 0)
        .attr("dy", getNodeTextPositioning(displayMode, showGrid, false))
        .attr("font-size", getNodeFontSize(displayMode, showGrid, false))
        .attr("font-family", CHESS_FONT_FAMILY)
        .attr("font-weight", "500")
        .attr("font-variant-numeric", "tabular-nums")
        .attr("fill", () => {
          return isInCheck ? "red" : getNodeStyle(d.color).fill;
        })
        .text(getPieceDisplay(d.piece_type, d.color, displayMode));

      if (!showGrid) {
        textElement
          .append("tspan")
          .attr("x", 0)
          .attr("dy", getNodeTextPositioning(displayMode, showGrid, true))
          .attr("font-size", getNodeFontSize(displayMode, showGrid, true))
          .attr("font-weight", "bold")
          .attr("fill", () => {
            if (displayMode === "full") {
              return d.color === "white" ? "black" : "white";
            }
            return isInCheck ? "red" : getNodeStyle(d.color).fill;
          })
          .text(d.square);
      }
    });

  return node;
};

export const renderPhantomMarkers = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  phantomNodes: SimulationNode[],
  links: SimulationLink[],
) => {
  const phantomThreatStatus = new Map<string, { kingBlocked: boolean; directThreat: boolean }>();

  phantomNodes.forEach(node => {
    const kingBlocked = links.some(
      link => link.type === "king_blocked_threat" && link.target.square === node.square
    );
    const directThreat = links.some(
      link => link.type === "threat" && link.target.square === node.square
    );
    phantomThreatStatus.set(node.square, { kingBlocked, directThreat });
  });

  return g
    .append("g")
    .selectAll<SVGTextElement, SimulationNode>("text.phantom-marker")
    .data(phantomNodes)
    .join("text")
    .attr("class", "phantom-marker")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("font-size", "24px")
    .attr("font-family", CHESS_FONT_FAMILY)
    .attr("font-weight", "500")
    .text("⊡")
    .attr("fill", (d) => {
      const status = phantomThreatStatus.get(d.square);
      return status && (status.kingBlocked || status.directThreat)
        ? "darkgoldenrod"
        : "lightblue";
    })
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);
};
