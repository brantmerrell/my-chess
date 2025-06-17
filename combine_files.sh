#!/bin/bash
output_file="my-chess.txt"
[ -f "$output_file" ] && rm "$output_file"

declare -a focus_files=(
    "ascii-chess-ts/src/App.css"
    "ascii-chess-ts/src/App.tsx"
    "ascii-chess-ts/src/app/store.ts"
    "ascii-chess-ts/src/components/ArcView.css"
    "ascii-chess-ts/src/components/ArcView.tsx"
    "ascii-chess-ts/src/components/BoardDisplay.css"
    "ascii-chess-ts/src/components/BoardDisplay.tsx"
    "ascii-chess-ts/src/components/ChordDiagram.tsx"
    "ascii-chess-ts/src/components/FenInput.tsx"
    "ascii-chess-ts/src/components/GraphView.tsx"
    "ascii-chess-ts/src/components/HistoricalArcView.tsx"
    "ascii-chess-ts/src/components/HistoryTable.tsx"
    "ascii-chess-ts/src/components/MoveControls.css"
    "ascii-chess-ts/src/components/MoveControls.tsx"
    "ascii-chess-ts/src/components/NavigationControls.tsx"
    "ascii-chess-ts/src/components/SelectPosition.tsx"
    "ascii-chess-ts/src/components/UnifiedChessContainer.tsx"
    "ascii-chess-ts/src/data/liChessPuzzle.json"
    "ascii-chess-ts/src/hooks/useChessGame.ts"
    "ascii-chess-ts/src/hooks/useMoveHistory.ts"
    "ascii-chess-ts/src/hooks/useTheme.ts"
    "ascii-chess-ts/src/index.css"
    "ascii-chess-ts/src/models/LiChessPuzzleModel.ts"
    "ascii-chess-ts/src/models/LiChessPuzzleResponse.ts"
    "ascii-chess-ts/src/models/LiChessPuzzleViewModel.ts"
    "ascii-chess-ts/src/reducers/positions/positions.reducers.ts"
    "ascii-chess-ts/src/reducers/puzzles/puzzles.actionTypes.ts"
    "ascii-chess-ts/src/reducers/puzzles/puzzles.actions.ts"
    "ascii-chess-ts/src/reducers/puzzles/puzzles.reducers.ts"
    "ascii-chess-ts/src/reducers/setups/setups.actions.ts"
    "ascii-chess-ts/src/reducers/setups/setups.reducers.ts"
    "ascii-chess-ts/src/services/connector.ts"
    "ascii-chess-ts/src/services/lichess/lichess.service.ts"
    "ascii-chess-ts/src/types/chess.ts"
    "ascii-chess-ts/src/types/visualization.ts"
    "ascii-chess-ts/src/utils.ts"
)

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
    if [[ ! " ${focus_files[*]} " =~ " ${file} " ]]; then
        echo "=== $file ===" >> "$output_file"
    fi
done

echo "Fully included files: ${#focus_files[@]}"
echo "Combined file created at: $output_file"

