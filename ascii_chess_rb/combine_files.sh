#!/bin/bash

output_file="ascii_chess_rb.txt"

rm $output_file

find . -type f -name "*.rb" -print0 | xargs -0 -I {} bash -c '
    echo "=== File: {} ===" >> '"$output_file"'
    cat "{}" >> '"$output_file"'
    echo -e "\n\n" >> '"$output_file"'
'

find . -type f -name "*.css" -print0 | xargs -0 -I {} bash -c '
    echo "=== File: {} ===" >> '"$output_file"'
    cat "{}" >> '"$output_file"'
    echo -e "\n\n" >> '"$output_file"'
'

echo "All files have been combined into $output_file"
