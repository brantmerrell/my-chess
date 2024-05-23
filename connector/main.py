import chess
import subprocess
from fastapi import FastAPI, Query, Request, Response
from chess_utils import get_nodes, get_edges
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

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

@app.put("/graphdag")
async def generate_graphdag(request: Request):
    data = await request.json()
    edges = data["edges"]
    filtered_edges = []
    edges_seen = set()
    for edge in edges:
        source = edge['source']
        target = edge['target']
        edge_tuple = (source, target)
        inverse_edge_tuple = (target, source)
        if inverse_edge_tuple not in edges_seen:
            filtered_edges.append(edge)
            edges_seen.add(edge_tuple)
    formatted_edges = [f"{edge['source']}->{edge['target']}" for edge in filtered_edges]
    input_for_diagon = "\n".join(formatted_edges)
    command = ["diagon", "GraphDAG"]
    process = subprocess.Popen(command,
                               stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               text=True)
    stdout, stderr = process.communicate(input=input_for_diagon)
    if process.returncode != 0:
        return {"error": "Error executing command", "stderr": stderr}
    else:
        return {"ascii_art": stdout}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
