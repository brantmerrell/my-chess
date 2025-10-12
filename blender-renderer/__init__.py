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
    "location": "View3D > Sidebar > Blend Chess", # TODO: verify that users can find this in View3D > Sidebar > Blind Chess
    "description": "Render chess positions from connector API",
    "category": "3D View", # To-Do: verify that blender tags this somehow
}

import bpy

from .properties import BlendChessProperties
from .operators import BLCHESS_OT_submit_fen
from .panels import BLCHESS_PT_main_panel


classes = (
    BlendChessProperties,
    BLCHESS_OT_submit_fen,
    BLCHESS_PT_main_panel,
)


def register(): # TODO: what happens when this is imported from another file?
    """
    Register addon classes and properties with Blender.
    """
    for cls in classes:
        bpy.utils.register_class(cls)

    bpy.types.Scene.blchess_renderer = bpy.props.PointerProperty(
        type=BlendChessProperties
    )


def unregister(): # TODO: what happens when this is imported from another file?
    """
    Unregister addon classes and properties from Blender.
    """
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

    del bpy.types.Scene.blchess_renderer


if __name__ == "__main__":
    register()
