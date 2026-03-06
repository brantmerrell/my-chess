"""Blender property definitions."""

import os
import bpy
from bpy.types import PropertyGroup
from bpy.props import StringProperty, EnumProperty, BoolProperty, IntProperty

from .models import SAMPLE_SETUPS
from .constants import get_colors_for_usage

_SETUP_ITEMS = [(str(i), s.name, s.description) for i, s in enumerate(SAMPLE_SETUPS)]

# Create enum items for board colors (filtered by usage type)
_BOARD_COLOR_ITEMS = [(name, name.title(), f"Use {name} color") for name in sorted(get_colors_for_usage("board").keys())]


def _on_board_color_change(self, context):
    """Update callback when board_material_color changes - re-apply board material."""
    from .utils import load_board_config

    # Find the chessboard object
    board_obj = bpy.data.objects.get("Chessboard")
    if not board_obj:
        return

    # Load config to get material settings
    try:
        config = load_board_config()
        usd_layer = next(
            (l for l in config.get("layers", []) if l.get("type") == "usd"),
            None
        )
        if not usd_layer:
            return

        board_config = usd_layer.get('board', {})
        material_config = board_config.get('material', {})

        # Re-apply the board material with new color
        from .utils import _apply_board_material
        _apply_board_material(board_obj, material_config=material_config)

    except Exception as e:
        print(f"Error updating board color: {e}")
        import traceback
        traceback.print_exc()


def _on_connection_type_change(self, context):
    """Update callback when connection_type changes - only re-render the Focus layer."""
    props = context.scene.blchess_renderer

    # Only re-render if we have a valid FEN string and it's not the initial load
    if not props.fen_string or not props.fen_string.strip():
        return

    # Check if there are any objects in the scene (indicating something was already rendered)
    if not any(obj for obj in bpy.data.objects):
        return

    # Import here to avoid circular dependency
    from .services.connector_service import ConnectorService
    from .utils import load_board_config, render_layer

    try:
        # Load config to get Focus layer settings
        config = load_board_config()
        focus_layer = next(
            (l for l in config.get("layers", []) if l.get("type") == "focus"), None
        )
        if not focus_layer or not focus_layer.get("enabled"):
            return

        # Delete only Focus layer objects (at z=2.5)
        focus_offset = focus_layer.get("offset", {})
        focus_z = focus_offset.get("z", 2.5) if isinstance(focus_offset, dict) else focus_layer.get("z_offset", 2.5)
        tolerance = 0.2  # Z-position tolerance

        objects_to_delete = []
        print(f"\n=== Clearing Focus layer at z={focus_z} ===")
        for obj in bpy.data.objects:
            should_delete = False
            z_diff = abs(obj.location.z - focus_z)

            # Check if object location is at the Focus layer z-position
            if z_diff < tolerance:
                should_delete = True
            # For curve objects (link lines), check if their vertices are at focus_z
            elif obj.type == 'CURVE' and obj.data.splines:
                for spline in obj.data.splines:
                    if hasattr(spline, 'points') and len(spline.points) > 0:
                        # Check first point's z-coordinate
                        point_z = spline.points[0].co[2]
                        if abs(point_z - focus_z) < tolerance:
                            should_delete = True
                            break

            if should_delete:
                print(f"Found object to delete: {obj.name} (type={obj.type}) at z={obj.location.z}")
                objects_to_delete.append(obj)

        print(f"Total objects to delete: {len(objects_to_delete)}")

        # Delete the identified objects and their data
        for obj in objects_to_delete:
            obj_name = obj.name
            # Store the data before removing the object
            obj_data = obj.data
            bpy.data.objects.remove(obj, do_unlink=True)
            print(f"Deleted object: {obj_name}")

            # Clean up orphaned mesh/curve/font data
            if obj_data and obj_data.users == 0:
                if isinstance(obj_data, bpy.types.Mesh):
                    bpy.data.meshes.remove(obj_data)
                elif isinstance(obj_data, bpy.types.Curve):
                    bpy.data.curves.remove(obj_data)

        # Also clean up orphaned materials at this z-level
        for mat in list(bpy.data.materials):
            if mat.users == 0 and (
                "glass_pane" in mat.name
                or "_asterisk" in mat.name
                or "_edge_" in mat.name
            ):
                bpy.data.materials.remove(mat)

        # If connection_type is 'none', just clear and don't render anything
        if props.connection_type == "none":
            print("Connection type is 'none', cleared Focus layer without re-rendering")
            return

        # Fetch data for the new connection type
        connector_service = ConnectorService(base_url=props.connector_url)

        data = None
        edges = []
        if props.connection_type == "adjacencies":
            data = connector_service.fetch_adjacencies(props.fen_string)
            edges = data.get("edges", [])
        elif props.connection_type == "links":
            data = connector_service.fetch_links(props.fen_string)
            edges = data.get("edges", [])
        elif props.connection_type == "king_box":
            data = connector_service.fetch_king_box(props.fen_string)
            edges = data.get("edges", [])
        elif props.connection_type == "shadows":
            data = connector_service.fetch_shadows(props.fen_string)
            edges = data.get("edges", [])

        if data is None:
            return

        # Find the matching graph layer config to mirror its visual settings
        matching_layer = next(
            (
                l
                for l in config.get("layers", [])
                if l.get("type") == props.connection_type
            ),
            None,
        )

        if matching_layer and props.connection_type != "none":
            # Merge matching layer's config with Focus layer's offset and name
            focus_layer = {
                **matching_layer,
                "offset": focus_layer["offset"],
                "name": focus_layer["name"],
                "type": "focus",
            }

        # Re-render only the Focus layer
        global_config = config.get("global", {})
        render_layer(focus_layer, global_config, data["nodes"], edges=edges)

    except Exception as e:
        print(f"Error updating connection type: {e}")
        import traceback

        traceback.print_exc()


class BlendChessProperties(PropertyGroup):
    """Properties for the Blend Chess addon"""

    fen_string: StringProperty(
        name="FEN String",
        description="Chess position in FEN notation",
        default=SAMPLE_SETUPS[0].fen,
        maxlen=100,
    )

    connector_url: StringProperty(
        name="Connector URL",
        description="Base URL for the connector API",
        default=os.getenv("CONNECTOR_URL", "http://localhost:8000"),
        maxlen=200,
    )

    connection_type: EnumProperty(
        name="Focus",
        description="Type of piece relationships to focus on",
        items=[
            ("none", "None", "No connections between pieces"),
            ("adjacencies", "Adjacencies", "Show adjacent piece relationships"),
            ("links", "Links", "Show legal move connections"),
            ("king_box", "King Box", "Show king safety box relationships"),
            ("shadows", "Shadows", "Show shadows cast by blocking pieces"),
        ],
        default="none",
        update=_on_connection_type_change,
    )

    selected_setup: EnumProperty(
        name="Position",
        description="Select a preset chess position",
        items=_SETUP_ITEMS,
        default="0",
    )

    move_input: StringProperty(
        name="Move",
        description="Chess move in UCI (e2e4) or SAN (e4) notation",
        default="",
        maxlen=10,
    )

    position_history: StringProperty(
        name="Position History",
        description="JSON-serialized list of FEN strings",
        default="[]",
    )

    position_index: IntProperty(
        name="Position Index",
        description="Current index into position_history",
        default=-1,
    )

    board_material_color: EnumProperty(
        name="Board Color",
        description="Color for the board material specular tint",
        items=_BOARD_COLOR_ITEMS,
        default="forestgreen",
        update=_on_board_color_change,
    )
