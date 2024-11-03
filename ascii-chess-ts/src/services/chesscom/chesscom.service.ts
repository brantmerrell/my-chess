import defaultChessComPuzzle from "../../data/chessComPuzzle.json";
export const getChessComDailyPuzzle = async () => {
    try {
        const response = await fetch("https://api.chess.com/pub/puzzle");
        if (!response.ok) {
            throw new Error("Chess.com API request failed");
        }
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};
