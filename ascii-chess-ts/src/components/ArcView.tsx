import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge } from "../models/LinksResponse";

interface ArcViewProps {
    linksData: LinksResponse | null;
    processedEdges: ProcessedEdge[];
}

const ArcView: React.FC<ArcViewProps> = ({ linksData, processedEdges }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!linksData || !processedEdges || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 50;
        const margin = { top: 20, right: 30, bottom: 40, left: 30 };
        const maxArcHeight = 150;

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const squares = Array.from(
            new Set(linksData.nodes.map((n) => n.square))
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
            .attr("r", 15)
            .attr("fill", (d) => (d.color === "white" ? "#dddddd" : "#333333"))
            .attr("stroke", "#666")
            .attr("stroke-width", 2);

        nodeGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", (d) => (d.color === "white" ? "#000" : "#fff"))
            .text((d) => d.piece_type);

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
                    baseY
                );

                arcGroup
                    .append("path")
                    .attr("d", path.toString())
                    .attr("fill", "none")
                    .attr(
                        "stroke",
                        edge.type === "threat" ? "#ff4444" : "darkgreen"
                    )
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.6);
            }
        });
    }, [linksData, processedEdges]);

    return (
        <svg
            ref={svgRef}
            className="w-full bg-gray-800"
            style={{ minHeight: "400px", maxWidth: "100%", height: "auto" }}
        />
    );
};

export default ArcView;
