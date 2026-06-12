import chess
from fastapi import APIRouter, Query
from typing import List
from utils import get_nodes, get_edges

# Import functions from other routers
from .king_box import convert_king_box_to_graph, get_king_box_data
from .adjacencies import router as adj_router  # We'll extract its logic
from .shadows import router as shadows_router  # We'll extract its logic

router = APIRouter()


def get_adjacency_edges(board: chess.Board) -> List[dict]:
    """Extract adjacency edge generation logic."""
    edges = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
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
                            edges.append(
                                {
                                    "type": "adjacency",
                                    "source": chess.square_name(square),
                                    "target": chess.square_name(adjacent_square),
                                }
                            )
    return edges


def get_shadow_edges(board: chess.Board) -> List[dict]:
    """Extract shadow edge generation logic."""
    shadows = []

    # Direction vectors for sliding pieces
    rook_directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    bishop_directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    queen_directions = rook_directions + bishop_directions

    def get_pieces_along_ray(board, start_square, direction):
        """Find all pieces along a ray from start_square in given direction."""
        pieces = []
        file, rank = chess.square_file(start_square), chess.square_rank(start_square)
        d_file, d_rank = direction

        file += d_file
        rank += d_rank

        while 0 <= file <= 7 and 0 <= rank <= 7:
            square = chess.square(file, rank)
            piece = board.piece_at(square)
            if piece:
                pieces.append((square, piece))
            file += d_file
            rank += d_rank

        return pieces

    # Check each square for sliding pieces
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece is None:
            continue

        # Determine directions based on piece type
        if piece.piece_type == chess.QUEEN:
            directions = queen_directions
        elif piece.piece_type == chess.ROOK:
            directions = rook_directions
        elif piece.piece_type == chess.BISHOP:
            directions = bishop_directions
        else:
            continue  # Skip kings, knights, and pawns

        # For each direction, find shadow connections
        for direction in directions:
            pieces_in_ray = get_pieces_along_ray(board, square, direction)

            # Need at least 2 pieces in the ray for a shadow connection
            if len(pieces_in_ray) >= 2:
                blocker_square, blocker_piece = pieces_in_ray[0]
                target_square, target_piece = pieces_in_ray[1]

                # Caster edge: sliding piece → blocker
                caster_type = (
                    "caster_protection"
                    if piece.color == blocker_piece.color
                    else "caster_threat"
                )
                shadows.append(
                    {
                        "source": chess.square_name(square),
                        "target": chess.square_name(blocker_square),
                        "type": caster_type,
                    }
                )

                # Shadow edge: blocker → target (represents what would happen if blocker vanished)
                shadow_type = (
                    "shadow_protection"
                    if piece.color == target_piece.color
                    else "shadow_threat"
                )
                shadows.append(
                    {
                        "source": chess.square_name(blocker_square),
                        "target": chess.square_name(target_square),
                        "type": shadow_type,
                    }
                )

    return shadows


def get_king_box_edges(board: chess.Board) -> tuple[List[dict], List[dict]]:
    """
    Extract king box edge generation logic.
    Returns (edges, phantom_nodes) where phantom_nodes are empty squares king can move to.
    """
    result = convert_king_box_to_graph(board, heatmap=False)
    # Filter out just the edges and phantom nodes
    edges = result["edges"]
    phantom_nodes = [n for n in result["nodes"] if n.get("piece_type") == "phantom"]
    return edges, phantom_nodes


@router.get("/connections/")
async def get_connections(
    fen_string: str = Query(
        ..., description="The FEN string representing the board state"
    ),
    layers: str = Query(
        "all",
        description="Comma-separated layer names (adjacencies,links,king_box,shadows), 'all', or 'none'",
    ),
    heatmap: bool = Query(
        False, description="Include heatmap data (attack counts per square)"
    ),
):
    """
    Unified endpoint that returns nodes and edges for multiple visualization layers.

    Edges are distinguished by their 'type' field:
    - 'adjacency': Physical adjacency between pieces
    - 'threat': Attack relationships
    - 'protection': Defense relationships
    - 'king_can_move', 'king_blocked_ally', 'king_blocked_threat': King movement constraints
    - 'caster_threat', 'caster_protection': Direct ray relationships
    - 'shadow_threat', 'shadow_protection': X-ray/pin relationships

    This allows clients to filter edges by type for different visualization layers
    without making multiple API calls or duplicating node data.
    
    Use layers='none' to get only nodes with no edges (equivalent to /none endpoint).
    """
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}

    # Parse requested layers
    if layers == "all":
        requested_layers = {"adjacencies", "links", "king_box", "shadows"}
    elif layers == "none" or not layers.strip():
        requested_layers = set()
    else:
        requested_layers = set(layer.strip() for layer in layers.split(","))

    # Start with base nodes
    nodes = get_nodes(board, heatmap=heatmap)
    edges = []

    # Collect edges from each requested layer
    if "adjacencies" in requested_layers:
        edges.extend(get_adjacency_edges(board))

    if "links" in requested_layers:
        # Links provides threat/protection edges
        edges.extend(get_edges(board))

    if "king_box" in requested_layers:
        king_box_edges, phantom_nodes = get_king_box_edges(board)
        edges.extend(king_box_edges)
        # Add phantom nodes to the main nodes list
        nodes.extend(phantom_nodes)

    if "shadows" in requested_layers:
        edges.extend(get_shadow_edges(board))

    return {"nodes": nodes, "edges": edges}
