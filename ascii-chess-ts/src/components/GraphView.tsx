import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LinksResponse, ProcessedEdge, LinkNode } from "../types/visualization";
import { PieceDisplayMode, PIECE_SYMBOLS } from "../types/chess";

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
        if (displayMode === "letters") {
            return {
                background: color === "white" ? "#ffffff" : "#000000",
                textColor: color === "white" ? "#000000" : "#ffffff",
            };
        } else if (displayMode === "symbols") {
            return {
                background: color === "white" ? "#ffffff" : "#000000",
                textColor: color === "white" ? "#000000" : "#ffffff",
            };
        } else {
            return {
                background: color === "white" ? "#ffffff" : "#000000",
                textColor: color === "white" ? "#000000" : "#ffffff",
            };
        }
    };

    const getPieceDisplay = (piece: string): string => {
        switch (displayMode) {
            case "symbols":
                return (
                    PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS] || piece
                );
            case "masked":
                return "*";
            default:
                return piece;
        }
    };

    useEffect(() => {
        if (!linksData || !processedEdges || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
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
                    .strength(0)
            )
            .force("charge", d3.forceManyBody().strength(0))
            .force("collision", d3.forceCollide().radius(25).strength(1));

        svg.append("defs")
            .selectAll("marker")
            .data(["arrowheadRed", "arrowheadGreen"])
            .join("marker")
            .attr("id", (d) => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", (d) =>
                d === "arrowheadRed" ? "darkred" : "darkgreen"
            )
            .attr("d", "M0,-5L10,0L0,5");

        const link = g
            .append("g")
            .selectAll<SVGLineElement, SimulationLink>("line")
            .data(links)
            .join("line")
            .attr("stroke", (d) =>
                d.type === "threat" ? "darkred" : "darkgreen"
            )
            .attr("stroke-width", 2)
            .attr("marker-end", (d) =>
                d.type === "threat"
                    ? "url(#arrowheadRed)"
                    : "url(#arrowheadGreen)"
            );

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
            .attr("r", 15)
            .attr("fill", (d) => getNodeStyle(d.color).background)
            .attr("stroke", "#666")
            .attr("stroke-width", 2);

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", (d) => getNodeStyle(d.color).textColor)
            .text((d) => getPieceDisplay(d.piece_type));

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "2em")
            .attr("fill", "#ffd700")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text((d) => d.square);

        simulation.on("tick", () => {
            link.attr("x1", (d) => d.source.x!)
                .attr("y1", (d) => d.source.y!)
                .attr("x2", (d) => d.target.x!)
                .attr("y2", (d) => d.target.y!);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
    }, [linksData, processedEdges, displayMode]);

    return (
        <svg
            ref={svgRef}
            className="w-full bg-gray-800"
            style={{ minHeight: "600px" }}
        />
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
