import chess
import networkx as nx
from typing import List, Dict


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


def build_acyclic_graph(edges: List[Dict[str, str]]) -> nx.DiGraph:
    """
    Build an acyclic directed graph by adding edges iteratively and skipping edges that would create a cycle.
    accepts edge data as a list of dictionaries with 'source' and 'target' keys
    returns an acyclic directed graph
    """
    # initialize empty directed graph
    DG = nx.DiGraph()
    # iterate through edge data
    for edge in edges:
        # add edge
        DG.add_edge(edge['source'], edge['target'])
        # check if the graph is acyclic
        if not nx.is_directed_acyclic_graph(DG):
            # if not, remove the edge
            DG.remove_edge(edge['source'], edge['target'])
    # return the graph
    return DG


