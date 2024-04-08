export interface ChessComPuzzleModel {
    puzzleTitle: string;
    puzzleUrl: string;
    publishTime: string;
    initialPuzzleFEN: string;
    solutionPgn: string[];
    imageUrl: string;
    fetchStatus: {
        loading: boolean;
        error: string | null | undefined;
    };
}
