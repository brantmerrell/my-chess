"""Blender operators (actions/buttons)."""

import json

import bpy
from bpy.types import Operator

from .models import SAMPLE_SETUPS
from .utils import clear_scene, load_board_config, render_layer
from .services.connector_service import ConnectorService


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _render_current_fen(operator, context):
    """
    Fetch piece data from the connector and render all enabled layers for
    context.scene.blchess_renderer.fen_string.

    Shared by every operator that needs to (re-)render a position.
    Returns (success: bool, data: dict | None).
    """
    props = context.scene.blchess_renderer
    connector_service = ConnectorService(base_url=props.connector_url)

    operator.report({'INFO'}, f"Fetching {props.connection_type}: {props.fen_string}")

    adjacencies_data = None
    links_data = None
    king_box_data = None
    shadows_data = None

    if props.connection_type == 'adjacencies':
        data = connector_service.fetch_adjacencies(props.fen_string)
        adjacencies_data = data
    elif props.connection_type == 'links':
        data = connector_service.fetch_links(props.fen_string)
        links_data = data
    elif props.connection_type == 'king_box':
        data = connector_service.fetch_king_box(props.fen_string)
        king_box_data = data
    elif props.connection_type == 'shadows':
        data = connector_service.fetch_shadows(props.fen_string)
        shadows_data = data
    elif props.connection_type == 'none':
        data = connector_service.fetch_none(props.fen_string)
    else:
        operator.report({'ERROR'}, f"Unknown connection type: {props.connection_type}")
        return False, None

    operator.report({'INFO'}, "Clearing scene...")
    clear_scene()

    config = load_board_config()
    global_config = config.get('global', {})
    layers = config.get('layers', [])

    if any(l.get('type') == 'adjacencies' and l.get('enabled') for l in layers) and adjacencies_data is None:
        operator.report({'INFO'}, "Fetching adjacencies for adjacencies layer...")
        adjacencies_data = connector_service.fetch_adjacencies(props.fen_string)

    if any(l.get('type') == 'links' and l.get('enabled') for l in layers) and links_data is None:
        operator.report({'INFO'}, "Fetching links for links layer...")
        links_data = connector_service.fetch_links(props.fen_string)

    if any(l.get('type') == 'king_box' and l.get('enabled') for l in layers) and king_box_data is None:
        operator.report({'INFO'}, "Fetching king_box for king_box layer...")
        king_box_data = connector_service.fetch_king_box(props.fen_string)

    if any(l.get('type') == 'shadows' and l.get('enabled') for l in layers) and shadows_data is None:
        operator.report({'INFO'}, "Fetching shadows for shadows layer...")
        shadows_data = connector_service.fetch_shadows(props.fen_string)

    adjacencies_edges = adjacencies_data.get('edges', []) if adjacencies_data else []
    links_edges = links_data.get('edges', []) if links_data else []
    king_box_edges = king_box_data.get('edges', []) if king_box_data else []
    shadows_edges = shadows_data.get('edges', []) if shadows_data else []

    for layer in layers:
        if layer.get('enabled', False):
            layer_name = layer.get('name', 'Unknown')
            operator.report({'INFO'}, f"Rendering layer: {layer_name}")
            edges = []
            if layer.get('type') == 'adjacencies':
                edges = adjacencies_edges
            if layer.get('type') == 'links':
                edges = links_edges
            if layer.get('type') == 'king_box':
                edges = king_box_edges
            if layer.get('type') == 'shadows':
                edges = shadows_edges
            if layer.get('type') == 'focus':
                if props.connection_type == 'none':
                    continue
                _focus_map = {
                    'adjacencies': adjacencies_edges,
                    'links':       links_edges,
                    'king_box':    king_box_edges,
                    'shadows':     shadows_edges,
                }
                edges = _focus_map.get(props.connection_type, [])
                # Mirror the matching graph layer's visual config exactly
                # (glass pane, asterisk color, edge colors, thickness — everything)
                # but keep the focus layer's own offset and name.
                matching = next(
                    (l for l in layers if l.get('type') == props.connection_type),
                    None,
                )
                if matching:
                    layer = {**matching,
                             'offset': layer['offset'],
                             'name': layer['name'],
                             'type': 'focus'}
            render_layer(layer, global_config, data['nodes'], edges=edges)

    operator.report({'INFO'}, f"Rendered {len(data['nodes'])} pieces across {len([l for l in layers if l.get('enabled')])} layers")
    return True, data


def _load_history(props):
    """Deserialize position_history from JSON string."""
    try:
        return json.loads(props.position_history) if props.position_history else []
    except (json.JSONDecodeError, AttributeError):
        return []


def _save_history(props, history):
    """Serialize position_history to JSON string."""
    props.position_history = json.dumps(history)


# ---------------------------------------------------------------------------
# FenInput equivalent
# ---------------------------------------------------------------------------

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
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}

            # Manual FEN submission resets history to this single position
            _save_history(props, [props.fen_string])
            props.position_index = 0

            return {'FINISHED'}

        except Exception as e:
            self.report({'ERROR'}, f"Error: {str(e)}")
            return {'CANCELLED'}


