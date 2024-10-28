import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface HistoryEntry {
    ply: number;
    san: string;
    uci: string;
    fen: string;
}

const HistoryTable = () => {
    const { fen, history } = useSelector((state: RootState) => state.chessGame);
    const [entries, setEntries] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        if (entries.length === 0) {
            setEntries([
                {
                    ply: 0,
                    san: "Initial position",
                    uci: "-",
                    fen: fen,
                },
            ]);
        } else if (history.length > entries.length - 1) {
            setEntries((prevEntries) => [
                ...prevEntries,
                {
                    ply: entries.length,
                    san: history[entries.length - 1],
                    uci: "UCI",
                    fen: fen,
                },
            ]);
        }
    }, [fen, history.length]);

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
                    {entries.map((entry) => (
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
