"""Blender UI panels."""

import bpy
from bpy.types import Panel


class BLCHESS_PT_main_panel(Panel):
    """Main panel for chess renderer in the 3D viewport sidebar."""

    bl_label = "Blend Chess"
    bl_idname = "BLCHESS_PT_main_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Blend Chess"

    def draw(self, context):
        layout = self.layout
        props = context.scene.blchess_renderer

        # ------------------------------------------------------------------ #
        # SelectPosition                                                       #
        # ------------------------------------------------------------------ #
        layout.label(text="Select Position:")
        row = layout.row(align=True)
        row.prop(props, "selected_setup", text="")
        row.operator("blchess.select_position", text="Load", icon='FILE_REFRESH')

        layout.separator()

        # ------------------------------------------------------------------ #
        # FenInput                                                             #
        # ------------------------------------------------------------------ #
        layout.label(text="FEN String:")
        layout.prop(props, "fen_string", text="")
        layout.prop(props, "connection_type", text="Focus")
        layout.operator("blchess.submit_fen", text="Submit FEN", icon='PLAY')

        layout.separator()

        # ------------------------------------------------------------------ #
        # MoveControls                                                         #
        # ------------------------------------------------------------------ #
        layout.label(text="Move:")
        row = layout.row(align=True)
        row.prop(props, "move_input", text="")
        row.operator("blchess.submit_move", text="", icon='FORWARD')
        layout.operator("blchess.undo_move", text="Undo Move", icon='LOOP_BACK')

        layout.separator()

        # ------------------------------------------------------------------ #
        # NavigationControls                                                   #
        # ------------------------------------------------------------------ #
        history_len = 0
        try:
            import json
            history_len = len(json.loads(props.position_history)) if props.position_history else 0
        except Exception:
            pass

        idx_display = props.position_index + 1 if props.position_index >= 0 else 0
        layout.label(text=f"History: {idx_display} / {history_len}")

        row = layout.row(align=True)
        row.operator("blchess.go_to_start",  text="", icon='REW')
        row.operator("blchess.go_backward",  text="", icon='PLAY_REVERSE')
        row.operator("blchess.go_forward",   text="", icon='PLAY')
        row.operator("blchess.go_to_end",    text="", icon='FF')

        layout.separator()
