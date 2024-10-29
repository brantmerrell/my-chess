import React, { useState, useEffect, useRef } from "react";
import HistoryTable from "./HistoryTable";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import {
    LinksResponse,
    LinkNode,
    ProcessedEdge,
    EdgeData,
} from "../models/LinksResponse";
import { fetchLinks } from "../services/connector";
import { ChessGame } from "../chess/chessGame";
import * as d3 from "d3";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

const HelperVisual: React.FC = () => {
    const [selectedVisual, setSelectedVisual] =
        useState<string>("No Visual Selected");
    const [linksData, setLinksData] = useState<LinksResponse | null>(null);
    const [processedEdges, setProcessedEdges] = useState<ProcessedEdge[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    const chessGameState = useSelector((state: RootState) => state.chessGame);
    const fenHistory = useSelector((state: RootState) => {
        const game = new ChessGame();
        const fens = [game.toFen()];

        state.chessGame.history.forEach((move) => {
            game.makeMove(move);
            fens.push(game.toFen());
        });

        return fens;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedLinks = await fetchLinks(chessGameState.fen);
                setLinksData(fetchedLinks);

                const edges = fetchedLinks.edges.map((edge: EdgeData) => ({
                    source:
                        typeof edge.source === "string"
                            ? edge.source
                            : edge.source.square,
                    target:
                        typeof edge.target === "string"
                            ? edge.target
                            : edge.target.square,
                    type: edge.type,
                }));
                setProcessedEdges(edges);
            } catch (error) {
                console.error("Error fetching links:", error);
            }
        };

        fetchData();
    }, [chessGameState.fen]);

    const renderForceGraph = (): void => {
        if (!linksData || !svgRef.current) return;

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
    };

    const renderArcDiagram = (): void => {
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
    };

    const plotFENCharacterCount = () => {
        const labels = fenHistory.map((_, index) => `Move ${index}`);
        const data = {
            labels: labels,
            datasets: [
                {
                    label: "FEN String Length Over Time",
                    data: fenHistory.map((fen) => fen.length),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: false,
                },
            ],
        };

        return <Line data={data} />;
    };

    useEffect(() => {
        if (selectedVisual === "Graph View") {
            renderForceGraph();
        } else if (selectedVisual === "Arc View") {
            renderArcDiagram();
        }
    }, [selectedVisual, linksData, processedEdges]);

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl mb-4">Helper Visual</h3>
            <div className="helper-select-container">
                <select
                    value={selectedVisual}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedVisual(e.target.value)
                    }
                    className="helper-select mb-4 p-2 rounded text-white"
                >
                    <option value="No Visual Selected">
                        No Visual Selected
                    </option>
                    <option value="Graph View">Graph View</option>
                    <option value="Arc View">Arc View</option>
                    <option value="History Table">History Table</option>
                    <option value="FEN Character Count">
                        FEN Character Count
                    </option>
                </select>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
                {(selectedVisual === "Graph View" ||
                    selectedVisual === "Arc View" ||
                    selectedVisual === "FEN Character Count") && (
                    <div className="w-full">
                        {selectedVisual === "FEN Character Count" ? (
                            plotFENCharacterCount()
                        ) : (
                            <svg
                                ref={svgRef}
                                className="w-full bg-gray-800"
                                style={{
                                    minHeight:
                                        selectedVisual === "Arc View"
                                            ? "400px"
                                            : "300px",
                                    maxWidth: "100%",
                                    height: "auto",
                                }}
                            />
                        )}
                    </div>
                )}
                {selectedVisual === "History Table" && <HistoryTable />}
                {selectedVisual === "No Visual Selected" && (
                    <div className="text-center py-8 text-gray-400">
                        Select a visualization type from the dropdown above
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelperVisual;
