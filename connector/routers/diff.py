import chess
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/diff")
async def get_diff(
    from_fen: str = Query(
        ..., description="FEN string for the position before the move"
    ),
    to_fen: str = Query(..., description="FEN string for the position after the move"),
):
    """
    Compare two FEN positions and return a list of moves as (from_square, to_square) pairs.

    Handles standard moves, captures, castling (king + rook), and promotions.
    Returns an empty list if either FEN is invalid.
    """
    try:
        from_board = chess.Board(from_fen)
        to_board = chess.Board(to_fen)
    except ValueError as e:
        return {"error": str(e), "moves": []}

    vacated = []  # squares with a piece in from_board but empty in to_board
    arrived = []  # squares with a piece in to_board but empty in from_board
    changed = []  # squares where the piece changed (captures, promotions)

    for sq in chess.SQUARES:
        fp = from_board.piece_at(sq)
        tp = to_board.piece_at(sq)
        if fp and not tp:
            vacated.append((chess.square_name(sq), fp))
        elif tp and not fp:
            arrived.append((chess.square_name(sq), tp))
        elif fp and tp and fp != tp:
            changed.append((chess.square_name(sq), fp, tp))

    moves = []
    arrived_remaining = list(arrived)
    changed_remaining = list(changed)

    for from_sq, fp in vacated:
        # Prefer exact piece type + color match (handles castling correctly)
        matched = next(
            (
                (to_sq, tp)
                for to_sq, tp in arrived_remaining
                if fp.color == tp.color and fp.piece_type == tp.piece_type
            ),
            None,
        )
        if matched:
            to_sq, _ = matched
            moves.append({"from_square": from_sq, "to_square": to_sq})
            arrived_remaining = [(s, p) for s, p in arrived_remaining if s != to_sq]
        else:
            # Promotion: pawn vacates, promoted piece arrives (different piece_type, same color)
            matched_changed = next(
                (
                    (to_sq, fp2, tp2)
                    for to_sq, fp2, tp2 in changed_remaining
                    if fp.color == tp2.color
                ),
                None,
            )
            if matched_changed:
                to_sq, _, _ = matched_changed
                moves.append({"from_square": from_sq, "to_square": to_sq})
                changed_remaining = [
                    (s, a, b) for s, a, b in changed_remaining if s != to_sq
                ]

    return {"moves": moves}