# ---------------------------------------------------------------------------
# SelectPosition equivalent
# ---------------------------------------------------------------------------

class BLCHESS_OT_select_position(Operator):
    """Load a preset chess position and render it."""

    bl_idname = "blchess.select_position"
    bl_label = "Load Position"
    bl_description = "Load the selected preset position and render it"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer

        try:
            setup = SAMPLE_SETUPS[int(props.selected_setup)]
        except (ValueError, IndexError):
            self.report({'ERROR'}, f"Invalid setup: {props.selected_setup}")
            return {'CANCELLED'}

        props.fen_string = setup.fen
        _save_history(props, [setup.fen])
        props.position_index = 0

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


# ---------------------------------------------------------------------------
# MoveControls equivalent
# ---------------------------------------------------------------------------

class BLCHESS_OT_submit_move(Operator):
    """Apply a chess move to the current position and re-render."""

    bl_idname = "blchess.submit_move"
    bl_label = "Submit Move"
    bl_description = "Apply the move to the current FEN, append it to history, and re-render"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        move_str = props.move_input.strip()

        if not move_str:
            self.report({'WARNING'}, "No move entered")
            return {'CANCELLED'}

        try:
            import chess
        except ImportError:
            self.report({'ERROR'}, "python-chess not installed. Run: pip install chess")
            return {'CANCELLED'}

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
                except (chess.InvalidMoveError, chess.AmbiguousMoveError, ValueError) as e:
                    raise ValueError(f"Invalid move '{move_str}': {e}")

            board.push(move)
            new_fen = board.fen()

        except Exception as e:
            self.report({'ERROR'}, str(e))
            return {'CANCELLED'}

        # Truncate any forward history at current index, then append
        history = _load_history(props)
        if not history:
            history = [props.fen_string]
        idx = props.position_index
        if 0 <= idx < len(history) - 1:
            history = history[:idx + 1]
        history.append(new_fen)
        _save_history(props, history)
        props.position_index = len(history) - 1
        props.fen_string = new_fen
        props.move_input = ""

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


class BLCHESS_OT_undo_move(Operator):
    """Undo the last move and re-render the previous position."""

    bl_idname = "blchess.undo_move"
    bl_label = "Undo Move"
    bl_description = "Remove the last move from history and re-render"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = _load_history(props)

        if len(history) < 2:
            self.report({'WARNING'}, "No moves to undo")
            return {'CANCELLED'}

        history.pop()
        _save_history(props, history)
        props.position_index = len(history) - 1
        props.fen_string = history[-1]

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


# ---------------------------------------------------------------------------
# NavigationControls equivalent
# ---------------------------------------------------------------------------

class BLCHESS_OT_go_to_start(Operator):
    """Jump to the first position in history."""

    bl_idname = "blchess.go_to_start"
    bl_label = "Go to Start"
    bl_description = "Jump to the first position in history"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = _load_history(props)

        if not history or props.position_index <= 0:
            self.report({'WARNING'}, "Already at the first position")
            return {'CANCELLED'}

        props.position_index = 0
        props.fen_string = history[0]

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


class BLCHESS_OT_go_backward(Operator):
    """Step back one position in history."""

    bl_idname = "blchess.go_backward"
    bl_label = "Previous Position"
    bl_description = "Step back one position in history"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = _load_history(props)
        idx = props.position_index

        if idx <= 0 or not history:
            self.report({'WARNING'}, "Already at the first position")
            return {'CANCELLED'}

        props.position_index = idx - 1
        props.fen_string = history[idx - 1]

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


class BLCHESS_OT_go_forward(Operator):
    """Step forward one position in history."""

    bl_idname = "blchess.go_forward"
    bl_label = "Next Position"
    bl_description = "Step forward one position in history"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = _load_history(props)
        idx = props.position_index

        if idx >= len(history) - 1 or not history:
            self.report({'WARNING'}, "Already at the latest position")
            return {'CANCELLED'}

        props.position_index = idx + 1
        props.fen_string = history[idx + 1]

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}


class BLCHESS_OT_go_to_end(Operator):
    """Jump to the latest position in history."""

    bl_idname = "blchess.go_to_end"
    bl_label = "Go to End"
    bl_description = "Jump to the latest position in history"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        props = context.scene.blchess_renderer
        history = _load_history(props)
        last = len(history) - 1

        if not history or props.position_index >= last:
            self.report({'WARNING'}, "Already at the latest position")
            return {'CANCELLED'}

        props.position_index = last
        props.fen_string = history[last]

        try:
            success, _ = _render_current_fen(self, context)
            if not success:
                return {'CANCELLED'}
        except Exception as e:
            self.report({'ERROR'}, f"Render error: {str(e)}")
            return {'CANCELLED'}

        return {'FINISHED'}
