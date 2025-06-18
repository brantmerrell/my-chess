import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    RootState,
    loadFen,
    makeMove,
    undoMove,
    goForward,
    goBackward,
    goToPosition,
} from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { PieceDisplayMode } from "../types/chess";
import { Position } from "../types/chess";

export const useMoveHistory = (displayMode: PieceDisplayMode) => {
    const dispatch = useDispatch();
    const chessGameState = useSelector((state: RootState) => state.chessGame);

    const [state, setState] = useState({
        moves: [] as string[],
        selectedMove: "",
        errorMessage: "",
        undoMessage: "",
        isProcessing: false,
    });

    const isAtLatestPosition =
        chessGameState.currentPositionIndex ===
        chessGameState.positions.length - 1;
    useEffect(() => {
        try {
            const game = new ChessGame(chessGameState.fen, displayMode);
            setState((prev) => ({
                ...prev,
                moves: game.getMoves(),
                isProcessing: false,
                selectedMove: isAtLatestPosition ? prev.selectedMove : "",
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                errorMessage: "Error calculating available moves",
                isProcessing: false,
            }));
        }
    }, [chessGameState.fen, displayMode, isAtLatestPosition]);

    const setSelectedMove = (move: string) => {
        if (!isAtLatestPosition) return;
        setState((prev) => ({
            ...prev,
            selectedMove: move,
            errorMessage: "",
        }));
    };

    const makeSelectedMove = async (move: string) => {
        if (!move.trim()) return;
        if (!isAtLatestPosition) {
            setState((prev) => ({
                ...prev,
                errorMessage:
                    "Cannot make moves from historical positions. Navigate to the latest position first.",
            }));
            return;
        }

        setState((prev) => ({ ...prev, isProcessing: true }));

        try {
            dispatch(makeMove(move));
            setState((prev) => ({
                ...prev,
                selectedMove: "",
                errorMessage: "",
                undoMessage: "",
                isProcessing: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                errorMessage: `Invalid move: ${move}`,
                isProcessing: false,
            }));
        }
    };

    const undoLastMove = () => {
        // Prevent undo when not at latest position
        if (!isAtLatestPosition) {
            setState((prev) => ({
                ...prev,
                undoMessage:
                    "Cannot undo moves from historical positions. Navigate to the latest position first.",
            }));
            setTimeout(() => {
                setState((prev) => ({ ...prev, undoMessage: "" }));
            }, 3000);
            return;
        }

        if (chessGameState.history.length === 0) {
            setState((prev) => ({
                ...prev,
                undoMessage: "No moves to undo",
            }));
            setTimeout(() => {
                setState((prev) => ({ ...prev, undoMessage: "" }));
            }, 3000);
            return;
        }

        dispatch(undoMove());
        setState((prev) => ({
            ...prev,
            undoMessage: "",
            errorMessage: "",
        }));
    };

    const resetToPosition = (fen: string, setupHistory?: Position[]) => {
        try {
            dispatch(
                loadFen({
                    fen,
                    setupHistory,
                })
            );
            setState((prev) => ({
                ...prev,
                selectedMove: "",
                errorMessage: "",
                undoMessage: "",
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                errorMessage: "Invalid position",
            }));
        }
    };

    const navigateForward = () => {
        dispatch(goForward());
    };

    const navigateBackward = () => {
        dispatch(goBackward());
    };

    const navigateToPosition = (index: number) => {
        dispatch(goToPosition(index));
    };

    return {
        moves: state.moves,
        selectedMove: state.selectedMove,
        errorMessage: state.errorMessage,
        undoMessage: state.undoMessage,
        isProcessing: state.isProcessing,
        moveHistory: chessGameState.history,
        currentPosition: chessGameState.fen,
        positions: chessGameState.positions,
        currentPositionIndex: chessGameState.currentPositionIndex,
        isAtLatestPosition,

        setSelectedMove,
        makeSelectedMove,
        undoLastMove,
        resetToPosition,
        navigateForward,
        navigateBackward,
        navigateToPosition,
    };
};
