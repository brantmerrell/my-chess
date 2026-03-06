"""Constants for chess rendering."""

# Ascii pieces
PIECE_SYMBOLS = {
    "K": "♔",
    "Q": "♕",
    "R": "♖",
    "B": "♗",
    "N": "♘",
    "P": "♙",
    "k": "♚",
    "q": "♛",
    "r": "♜",
    "b": "♝",
    "n": "♞",
    "p": "♟",
}

# USD asset paths - base directory
USD_ASSETS_BASE = "/Users/dzt44r/github/usd-wg/assets/full_assets/OpenChessSet/assets"

# USD piece file paths (reference these files to get full geometry + materials)
USD_PIECE_PATHS = {
    "K": f"{USD_ASSETS_BASE}/King/King.usd",
    "Q": f"{USD_ASSETS_BASE}/Queen/Queen.usd",
    "R": f"{USD_ASSETS_BASE}/Rook/Rook.usd",
    "B": f"{USD_ASSETS_BASE}/Bishop/Bishop.usd",
    "N": f"{USD_ASSETS_BASE}/Knight/Knight.usd",
    "P": f"{USD_ASSETS_BASE}/Pawn/Pawn.usd",
}

# USD chessboard path
USD_CHESSBOARD_PATH = f"{USD_ASSETS_BASE}/Chessboard/Chessboard.usd"

# Variant names for Black/White materials
USD_VARIANT_BLACK = "Black"
USD_VARIANT_WHITE = "White"

# USD board scale factor (applied to chessboard during import)
USD_BOARD_SCALE = 12.0

# Board dimensions from USD (in meters, before scaling)
# The board playing surface spans from one corner to the opposite corner
# Based on pawn positions in chess_set.usda: files a-h span -0.21875 to 0.21875
USD_BOARD_HALF_WIDTH = 0.25  # Half the playing surface width in meters
USD_BOARD_PIECE_HEIGHT = 0.02  # Height pieces sit above board surface

# Color definitions with usage metadata
# Structure: name -> {"rgba": (r, g, b, a), "usage": {usage_type: bool, ...}}
# Usage types: "board" (board material), "edges" (connection lines), "asterisks", etc.
COLORS = {
    # Basic colors
    "white": {"rgba": (1.0, 1.0, 1.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "black": {"rgba": (0.0, 0.0, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "red": {"rgba": (1.0, 0.0, 0.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "green": {"rgba": (0.0, 1.0, 0.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "blue": {"rgba": (0.0, 0.0, 1.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "yellow": {"rgba": (1.0, 1.0, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "cyan": {"rgba": (0.0, 1.0, 1.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "magenta": {"rgba": (1.0, 0.0, 1.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    # Extended colors
    "orange": {"rgba": (1.0, 0.647, 0.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "purple": {"rgba": (0.5, 0.0, 0.5, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "pink": {"rgba": (1.0, 0.753, 0.796, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "brown": {"rgba": (0.647, 0.165, 0.165, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "gray": {"rgba": (0.5, 0.5, 0.5, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "grey": {"rgba": (0.5, 0.5, 0.5, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "limegreen": {"rgba": (0.196, 0.804, 0.196, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "forestgreen": {"rgba": (0.133, 0.545, 0.133, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "darkgreen": {"rgba": (0.0, 0.392, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "skyblue": {"rgba": (0.529, 0.808, 0.922, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "dodgerblue": {"rgba": (0.118, 0.565, 1.0, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "navy": {"rgba": (0.0, 0.0, 0.502, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "gold": {"rgba": (1.0, 0.843, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "silver": {"rgba": (0.753, 0.753, 0.753, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "crimson": {"rgba": (0.863, 0.078, 0.235, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "coral": {"rgba": (1.0, 0.498, 0.314, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "turquoise": {"rgba": (0.251, 0.878, 0.816, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "violet": {"rgba": (0.933, 0.51, 0.933, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "indigo": {"rgba": (0.294, 0.0, 0.51, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "teal": {"rgba": (0.0, 0.502, 0.502, 1.0), "usage": {"board": True, "edges": True, "asterisks": True}},
    "olive": {"rgba": (0.502, 0.502, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
    "maroon": {"rgba": (0.502, 0.0, 0.0, 1.0), "usage": {"board": False, "edges": True, "asterisks": True}},
}

# Backwards compatibility: simple name -> RGBA mapping (for existing code)
COLOR_NAMES = {name: data["rgba"] for name, data in COLORS.items()}

# Helper function to get colors by usage type
def get_colors_for_usage(usage_type: str) -> dict:
    """Get colors filtered by usage type (e.g., 'board', 'edges', 'asterisks')."""
    return {name: data["rgba"] for name, data in COLORS.items() if data["usage"].get(usage_type, False)}
