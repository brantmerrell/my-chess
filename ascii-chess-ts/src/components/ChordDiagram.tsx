import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LinkNode, ProcessedEdge } from "../models/LinksResponse";

interface ChordDiagramProps {
    nodes: LinkNode[];
    edges: ProcessedEdge[];
}

interface ExtendedChordGroup extends d3.ChordGroup {
    angle?: number;
}

interface ArcDatum {
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
}

interface RibbonSubgroup {
    startAngle: number;
    endAngle: number;
    radius: number;
}

interface RibbonProps {
    source: RibbonSubgroup;
    target: RibbonSubgroup;
}

const ChordDiagram = ({ nodes, edges }: ChordDiagramProps) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!nodes.length || !edges.length || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 600;
        const height = 600;
        const innerRadius = Math.min(width, height) * 0.3;
        const outerRadius = innerRadius + 20;

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

        const squares = Array.from(new Set(nodes.map((n) => n.square))).sort();
        const index = new Map(squares.map((square, i) => [square, i]));
        const matrix = Array(squares.length)
            .fill(0)
            .map(() => Array(squares.length).fill(0));

        edges.forEach((edge) => {
            const sourceIndex = index.get(edge.source);
            const targetIndex = index.get(edge.target);
            if (sourceIndex !== undefined && targetIndex !== undefined) {
                matrix[sourceIndex][targetIndex] =
                    edge.type === "threat" ? 2 : 1;
            }
        });

        const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

        const chords = chord(matrix);

        const pieceColorScale = d3
            .scaleOrdinal<string, string>()
            .domain([
                "p",
                "n",
                "b",
                "r",
                "q",
                "k",
                "P",
                "N",
                "B",
                "R",
                "Q",
                "K",
            ])
            .range([
                "#769656",
                "#86a666",
                "#97b677",
                "#a8c688",
                "#b9d699",
                "#caE6aa",
                "#eeeed2",
                "#dfdfb2",
                "#cfcf92",
                "#bfbf72",
                "#afaf52",
                "#9f9f32",
            ]);

        const arcGenerator = d3.arc<ArcDatum>();

        const group = svg
            .append("g")
            .selectAll("g")
            .data(chords.groups)
            .join("g");

        group
            .append("path")
            .attr(
                "d",
                (d) =>
                    arcGenerator({
                        innerRadius,
                        outerRadius,
                        startAngle: d.startAngle,
                        endAngle: d.endAngle,
                    }) || ""
            )
            .attr("fill", (d): string => {
                const square = squares[d.index];
                const node = nodes.find((n) => n.square === square);
                return node ? pieceColorScale(node.piece_type) : "#ccc";
            })
            .attr("stroke", "#000");

        const extendedGroups = chords.groups as ExtendedChordGroup[];

        group
            .append("text")
            .each((d) => {
                const extended = d as ExtendedChordGroup;
                extended.angle = (extended.startAngle + extended.endAngle) / 2;
            })
            .attr("dy", "0.35em")
            .attr("transform", (d) => {
                const extended = d as ExtendedChordGroup;
                return `
          rotate(${(extended.angle! * 180) / Math.PI - 90})
          translate(${outerRadius + 10})
          ${extended.angle! > Math.PI ? "rotate(180)" : ""}
        `;
            })
            .attr("text-anchor", (d) => {
                const extended = d as ExtendedChordGroup;
                return extended.angle! > Math.PI ? "end" : "start";
            })
            .attr("fill", "#fff")
            .text((d) => squares[d.index]);

        const ribbonGen = d3.ribbon();
        ribbonGen.radius(innerRadius);

        svg.append("g")
            .attr("fill-opacity", 0.75)
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("d", (d) => {
                const ribbon = ribbonGen as (datum: any) => string | null;
                return ribbon(d) || "";
            })
            .attr("fill", (d): string => {
                const sourceSquare = squares[d.source.index];
                const targetSquare = squares[d.target.index];
                const edge = edges.find(
                    (e) =>
                        (e.source === sourceSquare &&
                            e.target === targetSquare) ||
                        (e.source === targetSquare && e.target === sourceSquare)
                );
                return edge?.type === "threat" ? "#ff4444" : "#44ff44";
            })
            .attr("stroke", "#000");
    }, [nodes, edges]);

    return (
        <div className="w-full flex justify-center">
            <svg ref={svgRef} className="bg-gray-800 rounded-lg" />
        </div>
    );
};

export default ChordDiagram;
