import React from "react";
import { useChessGame } from "../hooks/useChessGame";
import { useTheme } from "../hooks/useTheme";
import { PieceDisplayMode } from "../types/chess";
import { ConnectionType, AdjacenciesResponse } from "../types/visualization";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import MoveControls from "./MoveControls";
import ViewSelector from "./ViewSelector";
import PieceViewSelector from "./PieceViewSelector";
import ConnectionTypeSelector from "./ConnectionTypeSelector";
import BoardDisplay from "./BoardDisplay";
import HistoryTable from "./HistoryTable";
import GraphView from "./GraphView";
import ArcView from "./ArcView";
import ChordDiagram from "./ChordDiagram";
import FENCharacterCount from "./FENCharacterCount";
import HistoricalArcView from "./HistoricalArcView";
import ThemeSelector from "./ThemeSelector";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { LinksResponse, ProcessedEdge } from "../types/visualization";
import { fetchLinks, fetchAdjacencies } from "../services/connector";
import "./UnifiedChessContainer.css";

type ViewType =
    | "board"
    | "graph"
    | "history"
    | "arc"
    | "historicalArc"
    | "fencount"
    | "chord";

interface UnifiedChessContainerProps {
    displayMode: PieceDisplayMode;
    setDisplayMode: (mode: PieceDisplayMode) => void;
}

const UnifiedChessContainer: React.FC<UnifiedChessContainerProps> = ({
    displayMode,
    setDisplayMode,
}) => {
    const { theme, setTheme } = useTheme();
    const [selectedView, setSelectedView] = React.useState<ViewType>("board");
    const [connectionType, setConnectionType] =
        React.useState<ConnectionType>("links");
    const [linksData, setLinksData] = React.useState<LinksResponse | null>(
        null
    );
    const [adjacenciesData, setAdjacenciesData] =
        React.useState<AdjacenciesResponse | null>(null);
    const [processedEdges, setProcessedEdges] = React.useState<ProcessedEdge[]>(
        []
    );

    const { fen, setFen, currentPosition, submitFen } =
        useChessGame(displayMode);
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
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedLinks = await fetchLinks(chessGameState.fen);
                setLinksData(fetchedLinks);
                const fetchedAdjacencies = await fetchAdjacencies(
                    chessGameState.fen
                );
                setAdjacenciesData(fetchedAdjacencies);

                // Process edges based on connection type
                if (connectionType === "links" && fetchedLinks) {
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
                    setProcessedEdges(edges);
                } else if (
                    connectionType === "adjacencies" &&
                    fetchedAdjacencies
                ) {
                    const edges: ProcessedEdge[] = [];
                    Object.entries(fetchedAdjacencies).forEach(
                        ([source, targets]) => {
                            (targets as string[]).forEach((target: string) => {
                                edges.push({
                                    source,
                                    target,
                                    type: "adjacency",
                                });
                            });
                        }
                    );
                    setProcessedEdges(edges);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [chessGameState.fen, connectionType]);
    const getCurrentBoard = () => {
        const game = new ChessGame(currentPosition, displayMode);
        return game.asciiView();
    };
    const renderView = () => {
        switch (selectedView) {
            case "board":
                return <BoardDisplay board={getCurrentBoard()} />;
            case "graph":
                return (
                    <GraphView
                        linksData={linksData}
                        processedEdges={processedEdges}
                        displayMode={displayMode}
                    />
                );
            case "arc":
                return (
                    <ArcView
                        linksData={linksData}
                        processedEdges={processedEdges}
                        displayMode={displayMode}
                    />
                );
            case "chord":
                return (
                    <ChordDiagram
                        nodes={linksData?.nodes || []}
                        edges={processedEdges}
                    />
                );
            case "history":
                return <HistoryTable displayMode={displayMode} />;
            case "fencount":
                return <FENCharacterCount fenHistory={fenHistory} />;
            case "historicalArc":
                return <HistoricalArcView displayMode={displayMode} />;
            default:
                return <BoardDisplay board={getCurrentBoard()} />;
        }
    };

    const showConnectionTypeSelector = ["graph", "arc", "chord"].includes(
        selectedView
    );

    return (
        <div className="chess-container">
            <div className="setup-controls">
                <SelectPosition />
                <FenInput
                    fen={fen}
                    onFenChange={setFen}
                    onSubmitFen={submitFen}
                />
            </div>
            <div className="dropdowns-container">
                <ViewSelector
                    selectedView={selectedView}
                    onViewChange={(view) => setSelectedView(view as ViewType)}
                />
                <PieceViewSelector
                    displayMode={displayMode}
                    onDisplayModeChange={setDisplayMode}
                />
                <ConnectionTypeSelector
                    connectionType={connectionType}
                    onConnectionTypeChange={setConnectionType}
                />
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
            </div>
            <div className="visualization-section">
                <div className="view-container">{renderView()}</div>
            </div>
            <div className="move-controls">
                <MoveControls displayMode={displayMode} />
            </div>
        </div>
    );
};

export default UnifiedChessContainer;
