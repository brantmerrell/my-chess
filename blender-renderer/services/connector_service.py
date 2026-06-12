"""Service layer for connector API communication"""

import os
import requests
from typing import Dict, Any


class ConnectorService:
    """Communicate with the chess connector API."""

    def __init__(self, base_url: str = None):
        """
        Initialize connector service.

        Args:
            base_url: Base URL for the connector API (no trailing slash).
                      If None, reads from CONNECTOR_URL environment variable.
                      Defaults to http://localhost:8000 if not set.
        """
        if base_url is None:
            base_url = os.getenv("CONNECTOR_URL", "http://localhost:8000")
        self.base_url = base_url.rstrip("/")

    def fetch_connections(self, fen_string: str, layers: str = "all") -> Dict[str, Any]:
        """
        Fetch position data with all requested layer types in a single call.

        This unified endpoint returns nodes once (no duplication) and edges
        distinguished by their 'type' field (adjacency, threat, protection,
        king_can_move, shadow_threat, etc).

        Args:
            fen_string: FEN notation of the chess position
            layers: Comma-separated layer names or 'all' (default)
                   e.g., "adjacencies,links,king_box,shadows"

        Returns:
            Dict containing 'nodes' and 'edges' where edges have 'type' field
        """
        url = f"{self.base_url}/connections"
        response = requests.get(
            url, params={"fen_string": fen_string, "layers": layers}
        )
        response.raise_for_status()
        return response.json()

    def fetch_diff(self, from_fen: str, to_fen: str) -> list:
        """
        Diff two FEN positions and return a list of moved pieces.

        Args:
            from_fen: FEN string before the move
            to_fen: FEN string after the move

        Returns:
            List of dicts with 'from_square' and 'to_square' keys
        """
        url = f"{self.base_url}/diff"
        response = requests.get(url, params={"from_fen": from_fen, "to_fen": to_fen})
        response.raise_for_status()
        return response.json().get("moves", [])
