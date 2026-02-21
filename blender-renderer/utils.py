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
    # a-file (0) is at +HALF_WIDTH, h-file (7) is at -HALF_WIDTH (reversed to match board orientation)
    x = -USD_BOARD_HALF_WIDTH + ((7 - file) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # rank 1 (0) is at -HALF_WIDTH, rank 8 (7) is at +HALF_WIDTH
    z = -USD_BOARD_HALF_WIDTH + (rank / 7.0) * (2 * USD_BOARD_HALF_WIDTH)

    # Y is height above board surface
    y = USD_BOARD_PIECE_HEIGHT

    # Scale by board scale factor
    return (x * USD_BOARD_SCALE, y * USD_BOARD_SCALE, z * USD_BOARD_SCALE)


def import_usd_piece(usd_path: str, variant: str, location: Tuple[float, float, float], name: str, piece_type: str, color: str = "white", rotation_config: Optional[Dict[str, Any]] = None) -> Optional[bpy.types.Object]:
    """
    Import a USD asset into Blender with proper axis conversion.

    Args:
        usd_path: Absolute path to the USD file
        variant: Variant name ("Black" or "White")
        location: (x, y, z) coordinates for the piece in Blender Z-up space
        name: Name for the imported object
        piece_type: Single character piece type (K, Q, R, B, N, P)
        color: Piece color ("white" or "black")
        rotation_config: Optional rotation configuration from YAML

    Returns:
        The imported object, or None if import failed

    Note:
        Rotation settings are read from rotation_config.
    """
    import math
    print(f"=== import_usd_piece called: piece_type={piece_type}, color={color}")

    if rotation_config is None:
        rotation_config = {}
        print("rotation_config was None, using empty dict")

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

    # Get piece-specific configuration (support both old and new names)
    rotations = rotation_config.get('rotations') or rotation_config.get('specific_rotations', {})
    print(f"rotation_config keys: {rotation_config.keys()}")

    # Map piece types to full names
    piece_name_map = {
        'R': 'rook',
        'N': 'knight',
        'B': 'bishop',
        'Q': 'queen',
        'K': 'king',
        'P': 'pawn'
    }
    piece_name = piece_name_map.get(piece_type, piece_type.lower())
    print(f"rotations keys: {rotations.keys()}")
    piece_config = rotations.get(piece_name, {})
    print(f"piece_config keys: {piece_config.keys()}")
    print(f"piece_type: {piece_type}, piece_name: {piece_name}, color: {color}")

    # Check if this piece has color-specific configuration
    if color in piece_config:
        # Get color-specific rotation config
        color_config = piece_config[color]
        rotation = color_config.get('rotation', {})

        # Check if this piece needs coordinate transformation
        if piece_config.get('transform_coords', False):
            print(f"Applying transform_coords for {piece_type} ({color})")
            # Transform coordinates (e.g., for rooks: (x, y, z) -> (x, -z, y))
            x, y, z = location
            root_obj.location = (x, -z, y)
        else:
            # Set location normally
            root_obj.location = location

        # Apply configured rotation
        rotation_x = rotation.get('x', 0.0)
        rotation_y = rotation.get('y', math.pi / 2)  # Default Y rotation
        rotation_z = rotation.get('z', 0.0)
        print(f"rotation_x: {rotation_x}, rotation_y: {rotation_y}, rotation_z: {rotation_z}")
        root_obj.rotation_euler = (rotation_x, rotation_y, rotation_z)
    else:
        # No specific config, use default behavior
        print(f"No specific config for {piece_name} {color}, using default")
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

    # MESH: USD imported geometry, FONT: text fallback, EMPTY: USD container objects, CURVE: link lines
    for obj_type in ["MESH", "FONT", "EMPTY", "CURVE"]:
        bpy.ops.object.select_by_type(type=obj_type)
        bpy.ops.object.delete()

    # Configure viewport for better visualization
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    # Disable relationship lines (those dotted lines)
                    space.overlay.show_relationship_lines = False
                    # Set shading to Material Preview to see colors/materials
                    space.shading.type = 'MATERIAL'


def create_piece(node: dict, scale: float = 1.0, use_usd: bool = True, rotation_config: Optional[Dict[str, Any]] = None):
    """
    Create a chess piece, either as USD asset or text fallback.

    Args:
        node: Dict with 'square', 'piece_type', and 'color'
        scale: Size scaling factor (for text mode, ignored for USD)
        use_usd: If True, import USD asset; if False, use text (fallback)
        rotation_config: Optional rotation configuration from YAML

    Returns:
        The created Blender object

    Note:
        USD pieces are scaled at 5.0 by default because they're in meters
        (a bishop is ~0.14m tall, and we want them to fit nicely in 1.0 Blender unit squares)
    """
    from .constants import USD_PIECE_PATHS, USD_VARIANT_BLACK, USD_VARIANT_WHITE, PIECE_SYMBOLS
    print(f"create_piece: node={node.get('square')}, rotation_config={rotation_config}")
    #pdb.set_trace()

    if rotation_config is None:
        rotation_config = {}
        print("create_piece: rotation_config was None")

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
            piece_type=piece_upper,
            color=node["color"],
            rotation_config=rotation_config
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


def _square_to_board_2d(square: str) -> Tuple[float, float]:
    """
    Convert a chess square to 2D board (x, y) coordinates for flat layers.

    File direction is reversed relative to square_to_coords so that a-file
    appears on the correct side when the 2D layers are viewed from above.

    Returns:
        (x, y) — scaled Blender units; z_offset is applied by the caller.
    """
    from .constants import USD_BOARD_HALF_WIDTH, USD_BOARD_SCALE

    file = ord(square[0]) - ord('a')  # 0 (a) to 7 (h)
    rank = int(square[1]) - 1         # 0 (1) to 7 (8)

    # Reverse file to match 3D board x-axis orientation
    x = (-USD_BOARD_HALF_WIDTH + ((7 - file) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)) * USD_BOARD_SCALE
    # Reverse rank: in the XY plane positive-y points toward the camera, which is
    # the opposite of positive-z (rank 8 = back of scene) in the 3D board's XZ plane
    y = (-USD_BOARD_HALF_WIDTH + ((7 - rank) / 7.0) * (2 * USD_BOARD_HALF_WIDTH)) * USD_BOARD_SCALE
    return x, y


def create_ascii_piece(node: dict, scale: float = 0.8, z_offset: float = -1.0, material: bpy.types.Material = None):
    """
    Create a 2D text object to represent a chess piece in ASCII style.
    This is positioned below the main 3D board for a side-by-side comparison.

    Args:
        node: Dict with 'square', 'piece_type', and 'color'
        scale: Size of the text object
        z_offset: Z-coordinate offset (negative to place below 3D board)
        material: Shared Blender material to apply (created once per color by the caller)

    Returns:
        The created text object
    """
    from .constants import PIECE_SYMBOLS

    ascii_x, ascii_y = _square_to_board_2d(node["square"])
    piece_char = node["piece_type"]

    # Use bpy.data API directly — avoids bpy.ops context overhead
    curve_data = bpy.data.curves.new(name=f"ascii_{piece_char}_{node['square']}", type='FONT')
    curve_data.body = PIECE_SYMBOLS[piece_char]
    curve_data.align_x = 'CENTER'
    curve_data.align_y = 'CENTER'

    text_obj = bpy.data.objects.new(f"ascii_{piece_char}_{node['square']}", curve_data)
    text_obj.location = (ascii_x, ascii_y, z_offset)
    text_obj.scale = (scale, scale, scale)
    bpy.context.collection.objects.link(text_obj)

    if material:
        curve_data.materials.append(material)

    return text_obj


def _make_material(name: str, color: list) -> bpy.types.Material:
    """Create a Principled BSDF material with the given RGBA base color."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = tuple(color)
    return mat


def create_glass_pane(z_offset: float, color: list = None, alpha: float = 0.25, roughness: float = 0.1, scale: float = 1.0) -> bpy.types.Object:
    """
    Create a flat rectangular mesh matching the chessboard playing surface,
    positioned at z_offset in the XY plane with a semi-transparent dark material.

    Args:
        z_offset: Z position (negative to stack below 3D board)
        color: RGB list for the pane tint (default: very dark blue-grey)
        alpha: Opacity 0.0 (invisible) to 1.0 (opaque); default 0.25
        roughness: Surface roughness 0.0 (glossy) to 1.0 (matte); default 0.1
        scale: Size multiplier for dimensions; default 1.0
    Returns:
        The created mesh object
    """
    from .constants import USD_BOARD_HALF_WIDTH, USD_BOARD_SCALE

    if color is None:
        color = [0.02, 0.02, 0.05]

    hw = 3.5

    mesh = bpy.data.meshes.new("glass_pane")
    verts = [(-hw, -hw, 0.0), (hw, -hw, 0.0), (hw, hw, 0.0), (-hw, hw, 0.0)]
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    mesh.update()

    obj = bpy.data.objects.new("glass_pane", mesh)
    obj.location = (0.0, 0.0, z_offset)
    bpy.context.collection.objects.link(obj)

    mat = bpy.data.materials.new(name="glass_pane_mat")
    mat.use_nodes = True
    # Blender 4.2+ (EEVEE Next) renamed blend_method → surface_render_method
    try:
        mat.surface_render_method = 'BLENDED'
    except AttributeError:
        mat.blend_method = 'BLEND'
        mat.shadow_method = 'NONE'
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Alpha"].default_value = alpha
    bsdf.inputs["Roughness"].default_value = roughness

    obj.data.materials.append(mat)
    return obj


def create_asterisk(square: str, z_offset: float = -0.5, scale: float = 0.5, material: bpy.types.Material = None) -> bpy.types.Object:
    """
    Create an asterisk text object at a board square position.

    Args:
        square: Chess square in algebraic notation (e.g., 'a1')
        z_offset: Z-coordinate for this layer
        scale: Size of the text object
        material: Shared Blender material to apply (created once per layer by the caller)

    Returns:
        The created text object
    """
    x, y = _square_to_board_2d(square)

    # Use bpy.data API directly — avoids bpy.ops context overhead
    curve_data = bpy.data.curves.new(name=f"asterisk_{square}", type='FONT')
    curve_data.body = "*"
    curve_data.align_x = 'CENTER'
    curve_data.align_y = 'CENTER'

    text_obj = bpy.data.objects.new(f"asterisk_{square}", curve_data)
    text_obj.location = (x, y, z_offset)
    text_obj.scale = (scale, scale, scale)
    bpy.context.collection.objects.link(text_obj)

    if material:
        curve_data.materials.append(material)

    return text_obj


def create_link_line(square_from: str, square_to: str, z_offset: float = -0.5, thickness: float = 0.02, material: bpy.types.Material = None) -> bpy.types.Object:
    """
    Create a curve object connecting two board squares.

    Args:
        square_from: Source square in algebraic notation
        square_to: Target square in algebraic notation
        z_offset: Z-coordinate for this layer
        thickness: Bevel depth for line thickness
        material: Shared Blender material to apply (created once per layer by the caller)

    Returns:
        The created curve object
    """
    sx, sy = _square_to_board_2d(square_from)
    start = (sx, sy, z_offset)
    ex, ey = _square_to_board_2d(square_to)
    end = (ex, ey, z_offset)

    curve_data = bpy.data.curves.new(name=f"link_{square_from}_{square_to}", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = thickness

    spline = curve_data.splines.new('POLY')
    spline.points.add(1)  # starts with 1 point, add 1 more
    spline.points[0].co = (*start, 1.0)  # (x, y, z, w)
    spline.points[1].co = (*end, 1.0)

    curve_obj = bpy.data.objects.new(f"link_{square_from}_{square_to}", curve_data)
    bpy.context.collection.objects.link(curve_obj)

    if material:
        curve_obj.data.materials.append(material)

    return curve_obj


def render_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, edges: list = None):
    """
    Render a single board layer based on configuration.

    Args:
        layer_config: Configuration for this specific layer
        global_config: Global board settings
        nodes: List of piece nodes to render
    """
    if not layer_config.get('enabled', False):
        return

    if edges is None:
        edges = []

    layer_type = layer_config.get('type')

    # Get offset values (supports both old z_offset and new offset dict)
    offset_config = layer_config.get('offset', {})
    if isinstance(offset_config, dict):
        offset_x = offset_config.get('x', 0.0)
        offset_y = offset_config.get('y', 0.0)
        offset_z = offset_config.get('z', 0.0)
    else:
        # Fallback for old z_offset format
        offset_x = 0.0
        offset_y = 0.0
        offset_z = layer_config.get('z_offset', 0.0)

    # Get rotation values
    rotation_config = layer_config.get('rotation', {})
    rotation_x = rotation_config.get('x', 0.0)
    rotation_y = rotation_config.get('y', 0.0)
    rotation_z = rotation_config.get('z', 0.0)

    # Render glass pane or board (glass_pane takes precedence if truthy)
    pane_cfg = layer_config.get('glass_pane')
    if pane_cfg:
        # Glass pane is configured, render it
        create_glass_pane(
            offset_z,
            color=pane_cfg.get('color', [0.02, 0.02, 0.05]),
            alpha=pane_cfg.get('alpha', 0.25),
            roughness=pane_cfg.get('roughness', 0.1),
            scale=pane_cfg.get('scale', 1.0),
        )
    elif layer_config.get('board', {}).get('show', False):
        # No glass pane, render board if configured
        if layer_type == 'usd' and layer_config['board'].get('import_usd', False):
            create_chessboard()

    _GRAPH_LAYER_TYPES = {'adjacencies', 'links', 'king_box', 'shadows', 'focus'}

    # Render pieces based on layer type
    if layer_type == 'usd':
        _render_usd_layer(layer_config, global_config, nodes, offset_z)
    elif layer_type == 'ascii':
        _render_ascii_layer(layer_config, global_config, nodes, offset_z)
    elif layer_type in _GRAPH_LAYER_TYPES:
        _render_graph_layer(layer_config, global_config, nodes, edges, offset_z)


def _render_usd_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, z_offset: float):
    """Render USD 3D pieces layer."""
    piece_config = layer_config.get('pieces', {})
    scale = piece_config.get('scale', 5.0)

    # Extract rotation config to pass to pieces (support both old and new names)
    rotations = piece_config.get('rotations') or piece_config.get('specific_rotations', {})
    rotation_config = {
        'rotations': rotations
    }
    print(f"_render_usd_layer: rotation_config = {rotation_config}")

    for node in nodes:
        create_piece(node, rotation_config=rotation_config)


def _render_ascii_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, z_offset: float):
    """Render ASCII text pieces layer."""
    layer_name = layer_config.get('name', 'ascii')
    piece_config = layer_config.get('pieces', {})
    scale = piece_config.get('scale', 0.8)
    white_color = piece_config.get('white_color', [0.9, 0.9, 0.9, 1.0])
    black_color = piece_config.get('black_color', [0.2, 0.2, 0.2, 1.0])

    white_mat = _make_material(f"{layer_name}_white", white_color)
    black_mat = _make_material(f"{layer_name}_black", black_color)

    for node in nodes:
        mat = white_mat if node["color"] == "white" else black_mat
        create_ascii_piece(node, scale=scale, z_offset=z_offset, material=mat)


def _render_graph_layer(layer_config: Dict[str, Any], global_config: Dict[str, Any], nodes: list, edges: list, z_offset: float):
    """Render a graph layer (adjacencies, links, king_box, shadows) with asterisks at node positions and lines for edges."""
    layer_name = layer_config.get('name', 'graph')

    asterisk_config = layer_config.get('asterisks', {})
    asterisk_scale = asterisk_config.get('scale', 0.5)
    asterisk_color = asterisk_config.get('color', [1.0, 1.0, 0.0, 1.0])
    asterisk_mat = _make_material(f"{layer_name}_asterisk", asterisk_color)

    edge_config = layer_config.get('edges', {})
    edge_thickness = edge_config.get('thickness', 0.02)

    # Per-type color support: use 'colors' dict keyed by edge type.
    # Falls back to legacy single 'color' key, then to darkgoldenrod.
    _DEFAULT_EDGE_COLOR = [0.722, 0.525, 0.043, 1.0]  # darkgoldenrod
    edge_colors = edge_config.get('colors', {})
    if not edge_colors:
        single = edge_config.get('color', _DEFAULT_EDGE_COLOR)
        edge_colors = {'default': single}
    elif 'default' not in edge_colors:
        edge_colors['default'] = _DEFAULT_EDGE_COLOR

    # Cache materials: one per unique color to avoid redundant material creation
    _color_mat_cache = {}

    def _get_edge_mat(edge_type):
        color = edge_colors.get(edge_type, edge_colors['default'])
        key = tuple(color)
        if key not in _color_mat_cache:
            _color_mat_cache[key] = _make_material(f"{layer_name}_edge_{edge_type}", color)
        return _color_mat_cache[key]

    for node in nodes:
        create_asterisk(node['square'], z_offset=z_offset, scale=asterisk_scale, material=asterisk_mat)

    for edge in edges:
        # Handle different possible edge key formats from the API
        source = edge.get('source') or edge.get('from') or edge.get('from_square') or edge.get('start')
        target = edge.get('target') or edge.get('to') or edge.get('to_square') or edge.get('end')

        if source and target:
            edge_type = edge.get('type', 'default')
            create_link_line(source, target, z_offset=z_offset, thickness=edge_thickness, material=_get_edge_mat(edge_type))

