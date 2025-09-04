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
import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "../app/hooks";
import SelectPosition from "./SelectPosition";
import ThemeSelector from "./ThemeSelector";
import ViewSelector from "./ViewSelector";
import { ChessGame } from "../chess/chessGame";
import { ConnectionType, AdjacenciesResponse } from "../types/visualization";
import { LinksResponse, ProcessedEdge } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import { RootState, goBackward, goForward, goToPosition } from "../app/store";
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
    const [notification, setNotification] = React.useState<string>("");
    const { theme, setTheme } = useTheme();
    const dispatch = useAppDispatch();
    const [selectedView, setSelectedView] = React.useState<ViewType>("board");
    const [connectionType, setConnectionType] =
        React.useState<ConnectionType>("links");
    const [linksData, setLinksData] = React.useState<LinksResponse | null>(
        null
    );
    const [processedEdges, setProcessedEdges] = React.useState<ProcessedEdge[]>(
        []
    );
    const [showFenControls, setShowFenControls] = React.useState<boolean>(true);
    const [showViewControls, setShowViewControls] = React.useState<boolean>(true);
    const [showMoveControls, setShowMoveControls] = React.useState<boolean>(true);

    const { fen, setFen, currentPosition, submitFen, submitUndoMove } =
        useChessGame(displayMode);
    const chessGameState = useSelector((state: RootState) => state.chessGame);
    const fenHistory = useMemo(() => {
        const game = new ChessGame(chessGameState.positions[0].fen);
        const fens = [game.toFen()];
        chessGameState.history.forEach((move) => {
            game.makeMove(move);
            fens.push(game.toFen());
        });
        return fens;
    }, [chessGameState.positions, chessGameState.history]);
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(""), 3000);
    };
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (
                e.key.toLowerCase() !== "escape" &&
                (e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLSelectElement ||
                    e.target instanceof HTMLTextAreaElement)
            ) {
                return;
            }

            switch (e.key) {
                case "Escape":
                    const activeElement = document.activeElement as HTMLElement;
                    if (activeElement && activeElement.blur) {
                        activeElement.blur();
                    }
                    break;
                case "j":
                    window.scrollBy({
                        top: 100,
                        behavior: "smooth",
                    });
                    break;
                case "k":
                    window.scrollBy({
                        top: -100,
                        behavior: "smooth",
                    });
                    break;
                case "u":
                    if (
                        chessGameState.currentPositionIndex ===
                        chessGameState.positions.length - 1
                    ) {
                        submitUndoMove();
                    } else {
                        showNotification("Must be at latest position to undo");
                    }
                    break;
                case "F":
                    e.preventDefault();
                    const fenInput = document.querySelector(
                        "#edit-string"
                    ) as HTMLInputElement;
                    if (fenInput) {
                        fenInput.focus();
                    }
                    break;
                case "f":
                    console.log("f");
                    const positionSelector = document.querySelector(
                        "#position-selector"
                    ) as HTMLSelectElement;
                    if (positionSelector) {
                        positionSelector.focus();
                    }
                    break;
                case "h":
                    dispatch(goBackward());
                    break;
                case "l":
                    dispatch(goForward());
                    break;
                case "^":
                    dispatch(goToPosition(0));
                    break;
                case "$":
                    const { positions } = chessGameState;
                    dispatch(goToPosition(positions.length - 1));
                    break;
                case "g":
                    e.preventDefault();
                    const gameViewSelector = document.querySelector(
                        "#game-view-selector"
                    ) as HTMLSelectElement;
                    if (gameViewSelector) {
                        gameViewSelector.focus();
                    }
                    break;
                case "p":
                    const pieceViewSelector = document.querySelector(
                        "#piece-view-selector"
                    ) as HTMLSelectElement;
                    if (pieceViewSelector) {
                        pieceViewSelector.focus();
                    }
                    break;
                case "c":
                    const connectionSelector = document.querySelector(
                        "#connection-type-selector"
                    ) as HTMLSelectElement;
                    if (connectionSelector) {
                        connectionSelector.focus();
                    }
                    break;
                case "M":
                    const selectedMove = document.querySelector(
                        "#selectedMove"
                    ) as HTMLSelectElement;
                    if (selectedMove) {
                        selectedMove.focus();
                    }
                    break;
                case "m":
                    e.preventDefault();
                    const move = document.querySelector(
                        "#move"
                    ) as HTMLInputElement;
                    if (move) {
                        move.focus();
                    }
                    break;
                case "t":
                    const themeSelector = document.querySelector(
                        "#theme-selector"
                    ) as HTMLSelectElement;
                    if (themeSelector) {
                        themeSelector.focus();
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [dispatch, submitUndoMove, setSelectedView, chessGameState]);
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                let fetchedData;
                if (connectionType === "links") {
                    fetchedData = await fetchLinks(chessGameState.fen);
                } else if (connectionType === "adjacencies") {
                    fetchedData = await fetchAdjacencies(chessGameState.fen);
                }
                if (fetchedData && fetchedData.nodes && fetchedData.edges) {
                    setLinksData(fetchedData);

                    const edges = fetchedData.edges.map((edge: any) => ({
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
                } else {
                    setLinksData({ nodes: [], edges: [] });
                    setProcessedEdges([]);
                }
            } catch (error) {
                setLinksData({ nodes: [], edges: [] });
                setProcessedEdges([]);
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
            {notification && (
                <div
                    className="alert alert-warning"
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 1000,
                        maxWidth: "300px",
                    }}
                >
                    {notification}
                </div>
            )}
            <div className="fen-controls-disclosure">
                <button
                    className="disclosure-header"
                    onClick={() => setShowFenControls(!showFenControls)}
                    aria-expanded={showFenControls}
                    aria-label={showFenControls ? "Collapse FEN Controls" : "Expand FEN Controls"}
                >
                    <span className={`disclosure-chevron ${showFenControls ? 'expanded' : 'collapsed'}`}>
                        ▶
                    </span>
                    <span className="disclosure-title">FEN Controls</span>
                </button>
                <div className={`disclosure-content ${showFenControls ? 'expanded' : 'collapsed'}`}>
                    <div className="setup-controls">
                        <SelectPosition />
                        <FenInput
                            fen={fen}
                            onFenChange={setFen}
                            onSubmitFen={submitFen}
                        />
                    </div>
                </div>
            </div>
            <div className="main-content">
                <div className="visualization-section">
                    <div className="view-container">{renderView()}</div>
                </div>
                <div className="controls-sidebar">
                    <div className="view-controls-disclosure">
                        <button
                            className="disclosure-header"
                            onClick={() => setShowViewControls(!showViewControls)}
                            aria-expanded={showViewControls}
                            aria-label={showViewControls ? "Collapse View Controls" : "Expand View Controls"}
                        >
                            <span className={`disclosure-chevron ${showViewControls ? 'expanded' : 'collapsed'}`}>
                                ▶
                            </span>
                            <span className="disclosure-title">View Controls</span>
                        </button>
                        <div className={`disclosure-content ${showViewControls ? 'expanded' : 'collapsed'}`}>
                            <div className="view-controls-grid">
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
                        </div>
                    </div>

                    <div className="move-controls-disclosure">
                        <button
                            className="disclosure-header"
                            onClick={() => setShowMoveControls(!showMoveControls)}
                            aria-expanded={showMoveControls}
                            aria-label={showMoveControls ? "Collapse Move Controls" : "Expand Move Controls"}
                        >
                            <span className={`disclosure-chevron ${showMoveControls ? 'expanded' : 'collapsed'}`}>
                                ▶
                            </span>
                            <span className="disclosure-title">Move Controls</span>
                        </button>
                        <div className={`disclosure-content ${showMoveControls ? 'expanded' : 'collapsed'}`}>
                            <NavigationControls />
                            <MoveControls displayMode={displayMode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedChessContainer;
