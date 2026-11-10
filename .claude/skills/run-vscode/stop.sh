#!/usr/bin/env bash
# Stop the test VS Code window and the webview dev servers started by launch.sh.
# Only the instance with the CDP port is closed, never your own VS Code windows.
SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${FM_CDP_PORT:-9333}"

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

if listening "$PORT"; then
  # VS Code ignores SIGTERM, ask it to quit over CDP (Browser.close) instead
  (cd "$SKILL_DIR" && FM_CDP_PORT="$PORT" node -e "
    const { chromium } = require('playwright-core');
    chromium.connectOverCDP('http://127.0.0.1:' + process.env.FM_CDP_PORT)
      .then((b) => b.close())
      .catch(() => {})
      .finally(() => process.exit(0));
  ") >/dev/null 2>&1

  for _ in $(seq 1 15); do
    listening "$PORT" || break
    sleep 1
  done

  if listening "$PORT"; then
    pkill -9 -f "MacOS/Code --remote-debugging-port=$PORT"
    sleep 1
  fi

  if listening "$PORT"; then
    echo "Could not close the test VS Code on port $PORT" >&2
  else
    echo "Closed the test VS Code (port $PORT)"
  fi
fi

for port in 9000 9001; do
  pids=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null)
  [ -n "$pids" ] && kill $pids && echo "Stopped the dev server on $port"
done
true
