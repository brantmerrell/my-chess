import React, { useEffect, useRef } from "react";
import "./GraphView.css";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge, LinkNode } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import VisualizationContainer from "./VisualizationContainer";
import { squareToCoords, gridToScreen, screenToSquare } from "../utils/graphCoordinates";
import { getEdgeStyle } from "../utils/graphStyles";
import { renderGrid, renderCoordinates } from "./GraphGrid";
import { renderNodes, renderPhantomMarkers } from "./GraphNodes";

interface GraphViewProps {
  linksData: LinksResponse | null;
  processedEdges: ProcessedEdge[];
  displayMode: PieceDisplayMode;
  showGrid?: boolean;
  onMoveAttempt?: (fromSquare: string, toSquare: string, uciMove: string) => boolean;
}

const GraphView: React.FC<GraphViewProps> = ({
  linksData,
  processedEdges,
  displayMode,
  showGrid = false,
  onMoveAttempt,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);


  useEffect(() => {
    if (!linksData || !processedEdges || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 600;
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    const margin = 50;
    const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;

    if (showGrid) {
      renderGrid(g, width, height);
      renderCoordinates(g, width, height);
    }

    type SimulationNode = LinkNode & d3.SimulationNodeDatum;
    type SimulationLink = {
      source: SimulationNode;
      target: SimulationNode;
      type: string;
    };

    const nodes = linksData.nodes.map((node) => {
      const gridCoords = squareToCoords(node.square);
      const [x, y] = gridToScreen(gridCoords, width, height);
      return {
        ...node,
        x,
        y,
        fx: x,
        fy: y,
      };
    }) as SimulationNode[];

    const validEdges = processedEdges.filter((edge) => {
      const sourceNode = nodes.find((n) => n.square === edge.source);
      const targetNode = nodes.find((n) => n.square === edge.target);
      return sourceNode && targetNode;
    });

    const links = validEdges.map((edge) => ({
      source: nodes.find((n) => n.square === edge.source)!,
      target: nodes.find((n) => n.square === edge.target)!,
      type: edge.type,
    })) as SimulationLink[];

    const simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationLink>(links)
          .id((d) => d.square)
          .distance(50)
          .strength(0),
      )
      .force("charge", d3.forceManyBody().strength(0))
      .force("collision", d3.forceCollide().radius(25).strength(showGrid ? 0 : 1));

    if (showGrid) {
      simulation.stop();
    }

    svg
      .append("defs")
      .selectAll("marker")
      .data([
        "arrowheadRed",
        "arrowheadGreen",
        "arrowheadBlue",
        "arrowheadGray",
      ])
      .join("marker")
      .attr("id", (d) => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", (d) => {
        switch (d) {
          case "arrowheadRed":
            return "crimson";
          case "arrowheadGreen":
            return "forestgreen";
          case "arrowheadBlue":
            return "dodgerblue";
          default:
            return "gray";
        }
      })
      .attr("d", "M0,-5L10,0L0,5");

    const link = g
      .append("g")
      .selectAll<SVGLineElement, SimulationLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => getEdgeStyle(d.type).color)
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => getEdgeStyle(d.type).marker);

    const visibleNodes = nodes.filter((d) => d.piece_type !== "phantom");
    const phantomNodes = nodes.filter((d) => d.piece_type === "phantom");

    const dragBehavior = d3
      .drag<SVGGElement, SimulationNode>()
      .on("start", (event, d) => {
        if (showGrid && onMoveAttempt) {
          (d as any).startSquare = d.square;
          d.fx = d.x;
          d.fy = d.y;
        } else {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
      })
      .on("drag", function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
        d.x = event.x;
        d.y = event.y;

        if (showGrid && onMoveAttempt) {
          d3.select(this).attr("transform", `translate(${event.x},${event.y})`);
        }
      })
      .on("end", (event, d) => {
        if (showGrid && onMoveAttempt) {
          const targetSquare = screenToSquare(event.x, event.y, width, height);
          const startSquare = (d as any).startSquare;
          let moveWasValid = false;

          if (targetSquare && startSquare && targetSquare !== startSquare) {
            const uciMove = startSquare + targetSquare;
            moveWasValid = onMoveAttempt(startSquare, targetSquare, uciMove);
          }

          if (!moveWasValid) {
            const gridCoords = squareToCoords(d.square);
            const [originalX, originalY] = gridToScreen(gridCoords, width, height);
            d.fx = originalX;
            d.fy = originalY;
          } else {
            delete d.fx;
            delete d.fy;
          }

          delete (d as any).startSquare;
        } else {
          if (!event.active) simulation.alphaTarget(0);
          delete d.fx;
          delete d.fy;
        }
      });

    const node = renderNodes(g, visibleNodes, links, displayMode, showGrid, dragBehavior);
    const phantomMarkers = renderPhantomMarkers(g, phantomNodes, links);

    if (showGrid) {
      nodes.forEach((node) => {
        const gridCoords = squareToCoords(node.square);
        const [x, y] = gridToScreen(gridCoords, width, height);
        node.x = x;
        node.y = y;
        node.fx = x;
        node.fy = y;
      });

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      phantomMarkers.attr("x", (d) => d.x!).attr("y", (d) => d.y!);

      link
        .attr("x1", (d) => d.source.x!)
        .attr("y1", (d) => d.source.y!)
        .attr("x2", (d) => d.target.x!)
        .attr("y2", (d) => d.target.y!);
    }

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x!)
        .attr("y1", (d) => d.source.y!)
        .attr("x2", (d) => d.target.x!)
        .attr("y2", (d) => d.target.y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      phantomMarkers.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });
  }, [linksData, processedEdges, displayMode, showGrid, onMoveAttempt]);

  return (
    <VisualizationContainer className="graph-view-container">
      <svg ref={svgRef} className="visualization-svg graph-view" />
    </VisualizationContainer>
  );
};


export default GraphView;
