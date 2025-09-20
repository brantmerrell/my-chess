import "./UnifiedChessContainer.css";
import Accordion from "./common/Accordion";
import ArcView from "./position/ArcView";
import BoardDisplay from "./position/BoardDisplay";
import ChordDiagram from "./position/ChordDiagram";
import ConnectionTypeSelector from "./controls/ConnectionTypeSelector";
import SequenceMetrics from "./history/SequenceMetrics";
import FenInput from "./controls/FenInput";
import GraphView from "./position/GraphView";
import GraphDagView from "./position/GraphDagView";
import HistoricalArcView from "./position/HistoricalArcView";
import HistoryTable from "./history/HistoryTable";
import KeybindingIndicators from "./common/KeybindingIndicators";
import MoveControls from "./controls/MoveControls";
import NavigationControls from "./controls/NavigationControls";
import PieceViewSelector from "./controls/PieceViewSelector";
import PromotionDialog from "./PromotionDialog";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "../app/hooks";
import SelectPosition from "./controls/SelectPosition";
import SetupModeComponent from "./controls/SetupMode";
import ThemeSelector from "./controls/ThemeSelector";
import { PositionalViewSelector, HistoricalViewSelector } from "./controls/ViewSelector";
import VerticalResizer, { VerticalResizerHandle } from "./common/VerticalResizer";
import { ChessGame } from "../chess/chessGame";
import { ConnectionType, AdjacenciesResponse } from "../types/visualization";
import { LinksResponse, ProcessedEdge } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import {
  RootState,
  goBackward,
  goForward,
  goToPosition,
  makeMove,
} from "../app/store";
import { setSelectedSetup } from "../reducers/setups/setups.actions";
import {
  fetchLinks,
  fetchAdjacencies,
  fetchKingBox,
  fetchNone,
} from "../services/connector";
import { useChessGame } from "../hooks/useChessGame";
import { useLichessGame } from "../contexts/LichessGameContext";
import { useSelector } from "react-redux";
import { useTheme } from "../hooks/useTheme";

type PositionalViewType = "graph" | "board" | "arc" | "chord" | "graphdag";
type HistoricalViewType = "history" | "fencount"; // "historicalArc" |

interface UnifiedChessContainerProps {
  displayMode: PieceDisplayMode;
  setDisplayMode: (mode: PieceDisplayMode) => void;
}

