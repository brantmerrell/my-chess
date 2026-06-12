"""
Blend Chess Addon

Visualize chess positions in Blender using data from the connector API.

This __init__.py serves as the addon entry point and handles registration.
It imports classes from separate modules to keep things organized.
"""

bl_info = {
    "name": "Blend Chess",
    "author": "Josh M",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Sidebar > Blend Chess",
    "description": "Render chess positions from connector API",
    "category": "3D View",
}

import bpy

from .properties import BlendChessProperties
from .operators import (
    BLCHESS_OT_animate_move,
    BLCHESS_OT_submit_fen,
    BLCHESS_OT_select_position,
    BLCHESS_OT_submit_move,
    BLCHESS_OT_undo_move,
    BLCHESS_OT_go_to_start,
    BLCHESS_OT_go_backward,
    BLCHESS_OT_go_forward,
    BLCHESS_OT_go_to_end,
)
from .panels import BLCHESS_PT_main_panel


classes = (
    BlendChessProperties,
    BLCHESS_OT_animate_move,
    BLCHESS_OT_submit_fen,
    BLCHESS_OT_select_position,
    BLCHESS_OT_submit_move,
    BLCHESS_OT_undo_move,
    BLCHESS_OT_go_to_start,
    BLCHESS_OT_go_backward,
    BLCHESS_OT_go_forward,
    BLCHESS_OT_go_to_end,
    BLCHESS_PT_main_panel,
)


def register():
    """
    Register addon classes and properties with Blender.
    """
    for cls in classes:
        bpy.utils.register_class(cls)

    bpy.types.Scene.blchess_renderer = bpy.props.PointerProperty(
        type=BlendChessProperties
    )


def unregister():
    """
    Unregister addon classes and properties from Blender.
    """
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

    del bpy.types.Scene.blchess_renderer


if __name__ == "__main__":
    register()
