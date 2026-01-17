import chess
from fastapi import APIRouter, Query
from utils import get_nodes

router = APIRouter()


@router.get("/shadows/{input_string:path}")
async def get_shadows(
    fen_string: str = Query(
        ..., description="The FEN string representing the board state"
    )
):
    """
    A shadow connection is defined as what connection would occur if a piece were to become absent. For example, given FEN string '2q1k3/3n1pp1/2N4p/3p4/Q2Pn3/5N1P/5PPK/8 b - - 9 31', the Q on a4 currently protects the pawn on d4. If the pawn on d4 vanished, the queen would threaten the n on e4. So there is a shadow connection from a4 to e4. This is the visualization for:
    * revealed attack
    * clearance sacrifice
    * discovered attack
    * discovered check
    * pin
    * skewer
    * windmill
    * X-ray attack (sort of)
    Kings, pawns, and knights cannot cast a shadow, so the algorithm can focus on shadows cast by queens, rooks, and bishops.
    """
    board = chess.Board(fen_string)
    shadows = []

    # Direction vectors for sliding pieces
    rook_directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]  # ranks and files
    bishop_directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]  # diagonals
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
                caster_type = "caster_protection" if piece.color == blocker_piece.color else "caster_threat"
                shadows.append({
                    "source": chess.square_name(square),
                    "target": chess.square_name(blocker_square),
                    "type": caster_type,
                })

                # Shadow edge: blocker → target (represents what would happen if blocker vanished)
                shadow_type = "shadow_protection" if piece.color == target_piece.color else "shadow_threat"
                shadows.append({
                    "source": chess.square_name(blocker_square),
                    "target": chess.square_name(target_square),
                    "type": shadow_type,
                })

    nodes = get_nodes(board)
    return {"nodes": nodes, "edges": shadows}
