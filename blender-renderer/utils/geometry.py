"""Geometry and coordinate conversion utilities."""

import mathutils
import yaml
import os
from typing import Tuple, Dict, Any
from ..constants import (
    COLOR_NAMES,
    USD_BOARD_HALF_WIDTH,
    USD_BOARD_PIECE_HEIGHT,
    USD_BOARD_SCALE,
)


def resolve_color(value, default=None):
    """
    Resolve a color value from board_config to an RGBA tuple.

    Accepts:
      - A string name (e.g. "forestgreen") → looked up in COLOR_NAMES
      - A 3-element list/tuple → alpha 1.0 appended
      - A 4-element list/tuple → returned as-is
      - None → returns default
    """
    if value is None:
        return default
    if isinstance(value, str):
        resolved = COLOR_NAMES.get(value.lower())
        if resolved is None:
            print(f"Warning: Unknown color name '{value}', using default")
            return default
        return resolved
    if isinstance(value, (list, tuple)):
        if len(value) == 3:
            return tuple(value) + (1.0,)
        if len(value) == 4:
            return tuple(value)
    print(f"Warning: Unrecognised color value {value!r}, using default")
    return default


def load_board_config() -> Dict[str, Any]:
    """
    Load board configuration from YAML file.

    Returns:
        Dictionary containing global settings and layer definitions
    """
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "board_config.yaml"
    )
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def square_to_coords(square: str) -> Tuple[float, float, float]:
    """
    Convert chess square notation to 3D coordinates on the USD chessboard.

    The board is centered at origin with an 8x8 grid of squares.
    a1 is bottom-left (when viewing from white's side), h8 is top-right.

    Args:
        square: Chess square in algebraic notation (e.g., 'a1', 'h8')

    Returns:
        Tuple of (x, y, z) coordinates for Blender (after rotation and scaling)
    """
    # Convert square to grid indices (0-7)
    file = ord(square[0]) - ord("a")  # 0 (a) to 7 (h)
    rank = int(square[1]) - 1  # 0 (1) to 7 (8)

    # Map to board coordinates (in meters, before scaling)
    # Board spans from -USD_BOARD_HALF_WIDTH to +USD_BOARD_HALF_WIDTH
    # a-file (0) is at +HALF_WIDTH, h-file (7) is at -HALF_WIDTH (reversed to match board orientation)
    x = -USD_BOARD_HALF_WIDTH + ((7 - file) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # rank 1 (0) is at -HALF_WIDTH, rank 8 (7) is at +HALF_WIDTH
    z = -USD_BOARD_HALF_WIDTH + (rank / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # Y is height above board surface
    y = USD_BOARD_PIECE_HEIGHT

    # Scale by board scale factor
    return (x * USD_BOARD_SCALE, y * USD_BOARD_SCALE, z * USD_BOARD_SCALE)


def square_to_blender_loc(square: str) -> mathutils.Vector:
    """
    Return the actual Blender location for a piece on *square*.

    All pieces in board_config use transform_coords=true, which remaps
    square_to_coords (raw_x, raw_y, raw_z) → Blender (raw_x, -raw_z, raw_y).
    """
    raw_x, raw_y, raw_z = square_to_coords(square)
    return mathutils.Vector((raw_x, -raw_z, raw_y))


def square_to_board_2d(square: str) -> Tuple[float, float]:
    """
    Convert a chess square to 2D board (x, y) coordinates for flat layers.

    File direction is reversed relative to square_to_coords so that a-file
    appears on the correct side when the 2D layers are viewed from above.

    Returns:
        (x, y) — scaled Blender units; z_offset is applied by the caller.
    """
    file = ord(square[0]) - ord("a")  # 0 (a) to 7 (h)
    rank = int(square[1]) - 1  # 0 (1) to 7 (8)

    # Reverse file to match 3D board x-axis orientation
    x = (
        -USD_BOARD_HALF_WIDTH + ((7 - file) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)
    ) * USD_BOARD_SCALE
    # Reverse rank: in the XY plane positive-y points toward the camera, which is
    # the opposite of positive-z (rank 8 = back of scene) in the 3D board's XZ plane
    y = (
        -USD_BOARD_HALF_WIDTH + ((7 - rank) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)
    ) * USD_BOARD_SCALE
    return x, y
