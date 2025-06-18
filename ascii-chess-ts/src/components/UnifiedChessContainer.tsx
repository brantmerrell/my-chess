import "./UnifiedChessContainer.css";
import ArcView from "./ArcView";
import BoardDisplay from "./BoardDisplay";
import ChordDiagram from "./ChordDiagram";
import ConnectionTypeSelector from "./ConnectionTypeSelector";
import SequenceMetrics from "./SequenceMetrics";
import FenInput from "./FenInput";
import GraphView from "./GraphView";
import HistoricalArcView from "./HistoricalArcView";
import HistoryTable from "./HistoryTable";
import MoveControls from "./MoveControls";
import NavigationControls from "./NavigationControls";
import PieceViewSelector from "./PieceViewSelector";
import React from "react";
import SelectPosition from "./SelectPosition";
import ThemeSelector from "./ThemeSelector";
import ViewSelector from "./ViewSelector";
import { ChessGame } from "../chess/chessGame";
import { ConnectionType, AdjacenciesResponse } from "../types/visualization";
import { LinksResponse, ProcessedEdge } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import { RootState } from "../app/store";
import { fetchLinks, fetchAdjacencies } from "../services/connector";
import { useChessGame } from "../hooks/useChessGame";
import { useSelector } from "react-redux";
import { useTheme } from "../hooks/useTheme";

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
                return <BoardDisplay board={getCurrentBoard()} theme={theme} />;
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
                return <SequenceMetrics fenHistory={fenHistory} />;
            case "historicalArc":
                return <HistoricalArcView displayMode={displayMode} />;
            default:
                return <BoardDisplay board={getCurrentBoard()} theme={theme} />;
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
                <NavigationControls />
                <MoveControls displayMode={displayMode} />
            </div>
        </div>
    );
};

export default UnifiedChessContainer;
