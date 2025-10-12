#!/bin/bash

ADDON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${ADDON_DIR}/.env" ]; then
    echo "Loading environment variables from .env"
    export $(grep -v '^#' "${ADDON_DIR}/.env" | xargs)
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    BLENDER="blender"
else
    BLENDER="/c/Program Files/Blender Foundation/Blender 4.0/blender.exe"
fi

echo "Launching Blender with Blend Chess addon..."
echo "Look for the 'Blend Chess' tab in the 3D Viewport sidebar (press N)"

"$BLENDER" --python "${ADDON_DIR}/install_addon.py"
