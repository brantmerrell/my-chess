"""Layer rendering helpers."""

from typing import Any, Dict

import bpy

from ..constants import USD_PIECE_SCALE
from .geometry import resolve_color
from .materials import make_material
from .scene_objects import (
    create_ascii_piece,
    create_asterisk,
    create_glass_pane,
    create_link_line,
    create_piece,
)
from .usd_loader import create_chessboard

GRAPH_LAYER_TYPES = {"adjacencies", "links", "king_box", "shadows", "focus"}
DEFAULT_EDGE_COLOR = [0.722, 0.525, 0.043, 1.0]


def render_layer(
    layer_config: Dict[str, Any],
    global_config: Dict[str, Any],
    nodes: list,
    edges: list = None,
):
    """Render a single board layer based on configuration."""
    if not layer_config.get("enabled", False):
        return

    if edges is None:
        edges = []

    layer_type = layer_config.get("type")
    offset_config = layer_config.get("offset", {})
    if isinstance(offset_config, dict):
        offset_x = offset_config.get("x", 0.0)
        offset_y = offset_config.get("y", 0.0)
        offset_z = offset_config.get("z", 0.0)
    else:
        offset_x = 0.0
        offset_y = 0.0
        offset_z = layer_config.get("z_offset", 0.0)

    rotation_config = layer_config.get("rotation", {})
    rotation_x = rotation_config.get("x", 0.0)
    rotation_y = rotation_config.get("y", 0.0)
    rotation_z = rotation_config.get("z", 0.0)

    offset = (offset_x, offset_y, offset_z)
    rotation = (rotation_x, rotation_y, rotation_z)

    layer_parent = None
    if any((offset_x, offset_y, offset_z, rotation_x, rotation_y, rotation_z)):
        layer_name = layer_config.get("name", layer_type)
        layer_parent = bpy.data.objects.new(f"{layer_name}_parent", None)
        layer_parent.location = (offset_x, offset_y, offset_z)
        layer_parent.rotation_euler = (rotation_x, rotation_y, rotation_z)
        bpy.context.collection.objects.link(layer_parent)

    pane_cfg = layer_config.get("glass_pane")
    if pane_cfg:
        pane_obj = create_glass_pane(
            0.0 if layer_parent else offset_z,
            color=resolve_color(pane_cfg.get("color"), [0.02, 0.02, 0.05]),
            alpha=pane_cfg.get("alpha", 0.25),
            roughness=pane_cfg.get("roughness", 0.1),
            scale=pane_cfg.get("scale", 1.0),
            x_offset=0.0 if layer_parent else offset_x,
            y_offset=0.0 if layer_parent else offset_y,
            rotation=(
                (0.0, 0.0, 0.0)
                if layer_parent
                else (rotation_x, rotation_y, rotation_z)
            ),
        )
        if layer_parent:
            pane_obj.parent = layer_parent
    elif layer_config.get("board", {}).get("show", False):
        if layer_type == "usd" and layer_config["board"].get("import_usd", False):
            create_chessboard(
                material_config=layer_config.get("board", {}).get("material", {})
            )

    if layer_type == "usd":
        render_usd_layer(layer_config, global_config, nodes, offset, rotation)
    elif layer_type == "ascii":
        render_ascii_layer(
            layer_config, global_config, nodes, offset, rotation, layer_parent
        )
    elif layer_type in GRAPH_LAYER_TYPES:
        render_graph_layer(
            layer_config, global_config, nodes, edges, offset, rotation, layer_parent
        )


def render_usd_layer(
    layer_config: Dict[str, Any],
    global_config: Dict[str, Any],
    nodes: list,
    offset: tuple,
    rotation: tuple,
):
    """Render USD 3D pieces layer."""
    piece_config = layer_config.get("pieces", {})
    scale = piece_config.get("scale", USD_PIECE_SCALE)

    rotations = piece_config.get("rotations") or piece_config.get(
        "specific_rotations", {}
    )
    rotation_config = {"rotations": rotations}
    print(f"render_usd_layer: rotation_config = {rotation_config}")

    for node in nodes:
        create_piece(node, scale=scale, rotation_config=rotation_config)


def render_ascii_layer(
    layer_config: Dict[str, Any],
    global_config: Dict[str, Any],
    nodes: list,
    offset: tuple,
    rotation: tuple,
    layer_parent: bpy.types.Object = None,
):
    """Render ASCII text pieces layer."""
    layer_name = layer_config.get("name", "ascii")
    piece_config = layer_config.get("pieces", {})
    scale = piece_config.get("scale", 0.8)
    white_color = piece_config.get("white_color", [0.9, 0.9, 0.9, 1.0])
    black_color = piece_config.get("black_color", [0.2, 0.2, 0.2, 1.0])

    white_mat = make_material(f"{layer_name}_white", white_color)
    black_mat = make_material(f"{layer_name}_black", black_color)

    z_offset = 0.0 if layer_parent else offset[2]
    for node in nodes:
        mat = white_mat if node["color"] == "white" else black_mat
        obj = create_ascii_piece(node, scale=scale, z_offset=z_offset, material=mat)
        if obj and layer_parent:
            obj.parent = layer_parent


def render_graph_layer(
    layer_config: Dict[str, Any],
    global_config: Dict[str, Any],
    nodes: list,
    edges: list,
    offset: tuple,
    rotation: tuple,
    layer_parent: bpy.types.Object = None,
):
    """Render a graph layer with asterisks and connection lines."""
    layer_name = layer_config.get("name", "graph")
    _, _, offset_z = offset

    asterisk_config = layer_config.get("asterisks", {})
    asterisk_scale = asterisk_config.get("scale", 0.5)
    asterisk_color = resolve_color(asterisk_config.get("color"), [1.0, 1.0, 0.0, 1.0])
    asterisk_mat = make_material(f"{layer_name}_asterisk", asterisk_color)

    edge_config = layer_config.get("edges", {})
    edge_thickness = edge_config.get("thickness", 0.02)

    raw_edge_colors = edge_config.get("colors", {})
    if not raw_edge_colors:
        single = edge_config.get("color", DEFAULT_EDGE_COLOR)
        edge_colors = {"default": resolve_color(single, DEFAULT_EDGE_COLOR)}
    else:
        edge_colors = {
            k: resolve_color(v, DEFAULT_EDGE_COLOR) for k, v in raw_edge_colors.items()
        }
        if "default" not in edge_colors:
            edge_colors["default"] = DEFAULT_EDGE_COLOR

    color_mat_cache = {}

    def get_edge_mat(edge_type):
        color = edge_colors.get(edge_type, edge_colors["default"])
        key = tuple(color)
        if key not in color_mat_cache:
            color_mat_cache[key] = make_material(
                f"{layer_name}_edge_{edge_type}", color
            )
        return color_mat_cache[key]

    z_offset = 0.0 if layer_parent else offset_z

    for node in nodes:
        obj = create_asterisk(
            node["square"],
            z_offset=z_offset,
            scale=asterisk_scale,
            material=asterisk_mat,
        )
        if obj and layer_parent:
            obj.parent = layer_parent

    for edge in edges:
        source = (
            edge.get("source")
            or edge.get("from")
            or edge.get("from_square")
            or edge.get("start")
        )
        target = (
            edge.get("target")
            or edge.get("to")
            or edge.get("to_square")
            or edge.get("end")
        )

        if source and target:
            obj = create_link_line(
                source,
                target,
                z_offset=z_offset,
                thickness=edge_thickness,
                material=get_edge_mat(edge.get("type", "default")),
            )
            if obj and layer_parent:
                obj.parent = layer_parent
