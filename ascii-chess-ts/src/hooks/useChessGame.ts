import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { initialFen } from "../constants/env";
import { ChessComPuzzleModel } from "../models/ChessComPuzzleModel";
import { LiChessPuzzleModel } from "../models/LiChessPuzzleModel";
import { SetupOptions } from "../models/SetupOptions";
import { PieceDisplayMode } from "../types/chess";
import { Position } from "../types/chess";
import { useMoveHistory } from "./useMoveHistory";

export const useChessGame = (displayMode: PieceDisplayMode) => {
    const [localFen, setLocalFen] = useState(initialFen);
    const [pendingSetupHistory, setPendingSetupHistory] = useState<Position[] | undefined>(undefined);
    const chessComPuzzle = useSelector<RootState, ChessComPuzzleModel | null>(
        (state) => state.chessComPuzzle
    );
    const selectedSetup = useSelector<RootState, string>(
        (state) => state.selectedSetup
    );
    const liChessPuzzle = useSelector<RootState, LiChessPuzzleModel | null>(
        (state) => state.liChessPuzzle
    );

    const {
        currentPosition,
        errorMessage,
        undoMessage,
        makeSelectedMove,
        undoLastMove,
        resetToPosition
    } = useMoveHistory(displayMode);

    useEffect(() => {
        let newFen = initialFen;
        let newSetupHistory;
        switch (selectedSetup) {
            case SetupOptions.LICHESS_DAILY_PUZZLE:
                if (liChessPuzzle?.initialPuzzleFEN) {
                    newFen = liChessPuzzle.initialPuzzleFEN;
                    newSetupHistory = liChessPuzzle.setupHistory;
                }
                break;
            case SetupOptions.CHESS_COM_DAILY_PUZZLE:
                if (chessComPuzzle?.initialPuzzleFEN) {
                    newFen = chessComPuzzle.initialPuzzleFEN;
                }
                break;
        }
        setLocalFen(newFen);
        setPendingSetupHistory(newSetupHistory);
    }, [selectedSetup, liChessPuzzle, chessComPuzzle]);

    const submitFen = () => {
        try {
            resetToPosition(localFen, pendingSetupHistory);
        } catch (error) {
            console.error("Invalid FEN position");
        }
    };

    return {
        fen: localFen,
        setFen: setLocalFen,
        currentPosition,
        errorMessage,
        undoMessage,
        submitFen,
        submitMove: makeSelectedMove,
        submitUndoMove: undoLastMove,
    };
};



