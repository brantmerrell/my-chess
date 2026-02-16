"""Utility functions for chess rendering in Blender"""

import bpy
import pdb
import yaml
import os
from typing import Tuple, Optional, Dict, Any


def load_board_config() -> Dict[str, Any]:
    """
    Load board configuration from YAML file.

    Returns:
        Dictionary containing global settings and layer definitions
    """
    config_path = os.path.join(os.path.dirname(__file__), 'board_config.yaml')
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def square_to_coords(square: str, spacing: float = 1.0, piece_type: str = 'P') -> Tuple[float, float, float]:
    """
    Convert chess square notation to 3D coordinates on the USD chessboard.

    The board is centered at origin with an 8x8 grid of squares.
    a1 is bottom-left (when viewing from white's side), h8 is top-right.

    Args:
        square: Chess square in algebraic notation (e.g., 'a1', 'h8')
        spacing: Ignored (using USD board dimensions)
        piece_type: Ignored

    Returns:
        Tuple of (x, y, z) coordinates for Blender (after rotation and scaling)
    """
    from .constants import USD_BOARD_HALF_WIDTH, USD_BOARD_PIECE_HEIGHT, USD_BOARD_SCALE

    # Convert square to grid indices (0-7)
    file = ord(square[0]) - ord('a')  # 0 (a) to 7 (h)
    rank = int(square[1]) - 1  # 0 (1) to 7 (8)

    # Map to board coordinates (in meters, before scaling)
    # Board spans from -USD_BOARD_HALF_WIDTH to +USD_BOARD_HALF_WIDTH
    # a-file (0) is at -HALF_WIDTH, h-file (7) is at +HALF_WIDTH
    x = -USD_BOARD_HALF_WIDTH + (file / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # rank 1 (0) is at -HALF_WIDTH, rank 8 (7) is at +HALF_WIDTH
    z = -USD_BOARD_HALF_WIDTH + (rank / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # Y is height above board surface
    y = USD_BOARD_PIECE_HEIGHT

    # Scale by board scale factor
    return (x * USD_BOARD_SCALE, y * USD_BOARD_SCALE, z * USD_BOARD_SCALE)


def import_usd_piece(usd_path: str, variant: str, location: Tuple[float, float, float], name: str, piece_type: str) -> Optional[bpy.types.Object]:
    """
    Import a USD asset into Blender with proper axis conversion.

    Args:
        usd_path: Absolute path to the USD file
        variant: Variant name ("Black" or "White")
        location: (x, y, z) coordinates for the piece in Blender Z-up space
        name: Name for the imported object
        piece_type: Single character piece type (K, Q, R, B, N, P)

    Returns:
        The imported object, or None if import failed

    Note:
        USD uses Y-up, we need to rotate to Z-up manually.
        Rotation: +90° around X converts Y-up to Z-up.
        Rooks/Knights need additional -90° Z-rotation.
    """
    import math
    print("import_usd_piece")

    # Import USD file with materials enabled
    bpy.ops.wm.usd_import(
        filepath=usd_path,
        scale=1.0,
        import_materials=True,
        import_usd_preview=True,
        set_material_blend=True,
        import_all_materials=True,
        import_textures_mode='IMPORT_PACK'
    )

    # Get the newly imported object
    imported_obj = bpy.context.active_object

    if imported_obj is None:
        print(f"Warning: Failed to import USD from {usd_path}")
        return None

    # USD imports create different hierarchies for different pieces:
    # - Most pieces: active_object is a child MESH, parent is the root EMPTY
    # - Rooks: active_object is the root EMPTY with mesh children
    # We need to position the ROOT object, not the active object
    root_obj = imported_obj
    if imported_obj.parent is not None:
        # Active object is a child, get its parent (the root)
        root_obj = imported_obj.parent

    # For rooks: Transform coordinates to account for their baked 90° X rotation
    # The rook's parent EMPTY has rotation (90°, 0, 0) which swaps Y and Z axes
    # To place at world (x, y, z), we need local coordinates (x, -z, y)
    if piece_type == 'R':
        x, y, z = location
        root_obj.location = (x, -z, y)
        # Reset the baked X rotation and apply proper orientation
        root_obj.rotation_euler = (math.pi / 2, 0, -math.pi / 2)
    else:
        # Set location normally for other pieces
        root_obj.location = location
        # Apply Y-axis rotation for proper orientation
        root_obj.rotation_euler[1] = math.pi / 2

    # Rename object
    imported_obj.name = name

    # Apply color to materials (fallback if USD materials don't work)
    _apply_piece_color(imported_obj, variant)

    return imported_obj


def _apply_piece_color(obj: bpy.types.Object, variant: str):
    """
    Apply color to all materials in the object hierarchy.
    Fallback for when USD MaterialX materials don't convert properly.

    Args:
        obj: Root object (may be EMPTY with mesh children)
        variant: "Black" or "White"
    """
    # Color values
    print("_apply_piece_color")
    if variant == "White":
        color = (0.9, 0.9, 0.85, 1.0)  # Off-white
    else:
        color = (0.15, 0.15, 0.15, 1.0)  # Dark gray/black

    def apply_to_object(o): # why define this function here? Why not _apply_color_to_piece somewhere else?
        if o.type == 'MESH' and hasattr(o.data, 'materials'):
            for mat in o.data.materials:
                if mat:
                    # Enable nodes if not already
                    if not mat.use_nodes:
                        mat.use_nodes = True

                    # Find or create Principled BSDF
                    nodes = mat.node_tree.nodes
                    bsdf = nodes.get('Principled BSDF')
                    if not bsdf:
                        bsdf = nodes.new('ShaderNodeBsdfPrincipled')

                    # Set base color
                    bsdf.inputs['Base Color'].default_value = color

        # Recurse to children
        for child in o.children:
            apply_to_object(child)

    apply_to_object(obj)


def create_chessboard() -> Optional[bpy.types.Object]:
    """
    Import the USD chessboard asset.

    Returns:
        The imported chessboard object, or None if import failed
    """
    import math
    from .constants import USD_CHESSBOARD_PATH
    print("create_chessboard")

    # Import the chessboard with materials enabled
    bpy.ops.wm.usd_import(
        filepath=USD_CHESSBOARD_PATH,
        scale=1.0,
        import_materials=True,
        import_usd_preview=True,
        set_material_blend=True,
        import_all_materials=True,
        import_textures_mode='IMPORT_PACK'
    )

    # Get the newly imported object
    board_obj = bpy.context.active_object

    if board_obj is None:
        print(f"Warning: Failed to import chessboard from {USD_CHESSBOARD_PATH}")
        return None

    # Don't rotate the board - it imports correctly oriented

    # Center the board at origin and scale appropriately
    # The board extents are ~0.705m total width (0.35270807 * 2)
    # We want 8 Blender units (8 squares at 1.0 spacing each)
    board_scale = 13.8 # why not use the scale defined in constants.py?
    board_obj.scale = (board_scale, board_scale, board_scale)
    board_obj.location = (0, 0, 0)

    board_obj.name = "Chessboard"

    # Apply checkerboard pattern to enhance visibility
    # (Original USD materials may not load properly)
    _apply_board_material(board_obj)

    return board_obj


def _apply_board_material(obj: bpy.types.Object):
    """
    Enhance the chessboard materials to show colors using original textures.

    Args:
        obj: Chessboard root object
    """
    from .constants import USD_ASSETS_BASE
    import os

    texture_path = os.path.join(USD_ASSETS_BASE, "Chessboard", "tex", "chessboard_base_color.jpg")

    def apply_to_object(o):
        if o.type == 'MESH' and hasattr(o.data, 'materials'):
            for mat in o.data.materials:
                if mat:
                    # Enable nodes if not already
                    if not mat.use_nodes:
                        mat.use_nodes = True

                    nodes = mat.node_tree.nodes
                    links = mat.node_tree.links

                    # Find the Principled BSDF
                    bsdf = nodes.get('Principled BSDF')
                    if not bsdf:
                        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
                        # Find output and link
                        output = nodes.get('Material Output')
                        if output:
                            links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

                    # Check if there's already a texture/color input
                    base_color_input = bsdf.inputs['Base Color']
                    if not base_color_input.is_linked:
                        # Try to load the original texture
                        if os.path.exists(texture_path):
                            # Create image texture node
                            tex_image = nodes.new('ShaderNodeTexImage')
                            try:
                                tex_image.image = bpy.data.images.load(texture_path)
                                links.new(tex_image.outputs['Color'], base_color_input)
                            except:
                                # Fallback to procedural if texture fails
                                print(f"Failed to load texture: {texture_path}")
                                _add_procedural_checker(nodes, links, base_color_input)
                        else:
                            # Fallback to procedural checker
                            _add_procedural_checker(nodes, links, base_color_input)

        for child in o.children:
            apply_to_object(child)

    apply_to_object(obj)


def _add_procedural_checker(nodes, links, base_color_input):
    """Helper to add procedural checker pattern."""
    print("_add_procedural_checker")
    checker = nodes.new('ShaderNodeTexChecker')
    checker.inputs['Scale'].default_value = 8.0
    checker.inputs['Color1'].default_value = (0.9, 0.8, 0.6, 1.0)  # Light
    checker.inputs['Color2'].default_value = (0.4, 0.3, 0.2, 1.0)  # Dark
    links.new(checker.outputs['Color'], base_color_input)


def clear_scene():
    """Remove all mesh, text, and empty objects from the scene."""
    print("clear_scene")
    bpy.ops.object.select_all(action="DESELECT")

    # MESH: USD imported geometry, FONT: text fallback, EMPTY: USD container objects
    for obj_type in ["MESH", "FONT", "EMPTY"]:
        bpy.ops.object.select_by_type(type=obj_type)
        bpy.ops.object.delete()

    # Remove old checkerboard material so it gets recreated with new settings
    old_mat = bpy.data.materials.get("Checkerboard_Material")
    if old_mat:
        bpy.data.materials.remove(old_mat)

    # Configure viewport for better visualization
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    # Disable relationship lines (those dotted lines)
                    space.overlay.show_relationship_lines = False
                    # Set shading to Material Preview to see colors/materials
                    space.shading.type = 'MATERIAL'


def create_piece(node: dict, scale: float = 1.0, use_usd: bool = True):
    """
    Create a chess piece, either as USD asset or text fallback.

    Args:
        node: Dict with 'square', 'piece_type', and 'color'
        scale: Size scaling factor (for text mode, ignored for USD)
        use_usd: If True, import USD asset; if False, use text (fallback)

    Returns:
        The created Blender object

    Note:
        USD pieces are scaled at 5.0 by default because they're in meters
        (a bishop is ~0.14m tall, and we want them to fit nicely in 1.0 Blender unit squares)
    """
    from .constants import USD_PIECE_PATHS, USD_VARIANT_BLACK, USD_VARIANT_WHITE, PIECE_SYMBOLS
    print("create_piece")
    #pdb.set_trace()

    piece_char = node["piece_type"]
    piece_upper = piece_char.upper()
    x, y, z = square_to_coords(node["square"], piece_type=piece_upper)

    if use_usd and piece_upper in USD_PIECE_PATHS:
        usd_path = USD_PIECE_PATHS[piece_upper]
        variant = USD_VARIANT_WHITE if node["color"] == "white" else USD_VARIANT_BLACK
        name = f"{piece_char}_{node['square']}"

        # USD pieces need much larger scale (they're in real-world meters)
        usd_scale = 5.0

        piece_obj = import_usd_piece(
            usd_path=usd_path,
            variant=variant,
            location=(x, y, z),
            name=name,
            piece_type=piece_upper
        )

        if piece_obj:
            piece_obj.scale = (usd_scale, usd_scale, usd_scale)
            return piece_obj

        print(f"USD import failed for {piece_char}, falling back to text")

    # Text fallback (original implementation)
    bpy.ops.object.text_add(location=(x, y, 0)) # how do we somehow reach this point after hitting line 325? (Rook only)

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


def create_ascii_piece(node: dict, scale: float = 0.8, z_offset: float = -1.0):
    """
    Create a 2D text object to represent a chess piece in ASCII style.
    This is positioned below the main 3D board for a side-by-side comparison.

    Args:
        node: Dict with 'square', 'piece_type', and 'color'
        scale: Size of the text object
        z_offset: Z-coordinate offset (negative to place below 3D board)

    Returns:
        The created text object
    """
    from .constants import PIECE_SYMBOLS, USD_BOARD_HALF_WIDTH, USD_BOARD_SCALE

    # Convert chess square to board coordinates
    file = ord(node["square"][0]) - ord('a')  # 0-7
    rank = int(node["square"][1]) - 1  # 0-7

    # Calculate board coordinates (same as 3D pieces)
    ascii_x = -USD_BOARD_HALF_WIDTH + (file / 7.0) * (2 * USD_BOARD_HALF_WIDTH)
    ascii_y = -USD_BOARD_HALF_WIDTH + (rank / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # Scale by board scale factor
    ascii_x *= USD_BOARD_SCALE
    ascii_y *= USD_BOARD_SCALE

    piece_char = node["piece_type"]
    bpy.ops.object.text_add(location=(ascii_x, ascii_y, z_offset))

    text_obj = bpy.context.active_object
    text_obj.data.body = PIECE_SYMBOLS[piece_char]
    text_obj.name = f"ascii_{piece_char}_{node['square']}"

    text_obj.data.align_x = "CENTER"
    text_obj.data.align_y = "CENTER"

    # Rotate to match the ASCII board's rotation (90° around Z axis)
    import math

    text_obj.scale = (scale, scale, scale)

    material = bpy.data.materials.new(name=f"ASCII_Material_{node['square']}")
    material.use_nodes = True

    bsdf = material.node_tree.nodes["Principled BSDF"]

    if node["color"] == "white":
        bsdf.inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1.0)
    else:
        bsdf.inputs["Base Color"].default_value = (0.2, 0.2, 0.2, 1.0)

    text_obj.data.materials.append(material)
    return text_obj


def render_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list):
    """
    Render a single board layer based on configuration.

    Args:
        layer_config: Configuration for this specific layer
        global_config: Global board settings
        nodes: List of piece nodes to render
    """
    if not layer_config.get('enabled', False):
        return

    layer_type = layer_config.get('type')
    z_offset = layer_config.get('z_offset', 0.0)

    # Render board if configured
    if layer_config.get('board', {}).get('show', False):
        if layer_type == 'usd' and layer_config['board'].get('import_usd', False):
            create_chessboard()

    # Render pieces based on layer type
    if layer_type == 'usd':
        _render_usd_layer(layer_config, global_config, nodes, z_offset)
    elif layer_type == 'ascii':
        _render_ascii_layer(layer_config, global_config, nodes, z_offset)


def _render_usd_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, z_offset: float):
    """Render USD 3D pieces layer."""
    piece_config = layer_config.get('pieces', {})
    scale = piece_config.get('scale', 5.0)

    for node in nodes:
        create_piece(node)  # Uses existing create_piece function


def _render_ascii_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, z_offset: float):
    """Render ASCII text pieces layer."""
    piece_config = layer_config.get('pieces', {})
    scale = piece_config.get('scale', 0.8)

    for node in nodes:
        create_ascii_piece(node, scale=scale, z_offset=z_offset)
