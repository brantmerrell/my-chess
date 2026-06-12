"""Modular Blender utility exports."""

from .geometry import (
    load_board_config,
    resolve_color,
    square_to_blender_loc,
    square_to_board_2d,
    square_to_coords,
)
from .materials import add_procedural_checker, apply_board_material, make_material
from .rendering import (
    render_ascii_layer,
    render_graph_layer,
    render_layer,
    render_usd_layer,
)
from .scene_objects import (
    anim_targets,
    clear_scene,
    create_ascii_piece,
    create_asterisk,
    create_glass_pane,
    create_link_line,
    create_piece,
    edge_targets,
)
from .usd_loader import (
    apply_board_material_textures,
    apply_piece_color,
    create_chessboard,
    import_usd_piece,
)

__all__ = [
    "add_procedural_checker",
    "anim_targets",
    "apply_board_material",
    "apply_board_material_textures",
    "apply_piece_color",
    "clear_scene",
    "create_ascii_piece",
    "create_asterisk",
    "create_chessboard",
    "create_glass_pane",
    "create_link_line",
    "create_piece",
    "edge_targets",
    "import_usd_piece",
    "load_board_config",
    "make_material",
    "render_ascii_layer",
    "render_graph_layer",
    "render_layer",
    "render_usd_layer",
    "resolve_color",
    "square_to_blender_loc",
    "square_to_board_2d",
    "square_to_coords",
]
