"""Utility functions for chess rendering in Blender"""

import bpy
from typing import Tuple


def square_to_coords(square: str, spacing: float = 1.0) -> Tuple[float, float]:
    """
    Convert chess square notation to centered x,y coordinates.

    Args:
        square: Chess square in algebraic notation (e.g., 'a1', 'h8')
        spacing: Distance between adjacent squares (default 1.0)

    Returns:
        Tuple of (x, y) coordinates
    """
    center_offset = 3.5
    file = ord(square[0]) - ord("a")
    rank = int(square[1]) - 1

    centered_x = (file - center_offset) * spacing
    centered_y = (rank - center_offset) * spacing

    return (centered_x, centered_y)


def clear_scene():
    """Remove all mesh and text objects from the scene."""
    bpy.ops.object.select_all(action="DESELECT")

    for obj_type in ["MESH", "FONT"]:
        bpy.ops.object.select_by_type(type=obj_type)
        bpy.ops.object.delete()


def create_piece(node: dict, scale: float = 0.8):
    """
    Create a text object to represent a chess piece.

    Args:
        node: Dict with 'square', 'piece_type', and 'color'
        scale: Size of the text object

    Note on 3D scale for 2D text:
    - Text objects in Blender are 2D curves, but they exist in 3D space
    - scale=(0.8, 0.8, 0.8) applies uniform scaling in X, Y, and Z
    - The Z (depth) dimension affects extrusion if you add 3D depth later
    - For flat text, Z scale mainly affects selection/bounds but not appearance
    """
    from .constants import PIECE_SYMBOLS

    x, y = square_to_coords(node["square"])

    piece_char = node["piece_type"]
    bpy.ops.object.text_add(location=(x, y, 0))

    text_obj = bpy.context.active_object
    text_obj.data.body = PIECE_SYMBOLS[piece_char]
    text_obj.name = f"{piece_char}_{node['square']}"

    text_obj.data.align_x = "CENTER"
    text_obj.data.align_y = "CENTER"

    text_obj.scale = (scale, scale, scale)

    material = bpy.data.materials.new(name=f"Material_{node['square']}")
    material.use_nodes = True

    # Bidirectional Scattering Distribution Function
    bsdf = material.node_tree.nodes["Principled BSDF"]

    if node["color"] == "white":
        bsdf.inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1.0)
    else:
        bsdf.inputs["Base Color"].default_value = (0.2, 0.2, 0.2, 1.0)

    text_obj.data.materials.append(material)
    return text_obj
