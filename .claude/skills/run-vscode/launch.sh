#!/usr/bin/env bash
# Build Front Matter CMS, start the webview dev servers and launch an isolated VS Code window
# with the extension in development mode and a CDP port for the driver.
#
# Usage: launch.sh [extension-dir] [workspace-dir]
#   extension-dir  checkout to run (default: the repo this skill lives in)
#   workspace-dir  folder to open (default: $FM_RUN_DIR/ws, created with make-workspace.sh)
#
# Env:
#   FM_RUN_DIR  short folder for the VS Code profile (default /tmp/fm-run). Keep it short: VS Code
#               puts its IPC socket in the user-data-dir and macOS limits socket paths to 103 chars.
#   FM_CDP_PORT remote debugging port (default 9333)
#   CODE_BIN    VS Code binary (default: the macOS app)
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
EXT_DIR="$(cd "${1:-$SKILL_DIR/../../..}" && pwd)"
RUN_DIR="${FM_RUN_DIR:-/tmp/fm-run}"
WS_DIR="${2:-$RUN_DIR/ws}"
PORT="${FM_CDP_PORT:-9333}"
CODE_BIN="${CODE_BIN:-/Applications/Visual Studio Code.app/Contents/MacOS/Code}"

if [ ${#RUN_DIR} -gt 60 ]; then
  echo "FM_RUN_DIR is too long (${#RUN_DIR} chars), VS Code fails with 'listen EINVAL' on its IPC socket." >&2
  echo "Symlink it to a short path and pass that instead." >&2
  exit 1
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is in use, a test VS Code is probably still running (see stop.sh)." >&2
  exit 1
fi

mkdir -p "$RUN_DIR/ud/User" "$RUN_DIR/ext" "$RUN_DIR/shots"

# Profile settings: autosave so the disk reflects panel edits, custom (DOM) menus so context menus
# can be clicked, no welcome/trust/update noise.
cat > "$RUN_DIR/ud/User/settings.json" <<'EOF'
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 300,
  "workbench.startupEditor": "none",
  "security.workspace.trust.enabled": false,
  "telemetry.telemetryLevel": "off",
  "update.mode": "none",
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "window.restoreWindows": "none",
  "window.menuStyle": "custom",
  "workbench.tips.enabled": false,
  "chat.disableAIFeatures": true
}
EOF

# frontMatter.remap has no menu entry (hidden from the palette), a keybinding is the only user path
cat > "$RUN_DIR/ud/User/keybindings.json" <<'EOF'
[
  { "key": "ctrl+alt+shift+r", "command": "frontMatter.remap" }
]
EOF

if [ ! -d "$WS_DIR" ]; then
  "$SKILL_DIR/make-workspace.sh" "$WS_DIR"
fi

if [ ! -d "$SKILL_DIR/node_modules/playwright-core" ]; then
  npm install --prefix "$SKILL_DIR" --no-audit --no-fund >/dev/null
fi

echo "Building the extension in $EXT_DIR"
(cd "$EXT_DIR" && npm run dev:build:ext 2>&1 | grep -E "compiled|ERROR")

# In development mode the webviews load their scripts from these dev servers
for target in dashboard:9000 panel:9001; do
  name="${target%%:*}"
  port="${target##*:}"
  if ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    # Redirect the whole background group, otherwise it keeps this script's stdout open
    (cd "$EXT_DIR" && exec npm run "watch:$name") > "$RUN_DIR/$name-server.log" 2>&1 < /dev/null &
  fi
done

echo "Waiting for the webview dev servers"
for _ in $(seq 1 90); do
  if lsof -nP -iTCP:9000 -sTCP:LISTEN >/dev/null 2>&1 && lsof -nP -iTCP:9001 -sTCP:LISTEN >/dev/null 2>&1 \
    && grep -q "compiled" "$RUN_DIR/dashboard-server.log" 2>/dev/null \
    && grep -q "compiled" "$RUN_DIR/panel-server.log" 2>/dev/null; then
    break
  fi
  sleep 1
done

nohup "$CODE_BIN" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$RUN_DIR/ud" \
  --extensions-dir="$RUN_DIR/ext" \
  --extensionDevelopmentPath="$EXT_DIR" \
  --skip-welcome --skip-release-notes --disable-workspace-trust \
  --new-window "$WS_DIR" > "$RUN_DIR/vscode.log" 2>&1 < /dev/null &

echo "VS Code launched: workspace=$WS_DIR cdp=http://127.0.0.1:$PORT"
echo "Drive it with: FM_RUN_DIR=$RUN_DIR node $SKILL_DIR/<script>.mjs"
