"""Service layer for connector API communication"""

import requests
from typing import Dict, Any


class ConnectorService:
    """Communicate with the chess connector API."""

    def __init__(self, base_url: str = "http://localhost:8000"): # just use .env CONNECTOR_URL
        """
        Initialize connector service.

        Args:
            base_url: Base URL for the connector API (no trailing slash)
        """
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
        Fetch position data with king safety box relationships.

        Args:
            fen_string: FEN notation of the chess position

        Returns:
            Dict containing 'nodes' and 'edges'
        """
        url = f"{self.base_url}/king_box"
        response = requests.get(url, params={"fen_string": fen_string})
        response.raise_for_status()
        return response.json()
