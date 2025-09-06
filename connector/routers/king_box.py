import chess
from fastapi import APIRouter, Query
from typing import List, Dict

router = APIRouter()

def convert_king_box_to_graph(board: chess.Board) -> Dict:
    """
    Convert king box data into nodes and edges format similar to links endpoint.
    Creates edges from each king to its possible/blocked squares.
    """
    nodes = []
    edges = []
    phantom_squares = set()  # Track phantom nodes we need to create
    
    # Get all pieces on board as nodes
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            nodes.append({
                "square": chess.square_name(square),
                "piece_type": piece.symbol(),
                "color": "white" if piece.color else "black"
            })
    
    # Process both kings
    for color in [chess.WHITE, chess.BLACK]:
        king_data = get_king_box_data(board, color)
        king_square = king_data["king_square"]
        
        for square_info in king_data["squares"]:
            if square_info["status"] != "off-board" and square_info["square"] != king_square:
                # Create edges for all valid squares around the king
                if square_info["status"] == "open":
                    # This is where the king CAN move
                    edge_type = "king_can_move"
                    edges.append({
                        "type": edge_type,
                        "source": king_square,
                        "target": square_info["square"]
                    })
                    # If the square is empty (no piece), add it as a phantom node
                    if "piece_type" not in square_info:
                        phantom_squares.add(square_info["square"])
                elif square_info["status"] == "blocked-by-ally":
                    edge_type = "king_blocked_ally"
                elif square_info["status"] == "blocked-by-threat":
                    edge_type = "king_blocked_threat"
                else:
                    edge_type = f"king_{square_info['status']}"
                
                if square_info["status"] != "open":  # Only add non-open edges (open is handled above)
                    edges.append({
                        "type": edge_type,
                        "source": king_square,
                        "target": square_info["square"]
                    })
    
    # Add phantom nodes for empty squares the king can move to
    for square in phantom_squares:
        nodes.append({
            "square": square,
            "piece_type": "phantom",  # Special marker for empty squares
            "color": "phantom"
        })
    
    return {"nodes": nodes, "edges": edges}

def get_king_box_data(board: chess.Board, color: chess.Color) -> Dict:
    """
    Get the status of all 9 squares around the king (including the king's current square).
    
    Returns a dictionary with:
    - king_square: The king's current square
    - king_color: The king's color
    - squares: List of 9 squares with their status
    
    Status can be:
    - 'open': Square is empty and safe for the king
    - 'blocked-by-ally': Square contains an ally piece
    - 'blocked-by-threat': Square is under attack or contains an enemy piece
    - 'off-board': Square is outside the board boundaries
    """
    # Find the king
    king_square = board.king(color)
    if king_square is None:
        return {"error": "No king found for the specified color"}
    
    king_file = chess.square_file(king_square)
    king_rank = chess.square_rank(king_square)
    
    # Define relative positions for the 9 squares (including center)
    # Order: top-left, top, top-right, left, center, right, bottom-left, bottom, bottom-right
    relative_positions = [
        (-1, 1), (0, 1), (1, 1),    # top row
        (-1, 0), (0, 0), (1, 0),     # middle row
        (-1, -1), (0, -1), (1, -1)   # bottom row
    ]
    
    squares = []
    
    for file_offset, rank_offset in relative_positions:
        new_file = king_file + file_offset
        new_rank = king_rank + rank_offset
        
        # Check if square is off-board
        if new_file < 0 or new_file > 7 or new_rank < 0 or new_rank > 7:
            squares.append({
                "square": f"off-board ({file_offset},{rank_offset})",
                "status": "off-board"
            })
            continue
        
        square = chess.square(new_file, new_rank)
        square_name = chess.square_name(square)
        piece = board.piece_at(square)
        
        # Check the status of the square
        if square == king_square:
            # King's current position
            if board.is_attacked_by(not color, square):
                status = "blocked-by-threat"  # King is in check
            else:
                status = "open"  # King is safe in current position
        elif piece:
            # Square contains a piece
            if piece.color == color:
                status = "blocked-by-ally"
            else:
                # Enemy piece - always blocked by threat
                status = "blocked-by-threat"
        else:
            # Square is empty - check if it's safe for the king
            # Temporarily move the king to check if the square would be safe
            # We need to check if moving there would put the king in check
            temp_board = board.copy()
            
            # Create a move from king's current position to the target square
            move = chess.Move(king_square, square)
            
            # Check if the move is legal (which includes not moving into check)
            if move in temp_board.legal_moves:
                status = "open"
            else:
                # Either the move is blocked or would put king in check
                if temp_board.is_attacked_by(not color, square):
                    status = "blocked-by-threat"
                else:
                    # This shouldn't happen for adjacent squares, but just in case
                    status = "blocked-by-threat"
        
        square_info = {
            "square": square_name,
            "status": status
        }
        
        # Add piece information if there's a piece on the square
        if piece:
            square_info["piece_type"] = piece.symbol()
            square_info["color"] = "white" if piece.color else "black"
        
        squares.append(square_info)
    
    return {
        "king_square": chess.square_name(king_square),
        "king_color": "white" if color else "black",
        "squares": squares
    }


@router.get("/king_box/")
async def get_king_box_endpoint(
    fen_string: str = Query(..., description="The FEN string representing the board state")
):
    """
    Get the movement constraints for king(s), showing which of the 9 squares 
    (including its current position) are available, blocked, or threatened.
    """
    try:
        board = chess.Board(fen_string)
    except ValueError:
        return {"error": "Invalid FEN string"}
    
    # Return nodes and edges format like links endpoint
    return convert_king_box_to_graph(board)