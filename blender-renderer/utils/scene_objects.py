"""Scene object creation and registry helpers."""

import math
from typing import Any, Dict, Optional

import bpy

from ..constants import (
    PIECE_SYMBOLS,
    USD_PIECE_PATHS,
    USD_VARIANT_BLACK,
    USD_VARIANT_WHITE,
    USD_PIECE_SCALE,
)
from .geometry import square_to_board_2d, square_to_coords
from .materials import make_material
from .usd_loader import import_usd_piece


anim_targets: Dict[str, list] = {}
edge_targets: Dict[str, list] = {}


def clear_scene():
    """Remove all mesh, text, empty, and curve objects from the scene."""
    print("clear_scene")
    anim_targets.clear()
    edge_targets.clear()
    bpy.ops.object.select_all(action="DESELECT")

    for obj_type in ["MESH", "FONT", "EMPTY", "CURVE"]:
        bpy.ops.object.select_by_type(type=obj_type)
        bpy.ops.object.delete()

    for area in bpy.context.screen.areas:
        if area.type != "VIEW_3D":
            continue
        for space in area.spaces:
            if space.type == "VIEW_3D":
                space.overlay.show_relationship_lines = False
                space.shading.type = "MATERIAL"


def create_piece(
    node: dict,
    scale: float = 1.0,
    use_usd: bool = True,
    rotation_config: Optional[Dict[str, Any]] = None,
):
    """
    Create a chess piece, either as USD asset or text fallback.

    Returns:
        The created Blender object
    """
    print(f"create_piece: node={node.get('square')}, rotation_config={rotation_config}")

    if rotation_config is None:
        rotation_config = {}
        print("create_piece: rotation_config was None")

    piece_char = node["piece_type"]
    if piece_char == "phantom":
        return None

    piece_upper = piece_char.upper()
    x, y, z = square_to_coords(node["square"])

    if use_usd and piece_upper in USD_PIECE_PATHS:
        piece_obj = import_usd_piece(
            usd_path=USD_PIECE_PATHS[piece_upper],
            variant=(
                USD_VARIANT_WHITE if node["color"] == "white" else USD_VARIANT_BLACK
            ),
            location=(x, y, z),
            name=f"{piece_char}_{node['square']}",
            piece_type=piece_upper,
            color=node["color"],
            rotation_config=rotation_config,
        )

        if piece_obj:
            usd_scale = USD_PIECE_SCALE
            piece_obj.scale = (usd_scale, usd_scale, usd_scale)
            anim_targets.setdefault(node["square"], []).append(piece_obj)
            return piece_obj

        print(f"USD import failed for {piece_char}, falling back to text")

    bpy.ops.object.text_add(location=(x, y, 0))
    text_obj = bpy.context.active_object
    text_obj.data.body = PIECE_SYMBOLS[piece_char]
    text_obj.name = f"{piece_char}_{node['square']}"
    text_obj.data.align_x = "CENTER"
    text_obj.data.align_y = "CENTER"
    text_obj.scale = (scale, scale, scale)

    color = (0.9, 0.9, 0.9, 1.0) if node["color"] == "white" else (0.2, 0.2, 0.2, 1.0)
    text_obj.data.materials.append(make_material(f"Material_{node['square']}", color))

    anim_targets.setdefault(node["square"], []).append(text_obj)
    return text_obj


def create_ascii_piece(
    node: dict,
    scale: float = 0.8,
    z_offset: float = -1.0,
    material: bpy.types.Material = None,
):
    """Create a 2D text object to represent a chess piece in ASCII style."""
    piece_char = node["piece_type"]
    if piece_char == "phantom":
        return None

    ascii_x, ascii_y = square_to_board_2d(node["square"])

    curve_data = bpy.data.curves.new(
        name=f"ascii_{piece_char}_{node['square']}", type="FONT"
    )
    curve_data.body = PIECE_SYMBOLS[piece_char]
    curve_data.align_x = "CENTER"
    curve_data.align_y = "CENTER"

    text_obj = bpy.data.objects.new(f"ascii_{piece_char}_{node['square']}", curve_data)
    text_obj.location = (ascii_x, ascii_y, z_offset)
    text_obj.scale = (scale, scale, scale)
    text_obj.rotation_euler = (
        0.0,
        0.0,
        math.pi if node.get("color") == "white" else 0.0,
    )
    bpy.context.collection.objects.link(text_obj)

    if material:
        curve_data.materials.append(material)

    anim_targets.setdefault(node["square"], []).append(text_obj)
    return text_obj


