import defaultLiChessPuzzle from '../../data/liChessPuzzle.json';

export const getLiChessDailyPuzzle = async () => {
    try {
        const response = await fetch('https://lichess.org/api/puzzle/daily');

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('LiChess API request failed');
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        return defaultLiChessPuzzle;
    }
};
