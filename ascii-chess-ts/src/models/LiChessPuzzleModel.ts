export interface LiChessPuzzleModel {
    puzzleId: string;
    gameId: string;
    puzzleRating: string;
    puzzlePlays: number;
    solution: string[];
    themes: string[];
    initialPuzzleFEN: string;
}
