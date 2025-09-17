#!/bin/bash

# Test graphdag endpoint by first getting links, then sending to graphdag

echo "Step 1: Getting links from chess position..."
LINKS_RESPONSE=$(curl -s "https://connector.chess.jbm.eco/links/?fen_string=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201")

echo "Step 2: Extracting edges from links response..."
# Extract just the edges array from the response
EDGES=$(echo "$LINKS_RESPONSE" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
edges_data = data.get('edges', [])
# Convert to format expected by graphdag endpoint
edges_formatted = [{'source': edge['source'], 'target': edge['target']} for edge in edges_data]
print(json.dumps({'edges': edges_formatted}))
")

echo "Step 3: Sending edges to graphdag endpoint..."
echo "$EDGES" | curl -X PUT "https://connector.chess.jbm.eco/graphdag" \
  -H "Content-Type: application/json" \
  -d @-

echo ""
echo "Done!"

