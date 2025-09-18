import React, { useEffect, useRef, useState } from "react";
import "./ArcView.css";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge } from "../../models/LinksResponse";
import { PieceDisplayMode } from "../../types/chess";
import { getPieceDisplay } from "../../utils/chessDisplay";
import VisualizationContainer from "./VisualizationContainer";

interface ArcViewProps {
  linksData: LinksResponse | null;
  processedEdges: ProcessedEdge[];
  displayMode: PieceDisplayMode;
}

type ColorScheme = "file" | "rank";

const ArcView: React.FC<ArcViewProps> = ({
  linksData,
  processedEdges,
  displayMode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("rank");

  const fileColors = {
    a: "indigo",
    b: "saddlebrown",
    c: "steelblue",
    d: "darkgreen",
    e: "limegreen",
    f: "crimson",
    g: "deeppink",
    h: "goldenrod",
  };

  const rankColors = {
    "8": "saddlebrown",
    "7": "indigo",
    "6": "steelblue",
    "5": "limegreen",
    "4": "crimson",
    "3": "deeppink",
    "2": "goldenrod",
    "1": "purple",
  };

  const getNodeColor = (square: string, color: string) => {
    if (colorScheme === "file") {
      return fileColors[square[0] as keyof typeof fileColors];
    } else {
      return rankColors[square[1] as keyof typeof rankColors];
    }
  };

  useEffect(() => {
    if (!linksData || !processedEdges || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 200;
    const margin = { top: 200, right: 30, bottom: 80, left: 30 };
    const maxArcHeight = 100;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const separatorGroup = svg.append("g").attr("class", "separators");
    const labelGroup = svg.append("g").attr("class", "labels");

    if (colorScheme === "file") {
    } else {
      // Add rank separator lines and labels (optional)
      // Currently omitted as ranks are already visually distinct by color gradient
    }

    const squares = Array.from(
      new Set(linksData.nodes.map((n) => n.square)),
    ).sort((a, b) => {
      const rankA = parseInt(a[1]);
      const rankB = parseInt(b[1]);
      const fileA = a[0];
      const fileB = b[0];
      if (rankA !== rankB) {
        return rankB - rankA;
      } else {
        return fileA.charCodeAt(0) - fileB.charCodeAt(0);
      }
    });

    const x = d3
      .scalePoint<string>()
      .domain(squares)
      .range([margin.left, width - margin.right]);

    const baseY = height - margin.bottom;
    const nodeGroup = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(linksData.nodes)
      .join("g")
      .attr("transform", (d) => `translate(${x(d.square)},${baseY})`);

    nodeGroup
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d) => getNodeColor(d.square, d.color))
      .attr("stroke", "#666")
      .attr("stroke-width", 2);

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", (d) => (d.color === "white" ? "#fff" : "#000"))
      .style("font-size", (d) => (displayMode === "symbols" ? "14px" : "12px"))
      .text((d) => d.piece_type === "phantom" ? "" : getPieceDisplay(d.piece_type, d.color, displayMode));

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .text((d) => d.square);

    const arcGroup = svg.append("g").attr("class", "arcs");

    processedEdges.forEach((edge) => {
      const sourceX = x(edge.source);
      const targetX = x(edge.target);

      if (sourceX !== undefined && targetX !== undefined) {
        const distance = Math.abs(targetX - sourceX);
        const arcHeight = Math.min(distance * 0.4, maxArcHeight);
        const path = d3.path();
        path.moveTo(sourceX, baseY);
        path.quadraticCurveTo(
          (sourceX + targetX) / 2,
          baseY - arcHeight,
          targetX,
          baseY,
        );

        arcGroup
          .append("path")
          .attr("d", path.toString())
          .attr("fill", "none")
          .attr("stroke", edge.type === "threat" ? "darkred" : "darkgreen")
          .attr("stroke-width", 2)
          .attr("opacity", 0.6);
      }
    });
  }, [linksData, processedEdges, displayMode, colorScheme]);

  return (
    <VisualizationContainer withPadding className="arc-view-container">
      <div className="arc-view-controls">
        <span className="text-sm text-gray-300">Color by:</span>
        <div className="helper-select-container">
          <select
            className="helper-select btn btn-light"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
          >
            <option value="file">File</option>
            <option value="rank">Rank</option>
          </select>
        </div>
      </div>

      {/* SVG visualization */}
      <div className="visualization-svg-container arc-view-svg-container">
        <svg ref={svgRef} className="visualization-svg arc-view-svg" />
      </div>
    </VisualizationContainer>
  );
};

export default ArcView;
