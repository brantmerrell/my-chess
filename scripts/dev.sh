#!/usr/bin/env bash
# Coordinator for local (non-Docker) dev: allocates ephemeral ports for the
# connector (FastAPI) and ascii-chess-ts (CRA dev server), then hands the
# connector's port to the frontend via an env file it reads at startup.
# See ../diagrams/manual/dev/ports.d2 (layer 2).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [ ! -x connector/vconnector/bin/uvicorn ]; then
  echo "connector/vconnector not found — run: cd connector && python3 -m venv vconnector && vconnector/bin/pip install -r requirements.txt" >&2
  exit 1
fi

read -r CONNECTOR_PORT FRONTEND_PORT < <(python3 -c '
import socket
s1 = socket.socket(); s1.bind(("127.0.0.1", 0))
s2 = socket.socket(); s2.bind(("127.0.0.1", 0))
print(s1.getsockname()[1], s2.getsockname()[1])
s1.close(); s2.close()
')

echo "my-chess dev: connector -> http://localhost:${CONNECTOR_PORT}  ascii-chess-ts -> http://localhost:${FRONTEND_PORT}"

# Hand the connector's port to the frontend via a port file it reads at
# startup (CRA loads .env.development.local automatically on `npm start`).
cat > ascii-chess-ts/.env.development.local <<EOF
REACT_APP_CONNECTOR_URL=http://localhost:${CONNECTOR_PORT}
PORT=${FRONTEND_PORT}
EOF

(
  cd connector
  PORT="${CONNECTOR_PORT}" vconnector/bin/uvicorn main:app --host 0.0.0.0 --port "${CONNECTOR_PORT}" --reload
) &
CONNECTOR_PID=$!

cleanup() {
  kill "${CONNECTOR_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd ascii-chess-ts
BROWSER=none npm start
