#!/bin/bash

output_file="my-chess-ts.txt"

rm $output_file

find . -maxdepth 2 -print0 | xargs -0 -I {} bash -c '
    echo "=== File: {} ===" >> '"$output_file"'
    cat "{}" >> '"$output_file"'
    echo -e "\n\n" >> '"$output_file"'
'

echo "All files have been combined into $output_file"
