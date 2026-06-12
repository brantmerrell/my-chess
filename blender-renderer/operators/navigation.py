"""History navigation operators (start, backward, forward, end)."""

from bpy.types import Operator

from .helpers import render_current_fen, load_history, trigger_animation


class BLCHESS_OT_go_to_start(Operator):
    """Jump to the first position in history."""

    bl_idname = "blchess.go_to_start"
    bl_label = "Go to Start"
    bl_description = "Jump to the first position in history"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = load_history(props)

        if not history or props.position_index <= 0:
            self.report({"WARNING"}, "Already at the first position")
            return {"CANCELLED"}

        props.position_index = 0
        props.fen_string = history[0]

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        return {"FINISHED"}


class BLCHESS_OT_go_backward(Operator):
    """Step back one position in history."""

    bl_idname = "blchess.go_backward"
    bl_label = "Previous Position"
    bl_description = "Step back one position in history"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = load_history(props)
        idx = props.position_index

        if idx <= 0 or not history:
            self.report({"WARNING"}, "Already at the first position")
            return {"CANCELLED"}

        from_fen = props.fen_string
        props.position_index = idx - 1
        props.fen_string = history[idx - 1]

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        trigger_animation(from_fen, props.fen_string, connector_url=props.connector_url)
        return {"FINISHED"}


class BLCHESS_OT_go_forward(Operator):
    """Step forward one position in history."""

    bl_idname = "blchess.go_forward"
    bl_label = "Next Position"
    bl_description = "Step forward one position in history"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = load_history(props)
        idx = props.position_index

        if idx >= len(history) - 1 or not history:
            self.report({"WARNING"}, "Already at the latest position")
            return {"CANCELLED"}

        from_fen = props.fen_string
        props.position_index = idx + 1
        props.fen_string = history[idx + 1]

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        trigger_animation(from_fen, props.fen_string, connector_url=props.connector_url)
        return {"FINISHED"}


class BLCHESS_OT_go_to_end(Operator):
    """Jump to the latest position in history."""

    bl_idname = "blchess.go_to_end"
    bl_label = "Go to End"
    bl_description = "Jump to the latest position in history"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = load_history(props)
        last = len(history) - 1

        if not history or props.position_index >= last:
            self.report({"WARNING"}, "Already at the latest position")
            return {"CANCELLED"}

        props.position_index = last
        props.fen_string = history[last]

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        return {"FINISHED"}
