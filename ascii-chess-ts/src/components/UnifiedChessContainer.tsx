import "./UnifiedChessContainer.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ConnectionTypeSelector from "./controls/ConnectionTypeSelector";
import SequenceMetrics from "./history/SequenceMetrics";
import GraphView from "./position/GraphView";
import HistoryTable from "./history/HistoryTable";
import KeybindingIndicators from "./common/KeybindingIndicators";
import MoveControls from "./controls/MoveControls";
import NavigationControls from "./controls/NavigationControls";
import PromotionDialog from "./PromotionDialog";
import SetupModeComponent, { SetupMode } from "./controls/SetupMode";
import SwipeIndicators from "./common/SwipeIndicators";
import BoardViewControls, { BoardView } from "./controls/BoardViewControls";
import { HistoricalViewSelector } from "./controls/HistoricalViewSelector";
import VerticalResizer, {
  VerticalResizerHandle,
} from "./common/VerticalResizer";
import { RootState } from "../app/store";
import { ConnectionType } from "../types/visualization";
import { PieceDisplayMode } from "../types/chess";
import { useChessGame } from "../hooks/useChessGame";
import { useConnections } from "../hooks/useConnections";
import { useGlobalKeybindings } from "../hooks/useGlobalKeybindings";
import { useMobileSwipeView } from "../hooks/useMobileSwipeView";
import { useMoveSubmission } from "../hooks/useMoveSubmission";
import { useNotification } from "../hooks/useNotification";
import { useUrlSync, parseUrlParams } from "../hooks/useUrlSync";
import { useLichessGame } from "../contexts/LichessGameContext";
import { useTheme } from "../hooks/useTheme";

type HistoricalViewType = "history" | "fencount";

interface UnifiedChessContainerProps {
  displayMode: PieceDisplayMode;
  setDisplayMode: (mode: PieceDisplayMode) => void;
}

const UnifiedChessContainer: React.FC<UnifiedChessContainerProps> = ({
  displayMode,
  setDisplayMode,
}) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<SetupMode>(() => parseUrlParams().mode);
  const [selectedHistoricalView, setSelectedHistoricalView] =
    useState<HistoricalViewType>("history");
  const [connectionType, setConnectionType] = useState<ConnectionType>("none");
  const [showMoveControls, setShowMoveControls] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [heatmap, setHeatmap] = useState<boolean>(false);
  const [flipBoard, setFlipBoard] = useState<boolean>(false);

  const verticalResizerRef = useRef<VerticalResizerHandle>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const { notification, showNotification, clearNotification } =
    useNotification();
  const { fen, setFen, submitFen, submitUndoMove } = useChessGame(displayMode);
  const { gameState, setNotificationCallback } = useLichessGame();
  const chessGameState = useSelector((state: RootState) => state.chessGame);
  const { activeMobileView, scrollToView } = useMobileSwipeView(mainContentRef);
  const { linksData, processedEdges } = useConnections(
    chessGameState.fen,
    connectionType,
    heatmap,
  );
  const {
    moveInput,
    setMoveInput,
    moveDropdownValue,
    setMoveDropdownValue,
    promotionDialog,
    handleMoveAttempt,
    handlePromotionSelect,
    handlePromotionCancel,
  } = useMoveSubmission(displayMode, showNotification, clearNotification);

  // Sync URL with app state
  useUrlSync({ mode, onModeChange: setMode });

  // Auto-orient the board to the player's color during a Lichess game
  useEffect(() => {
    if (gameState.isPlaying && gameState.color) {
      setFlipBoard(gameState.color === "black");
    } else if (!gameState.isPlaying && gameState.gameId === null) {
      setFlipBoard(false);
    }
  }, [gameState.isPlaying, gameState.color, gameState.gameId]);

  useEffect(() => {
    setNotificationCallback(showNotification);
    return () => setNotificationCallback(null);
  }, [setNotificationCallback, showNotification]);

  // Connection type couples with display mode
  const handleConnectionTypeChange = useCallback(
    (newConnectionType: ConnectionType) => {
      setConnectionType(newConnectionType);
      switch (newConnectionType) {
        case "none":
          setDisplayMode("full");
          break;
        case "adjacencies":
          setDisplayMode("masked");
          break;
        case "links":
        case "king_box":
        case "shadows":
          setDisplayMode("symbols");
          break;
      }
    },
    [setDisplayMode],
  );

  const setBoardView = useCallback((view: BoardView) => {
    setShowGrid(view !== "none");
    setHeatmap(view === "heatmap");
  }, []);

  useGlobalKeybindings({
    submitUndoMove,
    showNotification,
    setDisplayMode,
    onConnectionTypeChange: handleConnectionTypeChange,
    setBoardView,
    showMoveControls,
    setShowMoveControls,
    verticalResizerRef,
  });

  const fenHistory = useMemo(
    () => chessGameState.positions.map((pos) => pos.fen),
    [chessGameState.positions],
  );

  return (
    <div className="chess-container">
      <SetupModeComponent
        theme={theme}
        fen={fen}
        setFen={setFen}
        submitFen={submitFen}
        notification={notification}
        clearNotification={clearNotification}
        mode={mode}
        onModeChange={setMode}
      />
      <VerticalResizer
        ref={verticalResizerRef}
        initialHeight={500}
        minHeight={300}
        maxHeight={window.innerHeight * 0.8}
      >
        <div className="main-content" ref={mainContentRef}>
          <div className="positional-section">
            <GraphView
              linksData={linksData}
              processedEdges={processedEdges}
              displayMode={displayMode}
              showGrid={showGrid}
              flipBoard={flipBoard}
              heatmap={heatmap}
              lastMoveUCI={
                chessGameState.positions[chessGameState.currentPositionIndex]
                  ?.uci
              }
              onMoveAttempt={handleMoveAttempt}
            />
          </div>
          <div className="historical-section">
            <div className="view-container">
              {selectedHistoricalView === "fencount" ? (
                <SequenceMetrics
                  fenHistory={fenHistory}
                  positions={chessGameState.positions}
                  currentPositionIndex={chessGameState.currentPositionIndex}
                />
              ) : (
                <HistoryTable displayMode={displayMode} />
              )}
            </div>
          </div>
        </div>
      </VerticalResizer>
      <SwipeIndicators
        activeView={activeMobileView}
        onSelectView={scrollToView}
      />
      <MoveControls
        displayMode={displayMode}
        externalMoveInput={moveInput || undefined}
        externalMoveDropdown={moveDropdownValue || undefined}
        onExternalMoveInputChange={setMoveInput}
        onExternalMoveDropdownChange={setMoveDropdownValue}
        onMoveAttempt={handleMoveAttempt}
        gameState={gameState}
      />
      <NavigationControls />
      <div className="view-controls-left">
        <ConnectionTypeSelector
          connectionType={connectionType}
          onConnectionTypeChange={handleConnectionTypeChange}
        />
        <BoardViewControls
          flipBoard={flipBoard}
          showGrid={showGrid}
          heatmap={heatmap}
          onFlipBoardChange={setFlipBoard}
          onBoardViewChange={setBoardView}
        />
      </div>
      <HistoricalViewSelector
        selectedView={selectedHistoricalView}
        onViewChange={setSelectedHistoricalView}
      />
      <KeybindingIndicators />
      <PromotionDialog
        isOpen={promotionDialog.isOpen}
        moves={promotionDialog.moves}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
        color={chessGameState.fen.split(" ")[1] === "w" ? "black" : "white"}
      />
    </div>
  );
};

export default UnifiedChessContainer;
