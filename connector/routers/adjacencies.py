import chess
from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/adjacencies/{input_string:path}")
async def get_adjacencies(fen_string: str = Query(..., description="The FEN string representing the board state")):
    board = chess.Board(fen_string)
    adjacencies = {}
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            attacks = board.attacks_mask(square)
            attacked_squares = chess.scan_reversed(attacks)
            adjacencies[chess.SQUARE_NAMES[square]] = [chess.SQUARE_NAMES[sq] for sq in attacked_squares]
    return adjacencies

