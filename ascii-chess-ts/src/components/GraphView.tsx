import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge, LinkNode } from "../types/visualization";

interface GraphViewProps {
    linksData: LinksResponse | null;
    processedEdges: ProcessedEdge[];
}

const GraphView: React.FC<GraphViewProps> = ({ linksData, processedEdges }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!linksData || !processedEdges || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 600;
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const g = svg.append("g").attr("transform", "translate(50,20)");

        type SimulationNode = LinkNode & d3.SimulationNodeDatum;
        type SimulationLink = {
            source: SimulationNode;
            target: SimulationNode;
            type: string;
        };

        const nodes = linksData.nodes as SimulationNode[];
        const links = processedEdges.map((edge) => ({
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
            )
            .force("charge", d3.forceManyBody().strength(-10))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(25))
            .force("x", d3.forceX(width / 2).strength(0.1))
            .force("y", d3.forceY(height / 2).strength(0.1));

        const link = g
            .append("g")
            .selectAll<SVGLineElement, SimulationLink>("line")
            .data(links)
            .join("line")
            .attr("stroke", (d) =>
                d.type === "threat" ? "darkred" : "darkgreen"
            )
            .attr("stroke-width", 5);

        const node = g
            .append("g")
            .selectAll<SVGGElement, SimulationNode>("g")
            .data(nodes)
            .join("g")
            .call(
                d3
                    .drag<SVGGElement, SimulationNode>()
                    .on("start", (event, d) => {
                        if (!event.active)
                            simulation.alphaTarget(0.3).restart();
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        node.append("circle")
            .attr("r", 15)
            .attr("fill", (d) => (d.color === "white" ? "#dddddd" : "#333333"))
            .attr("stroke", "#666")
            .attr("stroke-width", 2);

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", (d) => (d.color === "white" ? "#000" : "#fff"))
            .text((d) => d.piece_type);

        simulation.on("tick", () => {
            link.attr("x1", (d) => d.source.x ?? 0)
                .attr("y1", (d) => d.source.y ?? 0)
                .attr("x2", (d) => d.target.x ?? 0)
                .attr("y2", (d) => d.target.y ?? 0);

            node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });
    }, [linksData, processedEdges]);

    return <svg ref={svgRef} className="w-full bg-gray-800" />;
};

export default GraphView;