const UnifiedChessContainer: React.FC<UnifiedChessContainerProps> = ({
  displayMode,
  setDisplayMode,
}) => {
  const [notification, setNotification] = React.useState<{
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
  }>({ message: "", type: "info" });
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const verticalResizerRef = React.useRef<VerticalResizerHandle>(null);
  const [selectedPositionalView, setSelectedPositionalView] =
    React.useState<PositionalViewType>("graph");
  const [selectedHistoricalView, setSelectedHistoricalView] =
    React.useState<HistoricalViewType>("history");
  const [connectionType, setConnectionType] =
    React.useState<ConnectionType>("none");
  const [linksData, setLinksData] = React.useState<LinksResponse | null>(null);
  const [processedEdges, setProcessedEdges] = React.useState<ProcessedEdge[]>(
    []
  );
  const [showFenControls, setShowFenControls] = React.useState<boolean>(false);
  const [showViewControls, setShowViewControls] =
    React.useState<boolean>(false);
  const [showMoveControls, setShowMoveControls] = React.useState<boolean>(true);
  const [showKeybindings, setShowKeybindings] = React.useState<boolean>(false);
  const [showGrid, setShowGrid] = React.useState<boolean>(true);
  const [flipBoard, setFlipBoard] = React.useState<boolean>(false);
  const [moveInput, setMoveInput] = React.useState<string>("");
  const [moveDropdownValue, setMoveDropdownValue] = React.useState<string>("");
  const [promotionDialog, setPromotionDialog] = React.useState<{
    isOpen: boolean;
    moves: any[];
    fromSquare: string;
    toSquare: string;
  }>({
    isOpen: false,
    moves: [],
    fromSquare: '',
    toSquare: ''
  });

  const { fen, setFen, currentPosition, submitFen, submitUndoMove } =
    useChessGame(displayMode);
  const { gameState, sendMove, getCurrentPosition, setNotificationCallback } = useLichessGame();
  const chessGameState = useSelector((state: RootState) => state.chessGame);

  React.useEffect(() => {
    if (gameState.isPlaying && gameState.color) {
      const shouldFlip = gameState.color === 'black';
      console.log('[UnifiedChessContainer] Auto-orienting board:', {
        color: gameState.color,
        shouldFlip,
        currentFlipState: flipBoard
      });
      if (flipBoard !== shouldFlip) {
        setFlipBoard(shouldFlip);
      }
    } else if (!gameState.isPlaying && gameState.gameId === null) {
      if (flipBoard) {
        console.log('[UnifiedChessContainer] Resetting board orientation to default');
        setFlipBoard(false);
      }
    }
  }, [gameState.isPlaying, gameState.color, gameState.gameId]);

  const showNotification = React.useCallback((message: string, type: 'error' | 'warning' | 'success' | 'info' = "info") => {
    setNotification({ message, type });
  }, []);

  React.useEffect(() => {
    setNotificationCallback(showNotification);
    return () => setNotificationCallback(null);
  }, [setNotificationCallback, showNotification]);

  const fenHistory = useMemo(() => {
    const game = new ChessGame(chessGameState.positions[0].fen);
    const fens = [game.toFen()];
    chessGameState.history.forEach((move) => {
      game.makeMove(move);
      fens.push(game.toFen());
    });
    return fens;
  }, [chessGameState.positions, chessGameState.history]);

  const clearNotification = () => {
    setNotification({ message: "", type: "info" });
  };

  const handlePromotionSelect = (selectedMove: any) => {
    console.log('Promotion selected:', selectedMove);

    if (gameState.isPlaying && gameState.gameId) {
      const promotion = selectedMove.promotion || '';
      const uciMove = promotionDialog.fromSquare + promotionDialog.toSquare + promotion;
      sendMove(promotionDialog.fromSquare, promotionDialog.toSquare, promotion).then((success) => {
        console.log('Promotion move send result:', success);
        if (success) {
          showNotification(`${uciMove} sent to Lichess`, "success");
        } else {
          showNotification(`Failed to send ${uciMove} to Lichess`, "error");
        }
      }).catch((error) => {
        console.error('Error sending promotion move:', error);
        showNotification(`Error sending ${uciMove} to Lichess`, "error");
      });
    } else {
      // For analysis mode, update the local board immediately
      dispatch(makeMove(selectedMove.san));
    }

    setMoveInput("");
    setMoveDropdownValue("");

    setPromotionDialog({
      isOpen: false,
      moves: [],
      fromSquare: '',
      toSquare: ''
    });
  };

  const handlePromotionCancel = () => {
    setPromotionDialog({
      isOpen: false,
      moves: [],
      fromSquare: '',
      toSquare: ''
    });
  };

  const handleMoveAttempt = (
    fromSquare: string,
    toSquare: string,
    uciMove: string
  ): boolean => {
    console.log('handleMoveAttempt called with:', { fromSquare, toSquare, uciMove });

    try {
      // Use Lichess cache position if in a Lichess game, otherwise use Redux state
      let game: ChessGame;
      let verboseMoves: any[];

      console.log('[UnifiedChessContainer] Current gameState:', {
        isPlaying: gameState.isPlaying,
        gameId: gameState.gameId,
        status: gameState.status
      });

      if (gameState.isPlaying && gameState.gameId) {
        // In Lichess game - use the cache position
        game = getCurrentPosition();
        verboseMoves = game.getVerboseMoves();
        console.log('Using Lichess cache position for move validation');
      } else {
        // In analysis mode - use Redux state
        game = new ChessGame(chessGameState.fen, displayMode);
        verboseMoves = game.getVerboseMoves();
        console.log('Using Redux state position for move validation');
      }

      console.log('Available verbose moves:', verboseMoves.slice(0, 5)); // Show first 5 moves

      const matchingMoves = verboseMoves.filter(
        (move: any) => move.from === fromSquare && move.to === toSquare
      );

      console.log('Matching moves found:', matchingMoves);

      if (matchingMoves.length === 0) {
        console.log('No legal moves found for this piece to that square');

        if (gameState.isPlaying && !gameState.isMyTurn) {
          showNotification("It's not your turn", "warning");
        } else {
          // Get the current turn from FEN
          const fenParts = game.toFen().split(' ');
          const currentTurn = fenParts[1]; // 'w' or 'b'
          const turnColor = currentTurn === 'w' ? 'white' : 'black';

          // Check if there are any moves for this piece
          const allMoves = verboseMoves.filter((m: any) => m.from === fromSquare);
          if (allMoves.length === 0) {
            // No moves from this square - likely wrong color or empty square
            showNotification(`It's ${turnColor}'s turn to move`, "warning");
          } else {
            // There are moves from this square, but not to the target square
            showNotification("Invalid move", "error");
          }
        }
        return false;
      }

      if (matchingMoves.length > 1 && matchingMoves.some(m => m.promotion)) {
        console.log('Promotion detected, showing dialog');
        setPromotionDialog({
          isOpen: true,
          moves: matchingMoves,
          fromSquare,
          toSquare
        });
        return true; // Move pending promotion selection
      }

      const matchingMove = matchingMoves[0];

      if (matchingMove) {
        // If we're in a Lichess game, send the move there asynchronously
        if (gameState.isPlaying && gameState.gameId) {
          console.log('Attempting to send move to Lichess:', {
            gameId: gameState.gameId,
            fromSquare,
            toSquare,
            matchingMove,
            gameState
          });

          const promotion = matchingMove.promotion || '';

          // Send move to Lichess asynchronously
          const uciMove = fromSquare + toSquare + promotion;
          sendMove(fromSquare, toSquare, promotion).then((success) => {
            console.log('Move send result:', success);
            if (success) {
              showNotification(`${uciMove} sent to Lichess`, "success");
            } else {
              showNotification(`Failed to send ${uciMove} to Lichess`, "error");
            }
          }).catch((error) => {
            console.error('Error sending move:', error);
            showNotification(`Error sending ${uciMove} to Lichess`, "error");
          });

          // Don't update local board immediately for Lichess games -
          // wait for confirmation from the game stream
        } else {
          console.log('Not in Lichess game, updating local board:', {
            isPlaying: gameState.isPlaying,
            gameId: gameState.gameId
          });
          // For analysis mode, update the local board immediately
          dispatch(makeMove(matchingMove.san));
        }

        setMoveInput("");
        setMoveDropdownValue("");
        // Clear any previous error notifications on successful move
        clearNotification();
        return true;
      } else {
        setMoveInput(uciMove);
        setMoveDropdownValue("");
        return false;
      }
    } catch (error) {
      setMoveInput(uciMove);
      setMoveDropdownValue("");
      return false;
    }
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
          e.preventDefault();
          window.scrollBy({
            top: 100,
            behavior: "smooth",
          });
          break;
        case "k":
          e.preventDefault();
          window.scrollBy({
            top: -100,
            behavior: "smooth",
          });
          break;
        case "u":
          e.preventDefault();
          if (
            chessGameState.currentPositionIndex ===
            chessGameState.positions.length - 1
          ) {
            submitUndoMove();
          } else {
            showNotification("Must be at latest position to undo", "warning");
          }
          break;
        case "F":
          e.preventDefault();
          if (!showFenControls) setShowFenControls(true); // Open Setup accordion
          const fenInput = document.querySelector(
            "#edit-string"
          ) as HTMLInputElement;
          if (fenInput) {
            fenInput.focus();
          }
          break;
        case "f":
          e.preventDefault(); // Prevent alphabetical selection in dropdown
          console.log("f");
          if (!showFenControls) setShowFenControls(true); // Open Setup accordion
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
          if (!showViewControls) setShowViewControls(true); // Open Appearance accordion
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
          if (!showViewControls) setShowViewControls(true); // Open Appearance accordion
          const historicalViewSelector = document.querySelector(
            "#historical-view-selector"
          ) as HTMLSelectElement;
          if (historicalViewSelector) {
            historicalViewSelector.focus();
          }
          break;
        case "p":
          e.preventDefault();
          if (!showViewControls) setShowViewControls(true); // Open Appearance accordion
          const pieceViewSelector = document.querySelector(
            "#piece-view-selector"
          ) as HTMLSelectElement;
          if (pieceViewSelector) {
            pieceViewSelector.focus();
          }
          break;
        case "n":
        case "N":
          e.preventDefault();
          if (!showViewControls) setShowViewControls(true); // Open Appearance accordion
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
          if (!showMoveControls) setShowMoveControls(true); // Open Moves accordion
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
          if (!showMoveControls) setShowMoveControls(true); // Open Moves accordion
          const move = document.querySelector("#move") as HTMLInputElement;
          if (move) {
            move.focus();
          }
          break;
        case "t":
          e.preventDefault();
          if (!showViewControls) setShowViewControls(true); // Open Appearance accordion
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
          e.preventDefault();
          setShowViewControls(!showViewControls);
          break;
        case "e":
        case "E":
          e.preventDefault();
          setShowFenControls(!showFenControls);
          break;
        case "v":
        case "V":
          e.preventDefault();
          setShowMoveControls(!showMoveControls);
          break;
        case "+":
        case "=": // Also handle = key (which is typically the same key as + without shift)
          e.preventDefault();
          verticalResizerRef.current?.increaseHeight();
          break;
        case "-":
          e.preventDefault();
          verticalResizerRef.current?.decreaseHeight();
          break;
        case "w":
        case "W":
          e.preventDefault();
          if (selectedPositionalView === "graph") {
            setShowGrid(!showGrid);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    dispatch,
    submitUndoMove,
    chessGameState,
    showKeybindings,
    showViewControls,
    showFenControls,
    showMoveControls,
    showGrid,
    selectedPositionalView,
  ]);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData;
        if (connectionType === "links") {
          fetchedData = await fetchLinks(chessGameState.fen);
        } else if (connectionType === "adjacencies") {
          fetchedData = await fetchAdjacencies(chessGameState.fen);
        } else if (connectionType === "king_box") {
          fetchedData = await fetchKingBox(chessGameState.fen);
        } else if (connectionType === "none") {
          fetchedData = await fetchNone(chessGameState.fen);
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
            showGrid={showGrid}
            flipBoard={flipBoard}
            onMoveAttempt={handleMoveAttempt}
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
          <ChordDiagram nodes={linksData?.nodes || []} edges={processedEdges} />
        );
      case "graphdag":
        return <GraphDagView edges={processedEdges} theme={theme} />;
      default:
        return <BoardDisplay board={getCurrentBoard()} theme={theme} />;
    }
  };

  const renderHistoricalView = () => {
    switch (selectedHistoricalView) {
      case "history":
        return <HistoryTable displayMode={displayMode} />;
      case "fencount":
        return (
          <SequenceMetrics
            fenHistory={fenHistory}
            positions={chessGameState.positions}
            currentPositionIndex={chessGameState.currentPositionIndex}
          />
        );
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
      <Accordion
        title={
          <span>
            Appea<u>r</u>ance
          </span>
        }
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
          {selectedPositionalView === "graph" && (
            <div className="grid-toggle-container">
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Sho<u>w</u> Grid
              </label>
              <label style={{ marginLeft: '15px' }}>
                <input
                  type="checkbox"
                  checked={flipBoard}
                  onChange={(e) => setFlipBoard(e.target.checked)}
                />
                Flip Board
                {gameState.isPlaying && gameState.color && (
                  <span style={{
                    fontSize: '0.8em',
                    marginLeft: '5px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                  </span>
                )}
              </label>
            </div>
          )}
        </div>
      </Accordion>
      <Accordion
        title={
          <span>
            S<u>e</u>tup
          </span>
        }
        isExpanded={showFenControls}
        onToggle={() => setShowFenControls(!showFenControls)}
        theme={theme}
      >
        <SetupModeComponent
          theme={theme}
          fen={fen}
          setFen={setFen}
          submitFen={submitFen}
          notification={notification}
          clearNotification={clearNotification}
        />
      </Accordion>
      <VerticalResizer
        ref={verticalResizerRef}
        initialHeight={500}
        minHeight={300}
        maxHeight={window.innerHeight * 0.8}
      >
        <div className="main-content">
          <div className="positional-section">
            <div className="view-container">{renderPositionalView()}</div>
          </div>
          <div className="historical-section">
            <div className="view-container">{renderHistoricalView()}</div>
          </div>
        </div>
      </VerticalResizer>
      <Accordion
        title={
          <span>
            Mo<u>v</u>es
          </span>
        }
        isExpanded={showMoveControls}
        onToggle={() => setShowMoveControls(!showMoveControls)}
        theme={theme}
        className="move-controls-disclosure"
      >
        <NavigationControls />
        <MoveControls
          displayMode={displayMode}
          externalMoveInput={moveInput || undefined}
          externalMoveDropdown={moveDropdownValue || undefined}
          onExternalMoveInputChange={setMoveInput}
          onExternalMoveDropdownChange={setMoveDropdownValue}
          onMoveAttempt={handleMoveAttempt}
          gameState={gameState}
        />
      </Accordion>
      {showKeybindings && <KeybindingIndicators />}
      {!showKeybindings && (
        <div
          className="help-hint"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "0.8em",
            zIndex: 999,
            opacity: 0.7,
            cursor: "pointer",
          }}
          onClick={() => setShowKeybindings(true)}
          title="Click or press ? to show keyboard shortcuts"
        >
          Press ? for shortcuts
        </div>
      )}

      <PromotionDialog
        isOpen={promotionDialog.isOpen}
        moves={promotionDialog.moves}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
        color={chessGameState.fen.split(' ')[1] === 'w' ? 'black' : 'white'}
      />
    </div>
  );
};

export default UnifiedChessContainer;
