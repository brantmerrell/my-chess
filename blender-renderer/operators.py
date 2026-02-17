"""Blender operators (actions/buttons)."""

import bpy
from bpy.types import Operator

from .constants import PIECE_SYMBOLS
from .utils import clear_scene, load_board_config, render_layer
from .services.connector_service import ConnectorService


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
        """Execute the FEN submission and rendering."""
        props = context.scene.blchess_renderer

        try:
            connector_service = ConnectorService(base_url=props.connector_url)

            self.report({'INFO'}, f"Fetching {props.connection_type}: {props.fen_string}")

            links_data = None
            adjacencies_data = None
            king_box_data = None

            if props.connection_type == 'adjacencies':
                data = connector_service.fetch_adjacencies(props.fen_string)
            elif props.connection_type == 'links':
                data = connector_service.fetch_links(props.fen_string)
                links_data = data  # reuse for links layer
            elif props.connection_type == 'adjacencies':
                data = connector_service.fetch_adjacencies(props.fen_string)
                adjacencies_data = data  # reuse for adjacencies layer
            elif props.connection_type == 'king_box':
                data = connector_service.fetch_king_box(props.fen_string)
                king_box_data = data  # reuse for king_box layer
            elif props.connection_type == 'none':
                data = connector_service.fetch_none(props.fen_string)
            elif props.connection_type == 'king_box':
                data = connector_service.fetch_king_box(props.fen_string)
            else:
                self.report({'ERROR'}, f"Unknown connection type: {props.connection_type}")
                return {'CANCELLED'}

            self.report({'INFO'}, "Clearing scene...")
            clear_scene()

            # Load board configuration
            config = load_board_config()
            global_config = config.get('global', {})
            layers = config.get('layers', [])

            # Fetch links data for the links layer if not already fetched
            has_links_layer = any(l.get('type') == 'links' and l.get('enabled') for l in layers)
            if has_links_layer and links_data is None:
                self.report({'INFO'}, "Fetching links for links layer...")
                links_data = connector_service.fetch_links(props.fen_string)

            links_edges = links_data.get('edges', []) if links_data else []

            has_adjacencies_layer = any(l.get('type') == 'adjacencies' and l.get('enabled') for l in layers)
            if has_adjacencies_layer and adjacencies_data is None:
                self.report({'INFO'}, "Fetching adjacencies for adjacencies layer...")
                adjacencies_data = connector_service.fetch_adjacencies(props.fen_string)

            adjacencies_edges = adjacencies_data.get('edges', []) if adjacencies_data else []

            # Fetch king_box data for the king_box layer if not already fetched
            has_king_box_layer = any(l.get('type') == 'king_box' and l.get('enabled') for l in layers)
            if has_king_box_layer and king_box_data is None:
                self.report({'INFO'}, "Fetching king_box for king_box layer...")
                king_box_data = connector_service.fetch_king_box(props.fen_string)

            king_box_edges = king_box_data.get('edges', []) if king_box_data else []

            # Render each enabled layer
            for layer in layers:
                if layer.get('enabled', False):
                    layer_name = layer.get('name', 'Unknown')
                    self.report({'INFO'}, f"Rendering layer: {layer_name}")
                    edges = []
                    if layer.get('type') == 'links':
                        edges = links_edges
                    if layer.get('type') == 'adjacencies':
                        edges = adjacencies_edges
                    render_layer(layer, global_config, data['nodes'], edges=edges)

            self.report({'INFO'}, f"Successfully rendered {len(data['nodes'])} pieces across {len([l for l in layers if l.get('enabled')])} layers")
            return {'FINISHED'}

        except Exception as e:
            self.report({'ERROR'}, f"Error: {str(e)}")
            return {'CANCELLED'}
