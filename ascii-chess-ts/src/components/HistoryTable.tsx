import React from "react";
import "./HistoryTable.css"
import { PieceDisplayMode } from "../types/chess";
import { useMoveHistory } from "../hooks/useMoveHistory";
import { Position } from "../types/chess";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface HistoryTableProps {
    displayMode: PieceDisplayMode;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ displayMode }) => {
    const { positions } = useMoveHistory(displayMode);
    const currentPositionIndex = useSelector((state: RootState) => state.chessGame.currentPositionIndex);

    return (
        <div className="history-table-container">
            <div className="history-table-header">
                <h3>Move History</h3>
            </div>
            <div className="history-table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Ply</th>
                            <th>Move</th>
                            <th>UCI</th>
                            <th>FEN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((entry: Position) => (
                            <tr 
                                key={entry.ply} 
                                className={`history-row ${entry.ply === currentPositionIndex ? 'current-position' : ''}`}
                            >
                                <td className="ply-cell">{entry.ply}</td>
                                <td className="move-cell">{entry.san}</td>
                                <td className="uci-cell">{entry.uci}</td>
                                <td className="fen-cell">{entry.fen}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;


