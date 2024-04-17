from fastapi import FastAPI, Query
from chess_utils import get_nodes, get_edges
import chess

app = FastAPI()

@app.get("/adjacencies/{input_string:path}")
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

@app.get("/links/{input_string:path}")
async def get_links(fen_string: str = Query(..., description="The FEN string representing the board state")):
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}

    nodes = get_nodes(board)
    edges = get_edges(board)

    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
