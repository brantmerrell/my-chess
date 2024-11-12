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
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="p-2 text-left border-b border-gray-700">
                            Ply
                        </th>
                        <th className="p-2 text-left border-b border-gray-700">
                            SAN
                        </th>
                        <th className="p-2 text-left border-b border-gray-700">
                            UCI
                        </th>
                        <th className="p-2 text-left border-b border-gray-700">
                            FEN
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map((entry: Position) => (
                        <tr key={entry.ply} className="hover:bg-gray-700">
                            <td className="p-2 border-b border-gray-700">
                                {entry.ply}
                            </td>
                            <td className="p-2 border-b border-gray-700">
                                {entry.san}
                            </td>
                            <td className="p-2 border-b border-gray-700">
                                {entry.uci}
                            </td>
                            <td className="p-2 border-b border-gray-700 font-mono text-sm">
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
