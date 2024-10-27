import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { LinksResponse, LinkNode, LinkEdge } from "../models/LinksResponse";
import { fetchLinks } from "../services/connector";
import * as d3 from "d3";

const HelperVisual = () => {
    const [selectedVisual, setSelectedVisual] = useState("No Visual Selected");
    const [links, setLinks] = useState<LinksResponse | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const chessGameState = useSelector((state: RootState) => state.chessGame);

    useEffect(() => {
        const getLinks = async () => {
            try {
                const fetchedLinks = await fetchLinks(chessGameState.fen);
                setLinks(fetchedLinks);
            } catch (error) {
                console.error("Error fetching links:", error);
            }
        };

        getLinks();
    }, [chessGameState.fen]);

    useEffect(() => {
        if (!links || !svgRef.current || selectedVisual !== "Graph View")
            return;

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 800;
        const height = 600;
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const g = svg.append("g").attr("transform", "translate(50,20)");

        const simulation = d3
            .forceSimulation(links.nodes)
            .force(
                "link",
                d3
                    .forceLink(links.edges)
                    .id((d: any) => d.square)
                    .distance(100)
            )
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(20))
            .force("x", d3.forceX(width / 2).strength(0.1))
            .force("y", d3.forceY(height / 2).strength(0.1));

        const link = g
            .append("g")
            .selectAll("line")
            .data(links.edges)
            .join("line")
            .attr("class", "link")
            .attr("stroke", (d) =>
                d.type === "threat" ? "#ff4444" : "#44ff44"
            )
            .attr("stroke-width", 2);

        const node = g
            .append("g")
            .selectAll("g")
            .data(links.nodes)
            .join("g")
            .attr("class", "node");

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
            link.attr("x1", (d) => (d.source as any).x)
                .attr("y1", (d) => (d.source as any).y)
                .attr("x2", (d) => (d.target as any).x)
                .attr("y2", (d) => (d.target as any).y);

            node.attr(
                "transform",
                (d) => `translate(${(d as any).x},${(d as any).y})`
            );
        });
    }, [links, selectedVisual]);

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl mb-4">Helper Visual</h3>
            <select
                value={selectedVisual}
                onChange={(e) => setSelectedVisual(e.target.value)}
                className="mb-4 p-2 rounded bg-gray-700 text-white"
            >
                <option value="No Visual Selected">No Visual Selected</option>
                <option value="Graph View">Graph View</option>
            </select>

            <div className="bg-gray-900 p-4 rounded-lg">
                {selectedVisual === "Graph View" && (
                    <div className="w-full">
                        <svg
                            ref={svgRef}
                            className="w-full h-[300px] bg-gray-800"
                            style={{ minHeight: "300px" }}
                        />
                        <div className="mt-4 text-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 bg-red-500"></div>
                                <span>Threat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500"></div>
                                <span>Protection</span>
                            </div>
                        </div>
                    </div>
                )}
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
