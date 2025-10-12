"""Blender UI panels."""

import bpy
from bpy.types import Panel


class BLCHESS_PT_main_panel(Panel):
    """
    Main panel for chess renderer in the 3D viewport sidebar.
    """

    bl_label = "Blend Chess"
    bl_idname = "BLCHESS_PT_main_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Blend Chess"

    def draw(self, context):
        """Draw the panel UI."""
        layout = self.layout
        props = context.scene.blchess_renderer

        layout.prop(props, "connector_url")

        layout.separator()
        layout.label(text="Connection Type:")
        layout.prop(props, "connection_type", text="")

        layout.separator()
        layout.label(text="Board State:")
        layout.prop(props, "fen_string", text="")

        layout.separator()
        layout.operator("blchess.submit_fen", text="Submit FEN", icon='PLAY')
