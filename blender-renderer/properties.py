"""Blender property definitions."""

import os
import bpy
from bpy.types import PropertyGroup
from bpy.props import StringProperty, EnumProperty, BoolProperty, IntProperty

from .models import SAMPLE_SETUPS

_SETUP_ITEMS = (
    [(str(i), s.name, s.description) for i, s in enumerate(SAMPLE_SETUPS)]
)


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
            ('none', 'None', 'No connections between pieces'),
            ('adjacencies', 'Adjacencies', 'Show adjacent piece relationships'),
            ('links', 'Links', 'Show legal move connections'),
            ('king_box', 'King Box', 'Show king safety box relationships'),
            ('shadows', 'Shadows', 'Show shadows cast by blocking pieces'),
        ],
        default='none',
    )

    selected_setup: EnumProperty(
        name="Position",
        description="Select a preset chess position",
        items=_SETUP_ITEMS,
        default='0',
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

