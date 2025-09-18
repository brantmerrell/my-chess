import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./ChordDiagram.css";
import { LinkNode, ProcessedEdge } from "../../types/visualization";

interface ChordDiagramProps {
  nodes: LinkNode[];
  edges: ProcessedEdge[];
}

interface ExtendedChordGroup extends d3.ChordGroup {
  angle?: number;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ nodes, edges }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!nodes.length || !edges.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 600;
    const innerRadius = Math.min(width, height) * 0.3;
    const outerRadius = innerRadius + 20;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("width", "100%")
      .style("height", "100%")
      .style("min-height", "400px");

    const squares = Array.from(new Set(nodes.map((n) => n.square))).sort();
    const index = new Map(squares.map((square, i) => [square, i]));
    const matrix = Array(squares.length)
      .fill(0)
      .map(() => Array(squares.length).fill(0));

    edges.forEach((edge) => {
      const sourceIndex = index.get(edge.source);
      const targetIndex = index.get(edge.target);
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        matrix[sourceIndex][targetIndex] = edge.type === "threat" ? 2 : 1;
      }
    });

    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
    const chords = chord(matrix);

    const arcGenerator = d3
      .arc<d3.ChordGroup>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);

    const group = svg.append("g").selectAll("g").data(chords.groups).join("g");

    group
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", "#4a5568")
      .attr("stroke", "#1a202c");

    const extendedGroups = chords.groups as ExtendedChordGroup[];
    extendedGroups.forEach((g) => {
      g.angle = (g.startAngle + g.endAngle) / 2;
    });

    group
      .append("text")
      .attr("dy", "0.35em")
      .attr("transform", (d) => {
        const g = d as ExtendedChordGroup;
        return `
                    rotate(${(g.angle! * 180) / Math.PI - 90})
                    translate(${outerRadius + 10})
                    ${g.angle! > Math.PI ? "rotate(180)" : ""}
                `;
      })
      .attr("text-anchor", (d) => {
        const g = d as ExtendedChordGroup;
        return g.angle! > Math.PI ? "end" : "start";
      })
      .attr("fill", "#fff")
      .text((d) => squares[d.index]);

    const ribbon = d3.ribbon<any, d3.ChordGroup>().radius(innerRadius);

    svg
      .append("g")
      .attr("fill-opacity", 0.75)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", (d) => {
        const sourceSquare = squares[d.source.index];
        const targetSquare = squares[d.target.index];
        const edge = edges.find(
          (e) =>
            (e.source === sourceSquare && e.target === targetSquare) ||
            (e.source === targetSquare && e.target === sourceSquare),
        );
        return edge?.type === "threat" ? "darkred" : "darkgreen";
      })
      .attr("stroke", "#1a202c");
  }, [nodes, edges]);

  return (
    <div className="visualization-container visualization-container--fixed-height chord-diagram-container">
      <svg ref={svgRef} className="chord-diagram" />
    </div>
  );
};

export default ChordDiagram;
