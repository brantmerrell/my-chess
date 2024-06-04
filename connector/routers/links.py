import chess
from fastapi import APIRouter, Query
from utils import get_nodes, get_edges

router = APIRouter()

@router.get("/links/{input_string:path}")
async def get_links(fen_string: str = Query(..., description="The FEN string representing the board state")):
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}

    nodes = get_nodes(board)
    edges = get_edges(board)

    return {"nodes": nodes, "edges": edges}

