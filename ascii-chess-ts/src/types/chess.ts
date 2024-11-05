export interface Position {
    ply: number;
    san: string;
    uci: string;
    fen: string;
}

export type PieceDisplayMode = 'letters' | 'symbols' | 'masked';

export const PIECE_SYMBOLS = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟︎'
};
