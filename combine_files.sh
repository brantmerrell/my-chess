#!/bin/bash
output_file="my-chess.txt"
[ -f "$output_file" ] && rm "$output_file"

declare -a focus_files=(
    "./ascii-chess-ts/src/App.css"
    "./ascii-chess-ts/src/App.tsx"
    "./ascii-chess-ts/src/app/store.ts"
    "./ascii-chess-ts/src/chess/chessGame.ts"
    "./ascii-chess-ts/src/components/UnifiedChessContainer.tsx"
    "./ascii-chess-ts/src/index.css"
    "./ascii-chess-ts/src/types/chess.ts"
    "./ascii-chess-ts/src/components/UnifiedChessContainer.tsx"
    "./ascii-chess-ts/src/components/BoardDisplay.tsx"
    "./ascii-chess-ts/src/components/BoardDisplay.css"
)

declare -a normalized_focus_files=()
for file in "${focus_files[@]}"; do
    normalized_focus_files+=("${file#./}")
done

for file in "${focus_files[@]}"; do
    if [ -f "$file" ]; then
        {
            echo "=== $file ==="
            cat "$file"
            echo -e "\n\n"
        } >> "$output_file"
    else
        echo "Warning: Selected file not found - $file"
    fi
done

find ascii-chess-ts \( -type d \( \
    -name obj -o \
    -name .git -o \
    -name node_modules \
    \) -prune \) -o -type f \( \
    -name "*py" -o \
    -name "*json" -o \
    -name "*html" -o \
    -name "*css" -o \
    -name "*ts" -o \
    -name "*tsx" \
\) -print0 | while IFS= read -r -d $'\0' file; do
    if [[ ! " ${normalized_focus_files[*]} " =~ " ${file} " ]]; then
        echo "=== $file ===" >> "$output_file"
    fi
done

echo "Fully included files: ${#focus_files[@]}"
echo "Combined file created at: $output_file"

