import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { LinksResponse, ProcessedEdge } from "../models/LinksResponse";
import { PieceDisplayMode } from "../types/chess";
import { fetchLinks } from "../services/connector";
import { useMoveHistory } from "../hooks/useMoveHistory";

interface HistoricalArcViewProps {
    displayMode: PieceDisplayMode;
}

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
        <div className="w-full space-y-4">
            {historicalData.map((data, index) => (
                <div key={index} className="relative">
                    <h3 className="text-sm text-gray-400 mb-2">
                        {index === 0 ? "Initial Position" : positions[index].san + " (" + positions[index].uci + ")"}
                    </h3>
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

    useEffect(() => {
        if (!linksData || !processedEdges || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 600;
        const height = 150;
        const margin = { top: 60, right: 30, bottom: 40, left: 30 };
        const maxArcHeight = 80;

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

        const nodeGroup = svg
            .append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(linksData.nodes)
            .join("g")
            .attr("transform", (d) => `translate(${x(d.square)},${baseY})`);

        let destinationSquare: string | null = null;
        let originSquare: string | null = null;
        if (moveUCI && moveUCI.length >= 4) {
            originSquare = moveUCI.substring(0, 2);
            destinationSquare = moveUCI.substring(2, 4);
        }

        nodeGroup
            .append("circle")
            .attr("r", 6)
            .attr("fill", (d) => {
                if (d.square === destinationSquare) {
                    return "palegoldenrod";
                }
                if (d.square === originSquare) {
                    return "lightblue";
                }
                return d.color === "white" ? "lightgray" : "saddlebrown";
            })
            .attr("stroke", (d) => {
                if (d.square === destinationSquare) {
                    return "darksalmon";
                }
                if (d.square === originSquare) {
                    return "cornflowerblue";
                }
                return "gray";
            })
            .attr("stroke-width", (d) =>
                (d.square === destinationSquare || d.square === originSquare) ? 2 : 1
            );

        nodeGroup
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", -10)
            .attr("fill", "hotpink")
            .style("font-size", "10px")
            .text((d) => d.square);

        if (originSquare && !squares.includes(originSquare)) {
            nodeGroup
                .append("g")
                .attr("transform", `translate(${x(originSquare)},${baseY})`)
                .append("circle")
                .attr("r", 6)
                .attr("fill", "lightblue")
                .attr("stroke", "cornflowerblue")
            .attr("fill", (d) => {
                if (d.square === destinationSquare) {
                    return "palegoldenrod";
                }
                if (d.square === originSquare) {
                    return "lightblue";
                }
                return d.color === "white" ? "lightgray" : "saddlebrown";
            })
            .attr("stroke", (d) => {
                if (d.square === destinationSquare) {
                    return "darksalmon";
                }
                if (d.square === originSquare) {
                    return "cornflowerblue";
                }
                return "gray";
            })
                .attr("stroke-width", 2);

            nodeGroup
                .append("g")
                .attr("transform", `translate(${x(originSquare)},${baseY})`)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", -10)
                .attr("fill", "hotpink")
                .style("font-size", "10px")
                .text(originSquare);
        }

        if (destinationSquare && !squares.includes(destinationSquare)) {
            nodeGroup
                .append("g")
                .attr("transform", `translate(${x(destinationSquare)},${baseY})`)
                .append("circle")
                .attr("r", 6)
                .attr("fill", "palegoldenrod")
                .attr("stroke", "darksalmon")
                .attr("stroke-width", 2);

            nodeGroup
                .append("g")
                .attr("transform", `translate(${x(destinationSquare)},${baseY})`)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", -10)
                .attr("fill", "hotpink")
                .style("font-size", "10px")
                .text(destinationSquare);
        }
    }, [linksData, processedEdges, displayMode, isFirst, isLast, previousData, moveUCI]);

    return (
        <svg
            ref={svgRef}
            className="w-full bg-gray-800 rounded-lg"
            style={{ height: "150px" }}
        />
    );
};

export default HistoricalArcView;


