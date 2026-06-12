"""Helper functions shared by operators."""

import json

from ..services.connector_service import ConnectorService
from ..utils import (
    anim_targets,
    clear_scene,
    edge_targets,
    load_board_config,
    render_layer,
    square_to_blender_loc,
)
from ..constants import ANIMATION_DURATION_SECONDS, ANIMATION_ARC_HEIGHT
from ..logger import logger

import bpy

# Shared state for piece-move animations (populated by submit_move,
# consumed by BLCHESS_OT_animate_move; list so multiple layers animate in parallel).
pending_anims: list = []


def render_current_fen(operator, context):
    """
    Fetch piece data from the connector and render all enabled layers for
    context.scene.blchess_renderer.fen_string.

    Shared by every operator that needs to (re-)render a position.
    Returns (success: bool, data: dict | None).
    """
    props = context.scene.blchess_renderer
    connector_service = ConnectorService(base_url=props.connector_url)

    operator.report({"INFO"}, f"Fetching position: {props.fen_string}")

    # Determine which layers are needed from board_config
    config = load_board_config()
    layers = config.get("layers", [])

    # Collect layer types that are enabled
    enabled_layer_types = set()
    for layer in layers:
        if layer.get("enabled", False):
            layer_type = layer.get("type")
            if layer_type in {"adjacencies", "links", "king_box", "shadows"}:
                enabled_layer_types.add(layer_type)

    # Make single API call for all needed layers (or "none" if no layers enabled)
    if not enabled_layer_types:
        layers_param = "none"
        operator.report({"INFO"}, "Fetching none (no layers enabled)")
    else:
        layers_param = ",".join(sorted(enabled_layer_types))
        operator.report({"INFO"}, f"Fetching layers: {layers_param}")
    
    data = connector_service.fetch_connections(
        props.fen_string, layers=layers_param
    )
    all_edges = data.get("edges", [])

    operator.report({"INFO"}, "Clearing scene...")
    clear_scene()

    global_config = config.get("global", {})
    nodes = data.get("nodes", [])

    # Render each layer, filtering edges by type
    for layer in layers:
        if not layer.get("enabled", False):
            continue

        layer_type = layer.get("type")

        # Filter edges for this specific layer type
        if layer_type == "adjacencies":
            layer_edges = [e for e in all_edges if e.get("type") == "adjacency"]
        elif layer_type == "links":
            # Links layer shows threat and protection edges
            layer_edges = [
                e for e in all_edges if e.get("type") in {"threat", "protection"}
            ]
        elif layer_type == "king_box":
            # King box shows king movement and blocking edges
            layer_edges = [
                e for e in all_edges if e.get("type", "").startswith("king_")
            ]
        elif layer_type == "shadows":
            # Shadows show caster and shadow edges
            layer_edges = [
                e
                for e in all_edges
                if "caster_" in e.get("type", "") or "shadow_" in e.get("type", "")
            ]
        else:
            # Other layers (usd, ascii, focus) don't use edges
            layer_edges = []

        render_layer(layer, global_config, nodes, edges=layer_edges)

    operator.report(
        {"INFO"},
        f"Rendered {len(nodes)} pieces across {len([l for l in layers if l.get('enabled')])} layers",
    )
    return True, data


def load_history(props):
    """Deserialize position_history from JSON string."""
    try:
        return json.loads(props.position_history) if props.position_history else []
    except (json.JSONDecodeError, AttributeError):
        return []


def save_history(props, history):
    """Serialize position_history to JSON string."""
    props.position_history = json.dumps(history)


def trigger_animation(
    from_fen: str, to_fen: str, connector_url: str = "http://localhost:8000"
):
    """
    After render_current_fen() has rebuilt the scene for to_fen, fetch the
    move diff from the connector, build pending_anims, and invoke the modal.
    """
    try:
        connector = ConnectorService(base_url=connector_url)
        moves = connector.fetch_diff(from_fen, to_fen)
        if not moves:
            return

        for move in moves:
            from_square_str = move["from_square"]
            to_square_str = move["to_square"]
            world_from = square_to_blender_loc(from_square_str)
            world_to = square_to_blender_loc(to_square_str)
            world_delta = world_from - world_to

            for piece_obj in anim_targets.get(to_square_str, []):
                end_loc = piece_obj.location.copy()
                if piece_obj.parent:
                    rot = piece_obj.parent.matrix_world.to_3x3().inverted()
                    local_delta = rot @ world_delta
                else:
                    local_delta = world_delta
                start_loc = end_loc + local_delta
                pending_anims.append(
                    {
                        "piece_name": piece_obj.name,
                        "start_loc": tuple(start_loc),
                        "end_loc": tuple(end_loc),
                        "duration": ANIMATION_DURATION_SECONDS,
                        "arc_height": (
                            ANIMATION_ARC_HEIGHT if piece_obj.parent is None else 0.0
                        ),
                        "square": to_square_str,
                    }
                )

        if pending_anims:
            bpy.ops.blchess.animate_move("INVOKE_DEFAULT")
    except Exception as e:
        logger.error("trigger_animation failed", exc_info=True)
