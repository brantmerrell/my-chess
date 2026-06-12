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

    def fetch_adjacencies(self, fen_string: str) -> Dict[str, Any]:
        """
        Fetch position data with adjacency relationships.

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and 'edges'

        Raises:
            requests.HTTPError: If the API request fails
        """
        url = f"{self.base_url}/adjacencies"
        response = requests.get(url, params={"fen_string": fen_string})
        response.raise_for_status()
        return response.json()

    def fetch_links(self, fen_string: str) -> Dict[str, Any]:
        """
        Fetch position data with legal move links.

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and 'edges'
        """
        url = f"{self.base_url}/links"
        response = requests.get(url, params={"fen_string": fen_string})
        response.raise_for_status()
        return response.json()

    def fetch_none(self, fen_string: str) -> Dict[str, Any]:
        """
        Fetch position data with no connections (nodes only).

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and empty 'edges'
        """
        url = f"{self.base_url}/none"
        response = requests.get(url, params={"fen_string": fen_string})
        response.raise_for_status()
        return response.json()

    def fetch_king_box(self, fen_string: str) -> Dict[str, Any]:
        """
        Fetch position data with king safety box (attack/defense zones).

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and 'edges' showing king box boundaries
        """
        url = f"{self.base_url}/king_box"
        response = requests.get(url, params={"fen_string": fen_string})
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

    def fetch_shadows(self, fen_string: str) -> Dict[str, Any]:
        """
        Fetch position data with king safety box relationships.

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and 'edges'
        """
        url = f"{self.base_url}/shadows"
        response = requests.get(url, params={"fen_string": fen_string})
        response.raise_for_status()
        return response.json()
