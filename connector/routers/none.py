import chess
from fastapi import APIRouter, Query
from utils import get_nodes

router = APIRouter()


@router.get("/none/{input_string:path}")
async def get_none(
    fen_string: str = Query(
        ..., description="The FEN string representing the board state"
    ),
    heatmap: bool = Query(
        False, description="Include heatmap data (attack counts per square)"
    ),
):
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}

    nodes = get_nodes(board, heatmap=heatmap)
    edges = []

    return {"nodes": nodes, "edges": edges}