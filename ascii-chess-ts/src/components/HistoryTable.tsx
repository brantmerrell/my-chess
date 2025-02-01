import React from "react";
import { PieceDisplayMode } from "../types/chess";
import { useMoveHistory } from "../hooks/useMoveHistory";
import { Position } from "../types/chess";

interface HistoryTableProps {
    displayMode: PieceDisplayMode;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ displayMode }) => {
    const { positions } = useMoveHistory(displayMode);

    return (
        <div className="bg-light">
            <table>
                <thead>
                    <tr>
                        <th className="p-2 border-b text-info">Ply</th>
                        <th className="p-2 border-b text-info">
                            SAN
                        </th>
                        <th className="p-2 border-b text-info">
                            UCI
                        </th>
                        <th className="p-2 border-b text-info">
                            FEN
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map((entry: Position) => (
                        <tr key={entry.ply} className="hover:bg-gray-700">
                            <td className="p-2 border-b text-info">
                                {entry.ply}
                            </td>
                            <td className="p-2 border-b text-info">
                                {entry.san}
                            </td>
                            <td className="p-2 border-b text-info">
                                {entry.uci}
                            </td>
                            <td className="p-2 border-b text-info font-mono text-sm">
                                {entry.fen}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
