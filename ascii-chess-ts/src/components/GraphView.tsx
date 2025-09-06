import React, { useEffect, useRef } from "react";
import "./GraphView.css";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge, LinkNode } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import { getPieceDisplay } from "../utils/chessDisplay";
import VisualizationContainer from "./VisualizationContainer";

interface GraphViewProps {
    linksData: LinksResponse | null;
    processedEdges: ProcessedEdge[];
    displayMode: PieceDisplayMode;
}

const GraphView: React.FC<GraphViewProps> = ({
    linksData,
    processedEdges,
    displayMode,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const getNodeStyle = (color: string) => {
        return {
            background: color === "white" ? "black" : "white",
            fill: color === "white" ? "white" : "black",
            stroke: color === "white" ? "white" : "black",
        };
    };
const getEdgeStyle = (edgeType: string) => {
    switch (edgeType) {
        case "threat":
            return { color: "darkred", marker: "url(#arrowheadRed)" };
        case "protection":
            return { color: "darkgreen", marker: "url(#arrowheadGreen)" };
        case "adjacency":
            return { color: "blue", marker: "url(#arrowheadBlue)" };
        default:
            return { color: "gray", marker: "url(#arrowheadGray)" };
    }
};

    useEffect(() => {
        if (!linksData || !processedEdges || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 600;
        const height = 600;
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const g = svg.append("g");

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

        const validEdges = processedEdges.filter(edge => {
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
                    .strength(0)
            )
            .force("charge", d3.forceManyBody().strength(0))
            .force("collision", d3.forceCollide().radius(25).strength(1));

        svg.append("defs")
            .selectAll("marker")
            .data(["arrowheadRed", "arrowheadGreen", "arrowheadBlue", "arrowheadGray"])
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
                    case "arrowheadRed": return "darkred";
                    case "arrowheadGreen": return "darkgreen";
                    case "arrowheadBlue": return "blue";
                    default: return "gray";
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
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        delete d.fx;
                        delete d.fy;
                    })
            );

        node.append("circle")
            .attr("r", 18)
            .attr("fill", (d) => getNodeStyle(d.color).background)
            .attr("stroke", (d) => getNodeStyle(d.color).stroke)
            .attr("stroke-width", 3);

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", (d) => getNodeStyle(d.color).fill)
            .each(function (d) {
                const textElement = d3.select(this);

                textElement
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", 0)
                    .attr("font-size", "24px")
                    .attr("font-family", "Noto Sans Mono, Source Code Pro, Consolas, DejaVu Sans Mono, monospace")
                    .attr("font-weight", "500")
                    .attr("font-variant-numeric", "tabular-nums")
                    .text(getPieceDisplay(d.piece_type, d.color, displayMode));

                textElement
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .attr("font-size", "10px")
                    .text(d.square);
            });

        simulation.on("tick", () => {
            link.attr("x1", (d) => d.source.x!)
                .attr("y1", (d) => d.source.y!)
                .attr("x2", (d) => d.target.x!)
                .attr("y2", (d) => d.target.y!);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
    }, [linksData, processedEdges, displayMode]);

    return (
        <VisualizationContainer className="graph-view-container">
            <svg
                ref={svgRef}
                className="visualization-svg graph-view"
            />
        </VisualizationContainer>
    );
};

const squareToCoords = (square: string): [number, number] => {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    return [file, rank];
};

const gridToScreen = (
    coords: [number, number],
    width: number,
    height: number
): [number, number] => {
    const margin = 50;
    const gridSize = Math.min(width - 2 * margin, height - 2 * margin) / 8;
    return [
        margin + coords[0] * gridSize + gridSize / 2,
        margin + coords[1] * gridSize + gridSize / 2,
    ];
};

export default GraphView;
