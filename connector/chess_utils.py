import chess


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


def get_edges(board):
    edges = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            # Determine attackers and defenders for occupied squares only
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

