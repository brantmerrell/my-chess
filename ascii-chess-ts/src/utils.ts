export function findIndexWithinRank(rankString: string, square: string): number {
    const fileLetter = square[0].toLowerCase();
    const targetFileNumber = fileLetter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

    let stringIndex = 0;
    let boardIndex = 0;
    const chars = rankString.split('');

    for (const char of chars) {
        stringIndex++;

        if (/[1-8]/.test(char)) {
            const spaces = parseInt(char);
            if (boardIndex + spaces >= targetFileNumber) {
                return stringIndex;
            }
            boardIndex += spaces;
        } else {
            boardIndex++;
            if (targetFileNumber === boardIndex) {
                return stringIndex;
            }
        }
    }
    return -1;
}

export function findIndexOfRank(fen: string, square: string): number {
    const rank = parseInt(square[1]);

    // eighth rank always starts at index 0
    if (rank === 8) {
        return 0;
    }

    // Split FEN into its components and get position field
    const position = fen.split(' ')[0];

    // Split position into ranks
    const ranks = position.split('/');

    // Get ranks up to but not including target rank
    const leftRanks = ranks.slice(0, 8 - rank);

    // Return sum of rank lengths plus number of separators
    return leftRanks.reduce((sum, rank) => sum + rank.length, 0) + leftRanks.length;
}

export function findIndexOfSquare(fen: string, square: string): number {
    const rankIndex = findIndexOfRank(fen, square);
    const rank = parseInt(square[1]);
    const position = fen.split(' ')[0];
    const ranks = position.split('/');
    const rankString = ranks[8 - rank];
    const fileIndex = findIndexWithinRank(rankString, square);

    return rankIndex + fileIndex;
}

