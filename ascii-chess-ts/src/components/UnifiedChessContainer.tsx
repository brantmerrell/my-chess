import "./UnifiedChessContainer.css";
import Accordion from "./Accordion";
import ArcView from "./ArcView";
import BoardDisplay from "./BoardDisplay";
import ChordDiagram from "./ChordDiagram";
import ConnectionTypeSelector from "./ConnectionTypeSelector";
import SequenceMetrics from "./SequenceMetrics";
import FenInput from "./FenInput";
import GraphView from "./GraphView";
import HistoricalArcView from "./HistoricalArcView";
import HistoryTable from "./HistoryTable";
import KeybindingIndicators from "./KeybindingIndicators";
import MoveControls from "./MoveControls";
import NavigationControls from "./NavigationControls";
import PieceViewSelector from "./PieceViewSelector";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "../app/hooks";
import SelectPosition from "./SelectPosition";
import ThemeSelector from "./ThemeSelector";
import { PositionalViewSelector, HistoricalViewSelector } from "./ViewSelector";
import { ChessGame } from "../chess/chessGame";
import { ConnectionType, AdjacenciesResponse } from "../types/visualization";
import { LinksResponse, ProcessedEdge } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import { RootState, goBackward, goForward, goToPosition } from "../app/store";
import { fetchLinks, fetchAdjacencies } from "../services/connector";
import { useChessGame } from "../hooks/useChessGame";
import { useSelector } from "react-redux";
import { useTheme } from "../hooks/useTheme";

type PositionalViewType = "board" | "graph" | "arc" | "chord";
type HistoricalViewType = "history" | "fencount"; // "historicalArc" | 

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
    const [selectedPositionalView, setSelectedPositionalView] = React.useState<PositionalViewType>("board");
    const [selectedHistoricalView, setSelectedHistoricalView] = React.useState<HistoricalViewType>("history");
    const [connectionType, setConnectionType] =
        React.useState<ConnectionType>("links");
    const [linksData, setLinksData] = React.useState<LinksResponse | null>(
        null
    );
    const [processedEdges, setProcessedEdges] = React.useState<ProcessedEdge[]>(
        []
    );
    const [showFenControls, setShowFenControls] = React.useState<boolean>(false);
    const [showViewControls, setShowViewControls] = React.useState<boolean>(false);
    const [showMoveControls, setShowMoveControls] = React.useState<boolean>(true);
    const [showKeybindings, setShowKeybindings] = React.useState<boolean>(false);

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
                case "i":
                case "I":
                    e.preventDefault();
                    const positionalViewSelector = document.querySelector(
                        "#positional-view-selector"
                    ) as HTMLSelectElement;
                    if (positionalViewSelector) {
                        positionalViewSelector.focus();
                    }
                    break;
                case "o":
                case "O":
                    e.preventDefault();
                    const historicalViewSelector = document.querySelector(
                        "#historical-view-selector"
                    ) as HTMLSelectElement;
                    if (historicalViewSelector) {
                        historicalViewSelector.focus();
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
                case "n":
                case "N":
                    const connectionSelector = document.querySelector(
                        "#connection-type-selector"
                    ) as HTMLSelectElement;
                    if (connectionSelector) {
                        connectionSelector.focus();
                    }
                    break;
                case "c":
                case "C":
                    e.preventDefault(); // Prevent default alphabetical selection
                    const selectedMove = document.querySelector(
                        "#selectedMove"
                    ) as HTMLSelectElement;
                    if (selectedMove) {
                        selectedMove.focus();
                    }
                    break;
                case "M":
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
                case "?":
                    setShowKeybindings(!showKeybindings);
                    break;
                case "r":
                case "R":
                    setShowViewControls(!showViewControls);
                    break;
                case "e":
                case "E":
                    setShowFenControls(!showFenControls);
                    break;
                case "v":
                case "V":
                    setShowMoveControls(!showMoveControls);
                    break;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [dispatch, submitUndoMove, chessGameState, showKeybindings, showViewControls, showFenControls, showMoveControls]);
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
    const renderPositionalView = () => {
        switch (selectedPositionalView) {
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
            default:
                return <BoardDisplay board={getCurrentBoard()} theme={theme} />;
        }
    };

    const renderHistoricalView = () => {
        switch (selectedHistoricalView) {
            case "history":
                return <HistoryTable displayMode={displayMode} />;
            case "fencount":
                return <SequenceMetrics fenHistory={fenHistory} positions={chessGameState.positions} />;
            //case "historicalArc":
            //    return <HistoricalArcView displayMode={displayMode} />;
            default:
                return <HistoryTable displayMode={displayMode} />;
        }
    };

    const showConnectionTypeSelector = ["graph", "arc", "chord"].includes(
        selectedPositionalView
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
            <Accordion
                title={<span>Appea<u>r</u>ance</span>}
                isExpanded={showViewControls}
                onToggle={() => setShowViewControls(!showViewControls)}
                theme={theme}
                className="combined-controls-disclosure"
            >
                <div className="view-controls-grid">
                    <PositionalViewSelector
                        selectedView={selectedPositionalView}
                        onViewChange={setSelectedPositionalView}
                    />
                    <HistoricalViewSelector
                        selectedView={selectedHistoricalView}
                        onViewChange={setSelectedHistoricalView}
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
            </Accordion>
            <Accordion
                title={<span>S<u>e</u>tup</span>}
                isExpanded={showFenControls}
                onToggle={() => setShowFenControls(!showFenControls)}
                theme={theme}
            >
                <div className="setup-controls">
                    <SelectPosition theme={theme} />
                    <FenInput
                        fen={fen}
                        onFenChange={setFen}
                        onSubmitFen={submitFen}
                        theme={theme}
                    />
                </div>
            </Accordion>
            <div className="main-content">
                <div className="positional-section">
                    <div className="view-container">{renderPositionalView()}</div>
                </div>
                <div className="historical-section">
                    <div className="view-container">{renderHistoricalView()}</div>
                </div>
            </div>
            <Accordion
                title={<span>Mo<u>v</u>es</span>}
                isExpanded={showMoveControls}
                onToggle={() => setShowMoveControls(!showMoveControls)}
                theme={theme}
                className="move-controls-disclosure"
            >
                <NavigationControls />
                <MoveControls displayMode={displayMode} />
            </Accordion>
            {showKeybindings && <KeybindingIndicators />}
            {!showKeybindings && (
                <div 
                    className="help-hint"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8em',
                        zIndex: 999,
                        opacity: 0.7,
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowKeybindings(true)}
                    title="Click or press ? to show keyboard shortcuts"
                >
                    Press ? for shortcuts
                </div>
            )}
        </div>
    );
};

export default UnifiedChessContainer;
