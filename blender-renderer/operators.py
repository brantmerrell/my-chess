"""Blender operators (actions/buttons)."""

import bpy
from bpy.types import Operator

from .constants import PIECE_SYMBOLS
from .utils import square_to_coords, clear_scene, create_piece
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

            if props.connection_type == 'adjacencies':
                data = connector_service.fetch_adjacencies(props.fen_string)
            elif props.connection_type == 'links':
                data = connector_service.fetch_links(props.fen_string)
            elif props.connection_type == 'none':
                data = connector_service.fetch_none(props.fen_string)
            elif props.connection_type == 'king_box':
                data = connector_service.fetch_king_box(props.fen_string)
            else:
                self.report({'ERROR'}, f"Unknown connection type: {props.connection_type}")
                return {'CANCELLED'}

            self.report({'INFO'}, "Clearing scene...")
            clear_scene()

            self.report({'INFO'}, f"Creating {len(data['nodes'])} pieces...")
            for node in data['nodes']:
                create_piece(node)

            self.report({'INFO'}, f"Successfully rendered {len(data['nodes'])} pieces")
            return {'FINISHED'}

        except Exception as e:
            self.report({'ERROR'}, f"Error: {str(e)}")
            return {'CANCELLED'}
