"""Material and shader node creation utilities."""

import bpy
from typing import Optional, Dict, Any
from .geometry import resolve_color


def make_material(name: str, color: list) -> bpy.types.Material:
    """Create a Principled BSDF material with the given RGBA base color."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = tuple(color)
    return mat


def apply_board_material(
    obj: bpy.types.Object, material_config: Optional[Dict[str, Any]] = None
):
    """
    Apply a material to the chessboard object.

    If material_config is provided, uses those settings; otherwise creates
    a simple default dark wood material.

    Args:
        obj: The chessboard mesh object
        material_config: Dict with 'type' ('simple' or 'checker') and color settings
    """
    if material_config is None:
        material_config = {}

    mat_type = material_config.get("type", "simple")

    # Initialize material
    mat = bpy.data.materials.new(name="BoardMaterial")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Add essential nodes
    output_node = nodes.new(type="ShaderNodeOutputMaterial")
    output_node.location = (400, 0)

    bsdf_node = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf_node.location = (0, 0)

    # Link BSDF to output
    links.new(bsdf_node.outputs["BSDF"], output_node.inputs["Surface"])

    if mat_type == "checker":
        # Use procedural checker pattern for light/dark squares
        light_color = resolve_color(
            material_config.get("light_square_color"), [0.831, 0.686, 0.510, 1.0]  # tan
        )
        dark_color = resolve_color(
            material_config.get("dark_square_color"),
            [0.361, 0.251, 0.200, 1.0],  # dark brown
        )

        add_procedural_checker(
            nodes, links, bsdf_node.inputs["Base Color"], light_color, dark_color
        )

        # Configure BSDF properties for wood-like appearance
        bsdf_node.inputs["Roughness"].default_value = material_config.get(
            "roughness", 0.6
        )
        if "Specular IOR Level" in bsdf_node.inputs:
            bsdf_node.inputs["Specular IOR Level"].default_value = material_config.get(
                "specular", 0.3
            )
        elif "Specular" in bsdf_node.inputs:
            bsdf_node.inputs["Specular"].default_value = material_config.get(
                "specular", 0.3
            )

    else:  # simple
        # Uniform color board
        base_color = resolve_color(
            material_config.get("color"), [0.361, 0.251, 0.200, 1.0]  # dark brown
        )
        bsdf_node.inputs["Base Color"].default_value = base_color
        bsdf_node.inputs["Roughness"].default_value = material_config.get(
            "roughness", 0.6
        )
        if "Specular IOR Level" in bsdf_node.inputs:
            bsdf_node.inputs["Specular IOR Level"].default_value = material_config.get(
                "specular", 0.3
            )
        elif "Specular" in bsdf_node.inputs:
            bsdf_node.inputs["Specular"].default_value = material_config.get(
                "specular", 0.3
            )

    # Apply material to object
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def add_procedural_checker(
    nodes, links, base_color_input, light_color: tuple, dark_color: tuple
):
    """
    Create a procedural checker pattern using Blender shader nodes.

    The board has 64 squares in an 8x8 grid. The USD board is 1.12m × 1.12m
    (half-width = 0.56m), so each square is 0.14m. We need 8 checks per meter
    in both X and Z directions.

    Args:
        nodes: Shader node tree nodes
        links: Shader node tree links
        base_color_input: BSDF Base Color input socket to connect to
        light_color: RGBA tuple for light squares
        dark_color: RGBA tuple for dark squares
    """
    # Create texture coordinate node (gives us object-space UVs)
    tex_coord = nodes.new(type="ShaderNodeTexCoord")
    tex_coord.location = (-800, 0)

    # Create mapping node to scale coordinates
    mapping = nodes.new(type="ShaderNodeMapping")
    mapping.location = (-600, 0)

    # Scale to get 8 checks per meter (board is 1.12m, so 8/1.12 ≈ 7.14)
    # But empirically 4.0 works well with the current board dimensions
    mapping.inputs["Scale"].default_value = (4.0, 4.0, 1.0)

    # Create checker texture
    checker = nodes.new(type="ShaderNodeTexChecker")
    checker.location = (-400, 0)
    checker.inputs["Scale"].default_value = 1.0  # Already scaled by mapping

    # Create ColorRamp to convert checker B&W to our custom colors
    color_ramp = nodes.new(type="ShaderNodeValToRGB")
    color_ramp.location = (-200, 0)
    color_ramp.color_ramp.elements[0].color = dark_color
    color_ramp.color_ramp.elements[1].color = light_color

    # Link nodes: TexCoord → Mapping → Checker → ColorRamp → BSDF
    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], checker.inputs["Vector"])
    links.new(checker.outputs["Fac"], color_ramp.inputs["Fac"])
    links.new(color_ramp.outputs["Color"], base_color_input)
