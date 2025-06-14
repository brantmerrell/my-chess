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
            adjacent_squares = []
            current_rank = chess.square_rank(square)
            current_file = chess.square_file(square)
            for rank_offset in [-1, 0, 1]:
                for file_offset in [-1, 0, 1]:
                    if (rank_offset, file_offset) == (0, 0):
                        continue
                    adjacent_rank = current_rank + rank_offset
                    adjacent_file = current_file + rank_offset
                    if 0 <= adjacent_rank <= 7 and 0 <= adjacent_file <= 7:
                        adjacent_square = chess.square(adjacent_file, adjacent_rank)
                        adjacent_squares.append(chess.SQUARE_NAMES[adjacent_square])
            adjacencies[chess.SQUARE_NAMES[square]] = adjacent_squares
    return adjacencies
