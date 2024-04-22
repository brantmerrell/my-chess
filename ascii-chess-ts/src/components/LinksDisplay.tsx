import React, { useState, useEffect } from "react";
import { fetchLinks } from "../services/connector";
import { LinksResponse, LinkNode, LinkEdge } from "../models/LinksResponse";
import * as d3 from "d3";

const LinksDisplay = () => {
    const [links, setLinks] = useState<LinksResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getLinks = async () => {
            setIsLoading(true);
            try {
                const inputString =
                    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
                const fetchedLinks = await fetchLinks(inputString);
                setLinks(fetchedLinks);
            } catch (error: any) {
                setError(error.message);
                console.error("Error fetching links:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getLinks();
    }, []);
useEffect(() => {
    const nodes: LinkNode[] =
        links?.nodes?.map((node) => ({ ...node })) || [];
    const edges: LinkEdge[] =
        links?.edges?.map((edge) => ({ ...edge })) || [];

    const data = { nodes, edges };
    for (let node of data.nodes!) {
        const { x, y } = chessCoordToPixel(node.square);
        node.x = x;
        node.y = y;
    }
    if (links) {
        const width = 500;
        const height = 500;

        const svg = d3
            .select("#graph-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const linkForce = d3
            .forceLink<LinkNode, LinkEdge>(data.edges as LinkEdge[])
            .id(function (d) {
                return d.square;
            })
            .distance(30);

        const simulation = d3
            .forceSimulation(data.nodes)
            .force("link", linkForce)
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg
            .selectAll("line")
            .data(data.edges)
            .join("line") 
            .attr("x1", (d) => d.source.x!) 
            .attr("y1", (d) => d.source.y!)
            .attr("x2", (d) => d.target.x!)
            .attr("y2", (d) => d.target.y!)
            .attr("stroke", "white"); 

        const node = svg
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("cx", (d) => d.x!)
            .attr("cy", (d) => d.y!)
            .attr("r", 8) // Node radius
            .attr("fill", (d) => (d.color === "white" ? "yellow" : "darkgreen"));

        // Simulation ticker to update positions
        simulation.on("tick", () => {
            link.attr("x1", (d) => d.source.x!)
                .attr("y1", (d) => d.source.y!)
                .attr("x2", (d) => d.target.x!)
                .attr("y2", (d) => d.target.y!);

            node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        });
    }
}, [links]);

    return (
        <div>
            {isLoading ? (
                <p>Loading links...</p>
            ) : error ? (
                <p>Error fetching links: {"error message here"}</p>
            ) : (
                <ul>
                    <div>
                        {/* ... loading/error handling ... */}
                        <div id="graph-container"></div>{" "}
                        {/* Container for the graph */}
                    </div>
                </ul>
            )}
        </div>
    );
};

export default LinksDisplay;
function chessCoordToPixel(square: string) {
    const file = square.charCodeAt(0) - "a".charCodeAt(0) + 1;
    const rank = parseInt(square.slice(1), 10);

    const x = (file - 1) * 50 + 25;
    const y = 375 - ((rank - 1) * 10);

    return { x, y };
}

