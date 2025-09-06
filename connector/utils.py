import chess
import networkx as nx
import matplotlib.pyplot as plt
from typing import List, Dict, Union
from matplotlib.figure import Figure


def get_nodes(board):
    nodes = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            nodes.append(
                {
                    "square": chess.square_name(square),
                    "piece_type": piece.symbol(),
                    "color": "white" if piece.color else "black",
                }
            )
    return nodes


def get_edges(board):
    edges = []
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            attackers = board.attackers(not piece.color, square)
            defenders = board.attackers(piece.color, square)

            for attacker_square in attackers:
                edges.append(
                    {
                        "type": "threat",
                        "source": chess.square_name(attacker_square),
                        "target": chess.square_name(square),
                    }
                )

            for defender_square in defenders:
                edges.append(
                    {
                        "type": "protection",
                        "source": chess.square_name(defender_square),
                        "target": chess.square_name(square),
                    }
                )
    return edges


def build_acyclic_graph(edges: List[Dict[str, str]]) -> nx.DiGraph:
    """
    Build an acyclic directed graph by adding edges iteratively and skipping edges that would create a cycle.
    accepts edge data as a list of dictionaries with 'source' and 'target' keys
    returns an acyclic directed graph
    """
    DG = nx.DiGraph()
    for edge in edges:
        DG.add_edge(edge["source"], edge["target"])
        if not nx.is_directed_acyclic_graph(DG):
            DG.remove_edge(edge["source"], edge["target"])
    return DG


def visualize_graph(
    edges: List[Dict[str, str]], is_directed: bool = True, output: str = "str"
) -> Union[str, Figure]:
    """
    Visualize a graph in text form
    Accepts as arguments:
    - edges as a list of dictionaries with 'source' and 'target' keys
    - is_directed as a boolean indicating whether the graph is directed
    - output as a string 'str' or 'Figure'
    returns a string representation of the graph
    """
    if is_directed:
        G = nx.DiGraph()
    else:
        G = nx.Graph()
    for edge in edges:
        G.add_edge(edge["source"], edge["target"])
    if output == "str":
        text_graph_lines = nx.readwrite.text.generate_network_text(G)
        text_graph = "\n".join(text_graph_lines)
        return text_graph
    elif output == "Figure":
        fig = plt.figure()
        nx.draw(G, with_labels=True)
        return plt
