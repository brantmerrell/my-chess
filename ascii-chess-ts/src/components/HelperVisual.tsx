import React, { useState, useEffect } from "react";
import HistoryTable from "./HistoryTable";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { fetchLinks } from "../services/connector";
import { LinksResponse, ProcessedEdge, EdgeData } from "../types/visualization";
import { ChessGame } from "../chess/chessGame";
import GraphView from "./GraphView";
import ArcView from "./ArcView";
import ChordDiagram from "./ChordDiagram";
import FENCharacterCount from "./FENCharacterCount";

const HelperVisual: React.FC = () => {
    const [selectedVisual, setSelectedVisual] =
        useState<string>("No Visual Selected");
    const chessGameState = useSelector((state: RootState) => state.chessGame);
    const fenHistory = useSelector((state: RootState) => {
        const game = new ChessGame(state.chessGame.positions[0].fen);
        const fens = [game.toFen()];

        state.chessGame.history.forEach((move) => {
            game.makeMove(move);
            fens.push(game.toFen());
        });

        return fens;
    });

    const [linksData, setLinksData] = useState<LinksResponse | null>(null);
    const [processedEdges, setProcessedEdges] = useState<ProcessedEdge[]>([]);

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
                    <option value="Chord View">Chord View</option>
                    <option value="History Table">History Table</option>
                    <option value="FEN Character Count">
                        FEN Character Count
                    </option>
                </select>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
                {selectedVisual === "History Table" && <HistoryTable />}
                {selectedVisual === "Graph View" && (
                    <GraphView
                        linksData={linksData}
                        processedEdges={processedEdges}
                    />
                )}
                {selectedVisual === "Arc View" && (
                    <ArcView
                        linksData={linksData}
                        processedEdges={processedEdges}
                    />
                )}
                {selectedVisual === "Chord View" && (
                    <ChordDiagram
                        nodes={linksData?.nodes || []}
                        edges={processedEdges}
                    />
                )}
                {selectedVisual === "FEN Character Count" && (
                    <FENCharacterCount fenHistory={fenHistory} />
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
