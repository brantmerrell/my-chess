"""Blender property definitions."""

import os
import bpy
from bpy.types import PropertyGroup
from bpy.props import StringProperty, EnumProperty, BoolProperty, IntProperty

from .models import SAMPLE_SETUPS
from .constants import get_colors_for_usage

_SETUP_ITEMS = [(str(i), s.name, s.description) for i, s in enumerate(SAMPLE_SETUPS)]

# Create enum items for board colors (filtered by usage type)
_BOARD_COLOR_ITEMS = [
    (name, name.title(), f"Use {name} color")
    for name in sorted(get_colors_for_usage("board").keys())
]


def _on_board_color_change(self, context):
    """Update callback when board_material_color changes - re-apply board material."""
    from .utils import load_board_config

    # Find the chessboard object
    board_obj = bpy.data.objects.get("Chessboard")
    if not board_obj:
        return

    # Load config to get material settings
    try:
        config = load_board_config()
        usd_layer = next(
            (l for l in config.get("layers", []) if l.get("type") == "usd"), None
        )
        if not usd_layer:
            return

        board_config = usd_layer.get("board", {})
        material_config = board_config.get("material", {})

        # Re-apply the board material with new color
        from .utils import apply_board_material_textures

        apply_board_material_textures(board_obj, material_config=material_config)

    except Exception as e:
        print(f"Error updating board color: {e}")
        import traceback

        traceback.print_exc()


def _on_move_input_change(self, context):
    """Update callback when move_input changes - submit move on Enter (non-empty confirm)."""
    if not self.move_input.strip():
        return
    bpy.ops.blchess.submit_move()


class BlendChessProperties(PropertyGroup):
    """Properties for the Blend Chess addon"""

    fen_string: StringProperty(
        name="FEN String",
        description="Chess position in FEN notation",
        default=SAMPLE_SETUPS[0].fen,
        maxlen=100,
    )

    connector_url: StringProperty(
        name="Connector URL",
        description="Base URL for the connector API",
        default=os.getenv("CONNECTOR_URL", "http://localhost:8000"),
        maxlen=200,
    )

    selected_setup: EnumProperty(
        name="Position",
        description="Select a preset chess position",
        items=_SETUP_ITEMS,
        default="0",
    )

    move_input: StringProperty(
        name="Move",
        description="Chess move in UCI (e2e4) or SAN (e4) notation",
        default="",
        maxlen=10,
        update=_on_move_input_change,
    )

    position_history: StringProperty(
        name="Position History",
        description="JSON-serialized list of FEN strings",
        default="[]",
    )

    position_index: IntProperty(
        name="Position Index",
        description="Current index into position_history",
        default=-1,
    )

    board_material_color: EnumProperty(
        name="Board Color",
        description="Color for the board material specular tint",
        items=_BOARD_COLOR_ITEMS,
        default="forestgreen",
        update=_on_board_color_change,
    )
