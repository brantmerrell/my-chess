import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { LinksResponse, ProcessedEdge } from "../models/LinksResponse";
import { PieceDisplayMode } from "../types/chess";
import { fetchLinks } from "../services/connector";
import { useMoveHistory } from "../hooks/useMoveHistory";
import { getPieceDisplay } from "../utils/chessDisplay";

interface HistoricalArcViewProps {
    displayMode: PieceDisplayMode;
}

const HistoricalArcView: React.FC<HistoricalArcViewProps> = ({
    displayMode,
}) => {
    const [historicalData, setHistoricalData] = useState<
        {
            linksData: LinksResponse | null;
            processedEdges: ProcessedEdge[];
        }[]
    >([]);
    const state = useSelector((state: RootState) => state.chessGame);
    const svgRef = useRef<SVGSVGElement>(null);

    const { positions } = useMoveHistory(displayMode);

    const fenHistory = useMemo(() => {
        const game = new ChessGame(state.positions[0].fen);
        const fens = [game.toFen()];
        state.history.forEach((move: string) => {
            game.makeMove(move);
            fens.push(game.toFen());
        });
        return fens;
    }, [state.positions, state.history]);

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                const historicalDataPromises = fenHistory.map(async (fen) => {
                    const fetchedLinks = await fetchLinks(fen);
                    const edges = fetchedLinks.edges.map((edge: any) => ({
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
                    return {
                        linksData: fetchedLinks,
                        processedEdges: edges,
                    };
                });

                const data = await Promise.all(historicalDataPromises);
                setHistoricalData(data);
            } catch (error) {
                console.error("Error fetching historical data:", error);
            }
        };

        fetchHistoricalData();
    }, [fenHistory]);



    useEffect(() => {
        if (!historicalData.length || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
        const width = Math.min(containerWidth - 40, 800);
        const segmentHeight = 180;
        const totalHeight = segmentHeight * historicalData.length;
        const margin = { top: 20, right: 30, bottom: 40, left: 30 };

        svg.attr("width", "100%")
            .attr("height", totalHeight)
            .attr("viewBox", `0 0 ${width} ${totalHeight}`)
            .style("display", "block")
            .style("margin", "0 auto");

        const segmentPositions: {
            [segmentIndex: number]: { [square: string]: number };
        } = {};

        historicalData.forEach((data, index) => {
            if (!data.linksData) return;

            const segmentY = index * segmentHeight;
            const baseY = segmentY + segmentHeight - margin.bottom;

            const segmentGroup = svg
                .append("g")
                .attr("class", `segment-${index}`);

            segmentGroup
                .append("text")
                .attr("x", margin.left)
                .attr("y", segmentY + 20)
                .attr("fill", "white")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text(
                    index === 0
                        ? "Initial Position"
                        : `${positions[index].san} (${positions[index].uci})`
                );

            const segmentSquares = data.linksData.nodes
                .map((n) => n.square)
                .sort((a, b) => {
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
                .domain(segmentSquares)
                .range([margin.left, width - margin.right]);

            segmentPositions[index] = {};
            segmentSquares.forEach((square) => {
                const pos = x(square);
                if (pos !== undefined) {
                    segmentPositions[index][square] = pos;
                }
            });

            if (index === 0 || index === historicalData.length - 1) {
                const arcGroup = segmentGroup.append("g").attr("class", "arcs");
                const maxArcHeight = 80;

                data.processedEdges.forEach((edge) => {
                    const sourceX = x(edge.source);
                    const targetX = x(edge.target);

                    if (sourceX !== undefined && targetX !== undefined) {
                        const distance = Math.abs(targetX - sourceX);
                        const arcHeight = Math.min(
                            distance * 0.4,
                            maxArcHeight
                        );
                        const path = d3.path();
                        path.moveTo(sourceX, baseY);
                        const arcDirection =
                            index === historicalData.length - 1 ? 1 : -1;
                        path.quadraticCurveTo(
                            (sourceX + targetX) / 2,
                            baseY + arcDirection * arcHeight,
                            targetX,
                            baseY
                        );

                        arcGroup
                            .append("path")
                            .attr("d", path.toString())
                            .attr("fill", "none")
                            .attr(
                                "stroke",
                                edge.type === "threat"
                                    ? "darkred"
                                    : "springgreen"
                            )
                            .attr("stroke-width", 1)
                            .attr("opacity", 0.6);
                    }
                });
            }

            const nodeGroup = segmentGroup.append("g").attr("class", "nodes");

            data.linksData.nodes.forEach((node) => {
                const nodeX = x(node.square);
                if (nodeX === undefined) return;

                const nodeG = nodeGroup
                    .append("g")
                    .attr("transform", `translate(${nodeX},${baseY})`);

                let destinationSquare: string | null = null;
                let originSquare: string | null = null;
                if (index > 0 && positions[index].uci.length >= 4) {
                    originSquare = positions[index].uci.substring(0, 2);
                    destinationSquare = positions[index].uci.substring(2, 4);
                }

                nodeG
                    .append("circle")
                    .attr("r", 6)
                    .attr("fill", () => {
                        if (node.square === destinationSquare) {
                            return "palegoldenrod";
                        }
                        if (node.square === originSquare) {
                            return "lightblue";
                        }
                        return node.color === "white"
                            ? "lightgray"
                            : "saddlebrown";
                    })
                    .attr("stroke", () => {
                        if (node.square === destinationSquare) {
                            return "darksalmon";
                        }
                        if (node.square === originSquare) {
                            return "cornflowerblue";
                        }
                        return "gray";
                    })
                    .attr(
                        "stroke-width",
                        node.square === destinationSquare ||
                            node.square === originSquare
                            ? 2
                            : 1
                    );

                if (displayMode === "symbols") {
                    nodeG
                        .append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", "0.3em")
                        .attr("fill", node.color === "white" ? "#fff" : "#000")
                        .style("font-size", "10px")
                        .text(getPieceDisplay(node.piece_type, undefined, displayMode));
                }

                nodeG
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1.8em")
                    .attr("fill", "hotpink")
                    .style("font-size", "8px")
                    .text(node.square);
            });
        });

        historicalData.forEach((data, index) => {
            if (index > 0 && positions[index].uci.length >= 4) {
                const originSquare = positions[index].uci.substring(0, 2);
                const destinationSquare = positions[index].uci.substring(2, 4);

                const originX = segmentPositions[index - 1]?.[originSquare];
                const destX = segmentPositions[index]?.[destinationSquare];

                if (originX !== undefined && destX !== undefined) {
                    const prevSegmentY = (index - 1) * segmentHeight;
                    const prevBaseY =
                        prevSegmentY + segmentHeight - margin.bottom;
                    const currentSegmentY = index * segmentHeight;
                    const currentBaseY =
                        currentSegmentY + segmentHeight - margin.bottom;

                    const distance = Math.abs(originX - destX);
                    const arcHeight = Math.min(distance * 0.3, 60);
                    const midY = (prevBaseY + currentBaseY) / 2;

                    const connectionPath = d3.path();
                    connectionPath.moveTo(originX, prevBaseY);
                    connectionPath.quadraticCurveTo(
                        (originX + destX) / 2,
                        midY - arcHeight,
                        destX,
                        currentBaseY
                    );

                    svg.append("path")
                        .attr("d", connectionPath.toString())
                        .attr("fill", "none")
                        .attr("stroke", "darkgreen")
                        .attr("stroke-width", 2)
                        .attr("opacity", 0.6);
                }
            }
        });
    }, [historicalData, displayMode, positions]);

    return (
        <div className="historical-arc-view">
            <div className="historical-arc-header">
                <h2>Move History Arc View</h2>
            </div>
            <div className="historical-arc-wrapper">
                <div className="historical-arc-content">
                    <svg ref={svgRef} className="historical-arc-svg" />
                </div>
            </div>
        </div>
    );
};

export default HistoricalArcView;
