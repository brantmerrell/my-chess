"""Blender property definitions."""

import os
import bpy
from bpy.types import PropertyGroup
from bpy.props import StringProperty, EnumProperty

from .models import SAMPLE_SETUPS 


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
        name="Connection Type",
        description="Type of piece relationships to visualize",
        items=[
            ('none', 'None', 'No connections between pieces'),
            ('adjacencies', 'Adjacencies', 'Show adjacent piece relationships'),
            ('links', 'Links', 'Show legal move connections'),
            ('king_box', 'King Box', 'Show king safety box relationships'),
        ],
        default='none',
    )
