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
