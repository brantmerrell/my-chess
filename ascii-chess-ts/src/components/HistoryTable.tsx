import "./HistoryTable.css";
import React, { useEffect, useRef } from "react";
import { PieceDisplayMode } from "../types/chess";
import { Position } from "../types/chess";
import { RootState } from "../app/store";
import { useMoveHistory } from "../hooks/useMoveHistory";
import { useSelector } from "react-redux";

interface HistoryTableProps {
    displayMode: PieceDisplayMode;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ displayMode }) => {
    const { positions } = useMoveHistory(displayMode);
    const currentPositionIndex = useSelector((state: RootState) => state.chessGame.currentPositionIndex);
    
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const currentRowRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        if (currentRowRef.current && tableWrapperRef.current) {
            const wrapper = tableWrapperRef.current;
            const currentRow = currentRowRef.current;
            
            const wrapperHeight = wrapper.clientHeight;
            const rowTop = currentRow.offsetTop;
            const rowHeight = currentRow.offsetHeight;
            
            const centerPosition = rowTop - (wrapperHeight / 2) + (rowHeight / 2);
            
            wrapper.scrollTo({
                top: Math.max(0, centerPosition),
                behavior: 'smooth'
            });
        }
    }, [currentPositionIndex]);

    return (
        <div className="history-table-container">
            <div className="history-table-header">
                <h3>Move History</h3>
                <div className="position-info">
                    Position {currentPositionIndex + 1} of {positions.length}
                </div>
            </div>
            <div className="history-table-wrapper" ref={tableWrapperRef}>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Ply</th>
                            <th>SAN</th>
                            <th>UCI</th>
                            <th>FEN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((entry: Position) => (
                            <tr 
                                key={entry.ply} 
                                ref={entry.ply === currentPositionIndex ? currentRowRef : null}
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

