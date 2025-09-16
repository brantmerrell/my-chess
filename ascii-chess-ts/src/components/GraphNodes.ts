import * as d3 from "d3";
import { PieceDisplayMode } from "../types/chess";
import { LinkNode } from "../types/visualization";
import { getPieceDisplay } from "../utils/chessDisplay";
import { getNodeStyle } from "../utils/graphStyles";

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
  dragBehavior: d3.DragBehavior<SVGGElement, SimulationNode, SimulationNode | d3.SubjectPosition>,
) => {
  const node = g
    .append("g")
    .selectAll<SVGGElement, SimulationNode>("g")
    .data(visibleNodes)
    .join("g")
    .call(dragBehavior);

  node
    .append("circle")
    .attr("r", 18)
    .attr("fill", (d) => getNodeStyle(d.color).background)
    .attr("stroke", (d) => {
      const isKing = d.piece_type.toLowerCase() === "k";
      const isInCheck =
        isKing &&
        links.some(
          (link) => link.type === "threat" && link.target.square === d.square,
        );

      return isInCheck ? "crimson" : getNodeStyle(d.color).stroke;
    })
    .attr("stroke-width", (d) => {
      const isKing = d.piece_type.toLowerCase() === "k";
      const isInCheck =
        isKing &&
        links.some(
          (link) => link.type === "threat" && link.target.square === d.square,
        );

      return isInCheck ? 3 : 3;
    });

  node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .attr("fill", (d) => {
      const isKing = d.piece_type.toLowerCase() === "k";
      const isInCheck =
        isKing &&
        links.some(
          (link) => link.type === "threat" && link.target.square === d.square,
        );

      return isInCheck ? "crimson" : getNodeStyle(d.color).fill;
    })
    .each(function (d) {
      const textElement = d3.select(this);

      textElement
        .append("tspan")
        .attr("x", 0)
        .attr("dy", 0)
        .attr("font-size", "24px")
        .attr(
          "font-family",
          "Noto Sans Mono, Source Code Pro, Consolas, DejaVu Sans Mono, monospace",
        )
        .attr("font-weight", "500")
        .attr("font-variant-numeric", "tabular-nums")
        .attr("fill", () => {
          const isKing = d.piece_type.toLowerCase() === "k";
          const isInCheck =
            isKing &&
            links.some(
              (link) =>
                link.type === "threat" && link.target.square === d.square,
            );

          return isInCheck ? "red" : getNodeStyle(d.color).fill;
        })
        .text(getPieceDisplay(d.piece_type, d.color, displayMode));

      textElement
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .attr("font-size", "10px")
        .text(d.square);
    });

  return node;
};

export const renderPhantomMarkers = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  phantomNodes: SimulationNode[],
  links: SimulationLink[],
) => {
  return g
    .append("g")
    .selectAll<SVGTextElement, SimulationNode>("text.phantom-marker")
    .data(phantomNodes)
    .join("text")
    .attr("class", "phantom-marker")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("font-size", "24px")
    .attr(
      "font-family",
      "Noto Sans Mono, Source Code Pro, Consolas, DejaVu Sans Mono, monospace",
    )
    .attr("font-weight", "500")
    .text("⊡")
    .attr("fill", (d) => {
      const kingBlockedEdge = links.find(
        (link) =>
          link.type === "king_blocked_threat" &&
          link.target.square === d.square,
      );
      const directThreat = links.some(
        (link) => link.type === "threat" && link.target.square === d.square,
      );

      return kingBlockedEdge || directThreat ? "darkgoldenrod" : "lightblue";
    })
    .attr("stroke", (d) => {
      const kingBlockedEdge = links.find(
        (link) =>
          link.type === "king_blocked_threat" &&
          link.target.square === d.square,
      );
      const directThreat = links.some(
        (link) => link.type === "threat" && link.target.square === d.square,
      );

      return kingBlockedEdge || directThreat ? "gray" : "gray";
    })
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);
};