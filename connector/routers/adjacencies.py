import chess
from fastapi import APIRouter, Query
from utils import get_nodes

router = APIRouter()

@router.get("/adjacencies/{input_string:path}")
async def get_adjacencies(fen_string: str = Query(..., description="The FEN string representing the board state")):
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}

    nodes = get_nodes(board)
    
    edges = []
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
                    adjacent_file = current_file + file_offset
                    if 0 <= adjacent_rank <= 7 and 0 <= adjacent_file <= 7:
                        adjacent_square = chess.square(adjacent_file, adjacent_rank)
                        adjacent_piece = board.piece_at(adjacent_square)
                        if adjacent_piece:  # Only include if there's a piece there
                            edges.append({
                                "type": "adjacency",
                                "source": chess.square_name(square),
                                "target": chess.square_name(adjacent_square)
                            })

    return {"nodes": nodes, "edges": edges}

