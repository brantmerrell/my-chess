#!/bin/bash

ADDON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${ADDON_DIR}/.env" ]; then
    echo "Loading environment variables from .env"
    export $(grep -v '^#' "${ADDON_DIR}/.env" | xargs)
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
    BLENDER_PYTHON="/Applications/Blender.app/Contents/Resources/4.0/python/bin/python3"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    BLENDER="blender"
    BLENDER_PYTHON="$(find /snap/blender/current/5.1/python/bin -name 'python3.*' -type f 2>/dev/null | head -1)"
else
    BLENDER="/c/Program Files/Blender Foundation/Blender 4.0/blender.exe"
    BLENDER_PYTHON=""
fi

if [ -n "$BLENDER_PYTHON" ] && [ -f "$BLENDER_PYTHON" ]; then
    echo "Installing requirements into vendor/..."
    "$BLENDER_PYTHON" -m pip install -r "${ADDON_DIR}/requirements.txt" --target "${ADDON_DIR}/vendor" --quiet
fi

echo "Launching Blender with Blend Chess addon..."
echo "Look for the 'Blend Chess' tab in the 3D Viewport sidebar (press N)"

"$BLENDER" --python "${ADDON_DIR}/install_addon.py"
