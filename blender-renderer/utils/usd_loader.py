"""USD asset loading helpers for Blender chess rendering."""

import math
import os
from typing import Any, Dict, Optional, Tuple

import bpy

from ..constants import USD_ASSETS_BASE, USD_CHESSBOARD_PATH
from .geometry import resolve_color
from .materials import add_procedural_checker


def import_usd_piece(
    usd_path: str,
    variant: str,
    location: Tuple[float, float, float],
    name: str,
    piece_type: str,
    color: str = "white",
    rotation_config: Optional[Dict[str, Any]] = None,
) -> Optional[bpy.types.Object]:
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
    """
    print(f"=== import_usd_piece called: piece_type={piece_type}, color={color}")

    if rotation_config is None:
        rotation_config = {}
        print("rotation_config was None, using empty dict")

    bpy.ops.wm.usd_import(
        filepath=usd_path,
        scale=1.0,
        import_materials=True,
        import_usd_preview=True,
        set_material_blend=True,
        import_all_materials=True,
        import_textures_mode="IMPORT_PACK",
    )

    imported_obj = bpy.context.active_object
    if imported_obj is None:
        print(f"Warning: Failed to import USD from {usd_path}")
        return None

    root_obj = imported_obj
    while root_obj.parent is not None:
        root_obj = root_obj.parent

    rotations = rotation_config.get("rotations") or rotation_config.get(
        "specific_rotations", {}
    )
    print(f"rotation_config keys: {rotation_config.keys()}")

    piece_name_map = {
        "R": "rook",
        "N": "knight",
        "B": "bishop",
        "Q": "queen",
        "K": "king",
        "P": "pawn",
    }
    piece_name = piece_name_map.get(piece_type, piece_type.lower())
    print(f"rotations keys: {rotations.keys()}")
    piece_config = rotations.get(piece_name, {}) or {}
    print(f"piece_config keys: {piece_config.keys() if piece_config else 'None'}")
    print(f"piece_type: {piece_type}, piece_name: {piece_name}, color: {color}")

    if piece_config and color in piece_config:
        color_config = piece_config[color]
        rotation = color_config.get("rotation", {})

        if piece_config.get("transform_coords", False):
            print(f"Applying transform_coords for {piece_type} ({color})")
            x, y, z = location
            root_obj.location = (x, -z, y)
        else:
            root_obj.location = location

        rotation_x = rotation.get("x", 0.0)
        rotation_y = rotation.get("y", math.pi / 2)
        rotation_z = rotation.get("z", 0.0)
        print(
            f"rotation_x: {rotation_x}, rotation_y: {rotation_y}, rotation_z: {rotation_z}"
        )
        root_obj.rotation_euler = (rotation_x, rotation_y, rotation_z)
    else:
        print(f"No specific config for {piece_name} {color}, using default")
        root_obj.location = location
        root_obj.rotation_euler[1] = math.pi / 2

    root_obj.name = name
    apply_piece_color(root_obj, variant)
    return root_obj


def apply_piece_color(obj: bpy.types.Object, variant: str):
    """
    Apply color to all materials in the object hierarchy.

    Fallback for when USD MaterialX materials don't convert properly.
    """
    print("apply_piece_color")
    color = (0.9, 0.9, 0.85, 1.0) if variant == "White" else (0.15, 0.15, 0.15, 1.0)

    def apply_to_object(target_obj):
        if target_obj.type == "MESH" and hasattr(target_obj.data, "materials"):
            for mat in target_obj.data.materials:
                if not mat:
                    continue
                if not mat.use_nodes:
                    mat.use_nodes = True

                nodes = mat.node_tree.nodes
                bsdf = nodes.get("Principled BSDF")
                if not bsdf:
                    bsdf = nodes.new("ShaderNodeBsdfPrincipled")

                bsdf.inputs["Base Color"].default_value = color

        for child in target_obj.children:
            apply_to_object(child)

    apply_to_object(obj)


def create_chessboard(
    material_config: Optional[Dict[str, Any]] = None,
) -> Optional[bpy.types.Object]:
    """
    Import the USD chessboard asset.

    Args:
        material_config: Optional dict with material properties (metallic, specular_tint)

    Returns:
        The imported chessboard object, or None if import failed
    """
    print("create_chessboard")

    bpy.ops.wm.usd_import(
        filepath=USD_CHESSBOARD_PATH,
        scale=1.0,
        import_materials=True,
        import_usd_preview=True,
        set_material_blend=True,
        import_all_materials=True,
        import_textures_mode="IMPORT_PACK",
    )

    board_obj = bpy.context.active_object
    if board_obj is None:
        print(f"Warning: Failed to import chessboard from {USD_CHESSBOARD_PATH}")
        return None

    board_scale = 13.8
    board_obj.scale = (board_scale, board_scale, board_scale)
    board_obj.location = (0, 0, 0)
    board_obj.name = "Chessboard"

    apply_board_material_textures(board_obj, material_config=material_config)
    return board_obj


def apply_board_material_textures(
    obj: bpy.types.Object,
    material_config: Optional[Dict[str, Any]] = None,
):
    """
    Enhance chessboard materials using original textures when available.

    Args:
        obj: Chessboard root object
        material_config: Optional dict with material properties (metallic, specular_tint)
    """
    if material_config is None:
        material_config = {}

    texture_path = os.path.join(
        USD_ASSETS_BASE, "Chessboard", "tex", "chessboard_base_color.jpg"
    )
    metallic = material_config.get("metallic", 0.0)

    try:
        props = bpy.context.scene.blchess_renderer
        specular_tint_color = props.board_material_color
    except (AttributeError, KeyError):
        specular_tint_color = material_config.get("specular_tint", None)

    specular_tint_rgba = (
        resolve_color(specular_tint_color) if specular_tint_color else None
    )

    def apply_to_object(target_obj):
        if target_obj.type == "MESH" and hasattr(target_obj.data, "materials"):
            for mat in target_obj.data.materials:
                if not mat:
                    continue
                if not mat.use_nodes:
                    mat.use_nodes = True

                nodes = mat.node_tree.nodes
                links = mat.node_tree.links

                bsdf = nodes.get("Principled BSDF")
                if not bsdf:
                    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
                    output = nodes.get("Material Output")
                    if output:
                        links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

                bsdf.inputs["Metallic"].default_value = metallic

                if specular_tint_rgba:
                    if "Specular Tint" in bsdf.inputs:
                        bsdf.inputs["Specular Tint"].default_value = specular_tint_rgba
                    elif "Tint" in bsdf.inputs:
                        bsdf.inputs["Tint"].default_value = specular_tint_rgba

                base_color_input = bsdf.inputs["Base Color"]
                if not base_color_input.is_linked:
                    if os.path.exists(texture_path):
                        tex_image = nodes.new("ShaderNodeTexImage")
                        try:
                            tex_image.image = bpy.data.images.load(texture_path)
                            links.new(tex_image.outputs["Color"], base_color_input)
                        except Exception:
                            print(f"Failed to load texture: {texture_path}")
                            add_procedural_checker(
                                nodes,
                                links,
                                base_color_input,
                                (0.9, 0.8, 0.6, 1.0),
                                (0.4, 0.3, 0.2, 1.0),
                            )
                    else:
                        add_procedural_checker(
                            nodes,
                            links,
                            base_color_input,
                            (0.9, 0.8, 0.6, 1.0),
                            (0.4, 0.3, 0.2, 1.0),
                        )

        for child in target_obj.children:
            apply_to_object(child)

    apply_to_object(obj)