def create_glass_pane(
    z_offset: float,
    color: list = None,
    alpha: float = 0.25,
    roughness: float = 0.1,
    scale: float = 1.0,
    x_offset: float = 0.0,
    y_offset: float = 0.0,
    rotation: tuple = None,
) -> bpy.types.Object:
    """Create a semi-transparent pane matching the board footprint."""
    if color is None:
        color = [0.02, 0.02, 0.05]
    if rotation is None:
        rotation = (0.0, 0.0, 0.0)

    hw = 3.5 * scale

    mesh = bpy.data.meshes.new("glass_pane")
    verts = [(-hw, -hw, 0.0), (hw, -hw, 0.0), (hw, hw, 0.0), (-hw, hw, 0.0)]
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    mesh.update()

    obj = bpy.data.objects.new("glass_pane", mesh)
    obj.location = (x_offset, y_offset, z_offset)
    obj.rotation_euler = rotation
    bpy.context.collection.objects.link(obj)

    mat = bpy.data.materials.new(name="glass_pane_mat")
    mat.use_nodes = True
    try:
        mat.surface_render_method = "BLENDED"
    except AttributeError:
        mat.blend_method = "BLEND"
        mat.shadow_method = "NONE"

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    rgb = tuple(color)[:3]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Alpha"].default_value = alpha
    bsdf.inputs["Roughness"].default_value = roughness

    obj.data.materials.append(mat)
    return obj


def create_asterisk(
    square: str,
    z_offset: float = -0.5,
    scale: float = 0.5,
    material: bpy.types.Material = None,
) -> bpy.types.Object:
    """Create an asterisk text object at a board square position."""
    x, y = square_to_board_2d(square)

    curve_data = bpy.data.curves.new(name=f"asterisk_{square}", type="FONT")
    curve_data.body = "*"
    curve_data.align_x = "CENTER"
    curve_data.align_y = "CENTER"

    text_obj = bpy.data.objects.new(f"asterisk_{square}", curve_data)
    text_obj.location = (x, y, z_offset)
    text_obj.scale = (scale, scale, scale)
    bpy.context.collection.objects.link(text_obj)

    if material:
        curve_data.materials.append(material)

    anim_targets.setdefault(square, []).append(text_obj)
    return text_obj


def create_link_line(
    square_from: str,
    square_to: str,
    z_offset: float = -0.5,
    thickness: float = 0.02,
    material: bpy.types.Material = None,
) -> bpy.types.Object:
    """Create a curve object connecting two board squares."""
    sx, sy = square_to_board_2d(square_from)
    ex, ey = square_to_board_2d(square_to)

    curve_data = bpy.data.curves.new(
        name=f"link_{square_from}_{square_to}", type="CURVE"
    )
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = thickness

    spline = curve_data.splines.new("POLY")
    spline.points.add(1)
    spline.points[0].co = (sx, sy, z_offset, 1.0)
    spline.points[1].co = (ex, ey, z_offset, 1.0)

    curve_obj = bpy.data.objects.new(f"link_{square_from}_{square_to}", curve_data)
    bpy.context.collection.objects.link(curve_obj)

    if material:
        curve_obj.data.materials.append(material)

    edge_targets.setdefault(square_from, []).append((curve_obj, 0))
    edge_targets.setdefault(square_to, []).append((curve_obj, 1))
    return curve_obj
