import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { LinksResponse, ProcessedEdge } from "../models/LinksResponse";
import { PieceDisplayMode, PIECE_SYMBOLS } from "../types/chess";
import { fetchLinks } from "../services/connector";
import { useMoveHistory } from "../hooks/useMoveHistory";

interface HistoricalArcViewProps {
    displayMode: PieceDisplayMode;
}

// DOING:
// fix issue: nodes have multiple conflicting labels
const HistoricalArcView: React.FC<HistoricalArcViewProps> = ({ displayMode }) => {
    const [historicalData, setHistoricalData] = useState<{
        linksData: LinksResponse | null;
        processedEdges: ProcessedEdge[];
    }[]>([]);

    const { positions } = useMoveHistory(displayMode);

    const fenHistory = useSelector((state: RootState) => {
        const game = new ChessGame(state.chessGame.positions[0].fen);
        const fens = [game.toFen()];
        state.chessGame.history.forEach((move) => {
            game.makeMove(move);
            fens.push(game.toFen());
        });
        return fens;
    });

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                const historicalDataPromises = fenHistory.map(async (fen) => {
                    const fetchedLinks = await fetchLinks(fen);
                    const edges = fetchedLinks.edges.map((edge: any) => ({
                        source: typeof edge.source === "string" ? edge.source : edge.source.square,
                        target: typeof edge.target === "string" ? edge.target : edge.target.square,
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

    return (
        <div className="historical-arc-view">
            <div className="historical-arc-header">
                <h2>Move History Arc View</h2>
            </div>
            <div className="historical-arc-content">
                {historicalData.map((data, index) => (
                    <div key={index} className="historical-arc-segment">
                        <div className="move-title">
                            {index === 0 ? "Initial Position" : `${positions[index].san} (${positions[index].uci})`}
                        </div>
                        <ArcViewSegment
                            linksData={data.linksData}
                            processedEdges={data.processedEdges}
                            displayMode={displayMode}
                            index={index}
                            isFirst={index === 0}
                            isLast={index === historicalData.length - 1}
                            previousData={index > 0 ? historicalData[index - 1] : null}
                            moveUCI={index > 0 ? positions[index].uci : null}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ArcViewSegmentProps {
    linksData: LinksResponse | null;
    processedEdges: ProcessedEdge[];
    displayMode: PieceDisplayMode;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    previousData: {
        linksData: LinksResponse | null;
        processedEdges: ProcessedEdge[];
    } | null;
    moveUCI: string | null;
}

const ArcViewSegment: React.FC<ArcViewSegmentProps> = ({
    linksData,
    processedEdges,
    displayMode,
    index,
    isFirst,
    isLast,
    previousData,
    moveUCI
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const whitePieceMap: { [key: string]: string } = {
        'K': '♚',
        'Q': '♛', 
        'R': '♜',
        'B': '♝',
        'N': '♞',
        'P': '♟'
    };

    const getPieceDisplay = (piece: string): string => {
        switch (displayMode) {
            case "symbols":
                if (piece in whitePieceMap) {
                    return whitePieceMap[piece];
                }
                return PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS] || piece;
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

        const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
        const width = Math.min(containerWidth - 40, 600);
        const height = 150;
        const margin = { top: 20, right: 30, bottom: 40, left: 30 };
        const maxArcHeight = 80;

        svg.attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("display", "block")
            .style("margin", "0 auto");

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

        const arcGroup = svg.append("g").attr("class", "arcs");

        if (isFirst || isLast) {
            processedEdges.forEach((edge) => {
                const sourceX = x(edge.source);
                const targetX = x(edge.target);

                if (sourceX !== undefined && targetX !== undefined) {
                    const distance = Math.abs(targetX - sourceX);
                    const arcHeight = Math.min(distance * 0.4, maxArcHeight);
                    const path = d3.path();
                    path.moveTo(sourceX, baseY);
                    const arcDirection = isLast ? 1 : -1;
                    path.quadraticCurveTo(
                        (sourceX + targetX) / 2,
                        baseY + (arcDirection * arcHeight),
                        targetX,
                        baseY
                    );

                    arcGroup
                        .append("path")
                        .attr("d", path.toString())
                        .attr("fill", "none")
                        .attr("stroke", edge.type === "threat" ? "darkred" : "springgreen")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.6);
                }
            });
        }

        let destinationSquare: string | null = null;
        let originSquare: string | null = null;
        if (moveUCI && moveUCI.length >= 4) {
            originSquare = moveUCI.substring(0, 2);
            destinationSquare = moveUCI.substring(2, 4);
        }

        const squareToPieceMap = new Map<string, { piece_type: string; color: string }>();
        linksData.nodes.forEach(node => {
            squareToPieceMap.set(node.square, {
                piece_type: node.piece_type,
                color: node.color
            });
        });

        const nodeGroup = svg
            .append("g")
            .attr("class", "nodes");

        linksData.nodes.forEach(node => {
            const nodeX = x(node.square);
            if (nodeX === undefined) return;

            const nodeG = nodeGroup
                .append("g")
                .attr("transform", `translate(${nodeX},${baseY})`);

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
                    return node.color === "white" ? "lightgray" : "saddlebrown";
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
                .attr("stroke-width", (node.square === destinationSquare || node.square === originSquare) ? 2 : 1);

            if (displayMode === "symbols") {
                nodeG
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.3em")
                    .attr("fill", node.color === "white" ? "#fff" : "#000")
                    .style("font-size", "10px")
                    .text(getPieceDisplay(node.piece_type));
            }

            nodeG
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "1.8em")
                .attr("fill", "hotpink")
                .style("font-size", "8px")
                .text(node.square);
        });

        // Handle move squares that might not have pieces on them (for captures, etc.)
        [originSquare, destinationSquare].forEach((square, idx) => {
            if (square && !squareToPieceMap.has(square)) {
                const xPos = x(square);
                if (xPos !== undefined) {
                    const color = idx === 0 ? "lightblue" : "palegoldenrod";
                    const strokeColor = idx === 0 ? "cornflowerblue" : "darksalmon";
                    
                    const emptyNodeG = nodeGroup
                        .append("g")
                        .attr("transform", `translate(${xPos},${baseY})`);

                    emptyNodeG
                        .append("circle")
                        .attr("r", 6)
                        .attr("fill", color)
                        .attr("stroke", strokeColor)
                        .attr("stroke-width", 2);

                    emptyNodeG
                        .append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", "1.8em")
                        .attr("fill", "hotpink")
                        .style("font-size", "8px")
                        .text(square);
                }
            }
        });

    }, [linksData, processedEdges, displayMode, isFirst, isLast, previousData, moveUCI]);

    return (
        <div className="arc-segment-container">
            <svg ref={svgRef} className="arc-segment-svg" />
        </div>
    );
};

export default HistoricalArcView;
