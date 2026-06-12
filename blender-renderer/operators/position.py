"""Position submission operators (FEN, preset, move submission, undo)."""

from bpy.types import Operator

from ..models import SAMPLE_SETUPS
from .helpers import render_current_fen, load_history, save_history, trigger_animation


class BLCHESS_OT_submit_fen(Operator):
    """
    Submit FEN string and render chess position.

    Naming convention: BLCHESS_OT_submit_fen
    - BLCHESS: Namespace prefix (blend-chess)
    - OT: Operator Type
    - submit_fen: Action name
    """

    bl_idname = "blchess.submit_fen"
    bl_label = "Submit FEN"
    bl_description = "Fetch and render the chess position from connector"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}

            # Manual FEN submission resets history to this single position
            save_history(props, [props.fen_string])
            props.position_index = 0

            return {"FINISHED"}

        except Exception as e:
            self.report({"ERROR"}, f"Error: {str(e)}")
            return {"CANCELLED"}


class BLCHESS_OT_select_position(Operator):
    """Load a preset chess position and render it."""

    bl_idname = "blchess.select_position"
    bl_label = "Load Position"
    bl_description = "Load the selected preset position and render it"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer

        try:
            setup = SAMPLE_SETUPS[int(props.selected_setup)]
        except (ValueError, IndexError):
            self.report({"ERROR"}, f"Invalid setup: {props.selected_setup}")
            return {"CANCELLED"}

        props.fen_string = setup.fen
        save_history(props, [setup.fen])
        props.position_index = 0

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Error: {str(e)}")
            return {"CANCELLED"}

        return {"FINISHED"}


class BLCHESS_OT_submit_move(Operator):
    """Apply a chess move to the current position and re-render."""

    bl_idname = "blchess.submit_move"
    bl_label = "Submit Move"
    bl_description = (
        "Apply the move to the current FEN, append it to history, and re-render"
    )
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        move_str = props.move_input.strip()

        if not move_str:
            self.report({"WARNING"}, "No move entered")
            return {"CANCELLED"}

        try:
            import chess
        except ImportError:
            self.report({"ERROR"}, "python-chess not installed. Run: pip install chess")
            return {"CANCELLED"}

        try:
            board = chess.Board(props.fen_string)
            move = None

            # Try UCI format first (e.g. e2e4)
            try:
                candidate = chess.Move.from_uci(move_str.lower())
                if candidate in board.legal_moves:
                    move = candidate
            except (chess.InvalidMoveError, ValueError):
                pass

            # Fall back to SAN (e.g. e4, Nf3)
            if move is None:
                try:
                    move = board.parse_san(move_str)
                except (
                    chess.InvalidMoveError,
                    chess.AmbiguousMoveError,
                    ValueError,
                ) as e:
                    raise ValueError(f"Invalid move '{move_str}': {e}")

            board.push(move)
            new_fen = board.fen()
            from_square_str = chess.square_name(move.from_square)
            to_square_str = chess.square_name(move.to_square)

        except Exception as e:
            self.report({"ERROR"}, str(e))
            return {"CANCELLED"}

        old_fen = props.fen_string

        # Truncate any forward history at current index, then append
        history = load_history(props)
        if not history:
            history = [old_fen]
        idx = props.position_index
        if 0 <= idx < len(history) - 1:
            history = history[: idx + 1]
        history.append(new_fen)
        save_history(props, history)
        props.position_index = len(history) - 1
        props.fen_string = new_fen
        props.move_input = ""

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        trigger_animation(old_fen, new_fen, connector_url=props.connector_url)
        return {"FINISHED"}


class BLCHESS_OT_undo_move(Operator):
    """Undo the last move and re-render the previous position."""

    bl_idname = "blchess.undo_move"
    bl_label = "Undo Move"
    bl_description = "Remove the last move from history and re-render"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = load_history(props)

        if len(history) < 2:
            self.report({"WARNING"}, "No moves to undo")
            return {"CANCELLED"}

        from_fen = props.fen_string
        history.pop()
        save_history(props, history)
        props.position_index = len(history) - 1
        props.fen_string = history[-1]

        try:
            success, _ = render_current_fen(self, context)
            if not success:
                return {"CANCELLED"}
        except Exception as e:
            self.report({"ERROR"}, f"Render error: {str(e)}")
            return {"CANCELLED"}

        trigger_animation(from_fen, props.fen_string, connector_url=props.connector_url)
        return {"FINISHED"}
