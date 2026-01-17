# Heroku Deployment Guide

## Current Deployment (Docker Container with Diagon)

The app is deployed using Docker containers on Heroku with the `diagon` binary installed for graphdag functionality.

### Deploy Updates

```bash
git subtree push --prefix=connector heroku main
```

### Monitor Deployment

```bash
heroku logs --tail -a ascii-chess-connector
```

```bash
heroku releases -a ascii-chess-connector
```

## Testing Endpoints

All endpoints are working at: https://ascii-chess-connector-3fac027ebe4d.herokuapp.com/

Health check
```bash
curl https://ascii-chess-connector-3fac027ebe4d.herokuapp.com/health
```

Links endpoint

```bash
curl "https://connector.chess.jbm.eco/links/?fen_string=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201" 
```

Adjacencies endpoint

```bash
curl "https://connector.chess.jbm.eco/adjacencies/?fen_string=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201" 
```

Shadows endpoint
```bash
curl "https://connector.chess.jbm.eco/shadows/?fen_string=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201" 
```

GraphDAG endpoint (use links data to generate ASCII graph)
```bash
LINKS_RESPONSE=$(curl -s "https://connector.chess.jbm.eco/links/?fen_string=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201")

EDGES=$(echo "$LINKS_RESPONSE" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
edges_data = data.get('edges', [])
# Convert to format expected by graphdag endpoint
edges_formatted = [{'source': edge['source'], 'target': edge['target']} for edge in edges_data]
print(json.dumps({'edges': edges_formatted}))
")

echo "$EDGES" | curl -X PUT "https://connector.chess.jbm.eco/graphdag" \
  -H "Content-Type: application/json" \
  -d @-

```

## Troubleshooting

```bash
# Check app status
heroku ps -a ascii-chess-connector

# Restart if needed
heroku restart -a ascii-chess-connector

# View recent logs
heroku logs --tail -n 50 -a ascii-chess-connector

# Rollback if deployment breaks something
heroku releases -a ascii-chess-connector
heroku rollback v[NUMBER] -a ascii-chess-connector
```

## Notes

- Stack: Container (using Dockerfile)
- Dependencies: Python 3.9, FastAPI, diagon binary
- The Dockerfile installs diagon from pre-built .deb on Heroku's amd64 architecture
