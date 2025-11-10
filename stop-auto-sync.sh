#!/bin/bash

# Stoppt die automatische Git-Synchronisation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.git/auto-sync.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "Auto-Sync läuft nicht (keine PID-Datei gefunden)"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "Stoppe Auto-Sync (PID: $PID)..."
    kill "$PID"
    rm "$PID_FILE"
    echo "Auto-Sync gestoppt ✓"
else
    echo "Prozess nicht gefunden, räume PID-Datei auf..."
    rm "$PID_FILE"
fi
