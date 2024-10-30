import chess

def get_legal_moves_san(fen):
    board = chess.Board(fen)
    legal_moves = list(board.legal_moves)
    san_moves = [board.san(move) for move in legal_moves]
    return san_moves

def get_move_history_san(move_history):
    """Converts a list of UCI moves into a list of SAN moves.

    Args:
        move_history: A list of strings representing moves in UCI notation,
                      or a list of chess.Move objects.

    Returns:
        A list of strings representing the moves in SAN notation.
    """
    tracking_board = chess.Board()
    san_moves = []
    for move in move_history:
        if isinstance(move, str):
            move = chess.Move.from_uci(move)
        elif not isinstance(move, chess.Move):
            raise ValueError("Invalid move type. Moves must be UCI strings or chess.Move objects.")
        san_move = tracking_board.san(move)
        san_moves.append(san_move)
        tracking_board.push(move)
    return san_moves

def get_edges(board):
    edges = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            attackers = board.attackers(not piece.color, square)
            defenders = board.attackers(piece.color, square)

            for attacker_square in attackers:
                edges.append({
                    "type": "threat",
                    "source": chess.square_name(attacker_square),
                    "target": chess.square_name(square)
                })

            for defender_square in defenders:
                edges.append({
                    "type": "protection",
                    "source": chess.square_name(defender_square),
                    "target": chess.square_name(square)
                })
    return edges


def get_nodes(board):
    nodes = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            nodes.append({
                "square": chess.square_name(square),
                "piece_type": piece.symbol(),
                "color": "white" if piece.color else "black"
            })
    return nodes

