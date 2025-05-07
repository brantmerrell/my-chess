#!/bin/bash

output_file="my-chess.txt"
[ -f "$output_file" ] && rm "$output_file"

declare -a focus_files=(
    "./ascii-chess-ts/Dockerfile"
    "./connector/Dockerfile"
    "./connector/requirements.txt"
    "./local.docker-compose.yml"
    "./prototype-shiny/app.R"
    "./prototype-shiny/server.R"
    "./prototype-shiny/ui.R"

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

find . \( -type d \( \
    -name obj -o \
    -name .git -o \
    -name node_modules \
    \) -prune \) -o -type f \( \
    -name "*py" -o \
    -name "*ts" -o \
    -name "*tsx" \
\) -print0 | while IFS= read -r -d $'\0' file; do
    if [[ ! " ${focus_files[*]} " =~ " ${file} " ]]; then
        echo "=== $file ===" >> "$output_file"
    fi
done



echo "Fully included files: ${#focus_files[@]}"
echo "Combined file created at: $output_file"

