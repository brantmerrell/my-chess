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

    const formatSanNotation = (fen: string, san: string, prevFen: string | null): string => {
        if (san === "-") return "-";
        
        const [, activeColor, , , , fullmoveStr] = fen.split(" ");
        const fullmove = parseInt(fullmoveStr);
        
        if (!prevFen) return "0.";
        
        const [, prevActiveColor] = prevFen.split(" ");
        
        const moveColor = prevActiveColor === "w" ? "white" : "black";
        
        let moveNumber = fullmove;
        if (activeColor === "w") {
            moveNumber = moveNumber - 1;
        }
        
        if (moveColor === "white") {
            return `${moveNumber}.${san}`;
        } else {
            return `${moveNumber}...${san}`;
        }
    };

    useEffect(() => {
        if (entries.length === 0) {
            setEntries([{
                ply: 0,
                san: "-",
                uci: "-",
                fen: fen,
            }]);
        } else if (history.length > entries.length - 1) {
            const prevEntry = entries[entries.length - 1];
            const newEntry = {
                ply: entries.length,
                san: formatSanNotation(fen, history[entries.length - 1], prevEntry.fen),
                uci: "-",
                fen: fen,
            };
            setEntries(prevEntries => [...prevEntries, newEntry]);
        }
    }, [fen, history.length, entries]);

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="p-2 text-left border-b border-gray-700">Ply</th>
                        <th className="p-2 text-left border-b border-gray-700">SAN</th>
                        <th className="p-2 text-left border-b border-gray-700">UCI</th>
                        <th className="p-2 text-left border-b border-gray-700">FEN</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.ply} className="hover:bg-gray-700">
                            <td className="p-2 border-b border-gray-700">{entry.ply}</td>
                            <td className="p-2 border-b border-gray-700">{entry.san}</td>
                            <td className="p-2 border-b border-gray-700">{entry.uci}</td>
                            <td className="p-2 border-b border-gray-700 font-mono text-sm">{entry.fen}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
