"""
Python script to install and register the Blend Chess addon.
Called by dev.sh to load the addon when Blender starts.
"""

import bpy
import sys
import os

addon_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(addon_dir)

if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    os.chdir(addon_dir)

    if addon_dir not in sys.path:
        sys.path.insert(0, addon_dir)

    import importlib.util
    spec = importlib.util.spec_from_file_location("blend_chess_addon", os.path.join(addon_dir, "__init__.py"))
    addon_module = importlib.util.module_from_spec(spec)

    sys.modules['blend_chess_addon'] = addon_module

    spec.loader.exec_module(addon_module)

    try:
        addon_module.unregister()
    except:
        pass

    addon_module.register()
    print("Blend Chess addon loaded")

except Exception as e:
    print(f"Error loading Blend Chess addon: {e}")
    import traceback
    traceback.print_exc()
