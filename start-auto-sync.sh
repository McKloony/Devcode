#!/bin/bash

# Startet die automatische Git-Synchronisation im Hintergrund

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/.git/auto-sync.log"
PID_FILE="$SCRIPT_DIR/.git/auto-sync.pid"

# Prüfe ob bereits läuft
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Auto-Sync läuft bereits (PID: $PID)"
        echo "Log-Datei: $LOG_FILE"
        exit 0
    else
        rm "$PID_FILE"
    fi
fi

# Starte im Hintergrund
echo "Starte Auto-Sync..."
nohup "$SCRIPT_DIR/.git/auto-sync.sh" > /dev/null 2>&1 &
echo $! > "$PID_FILE"

echo "Auto-Sync gestartet (PID: $(cat $PID_FILE))"
echo "Log-Datei: $LOG_FILE"
echo ""
echo "Befehle:"
echo "  - Status anzeigen: tail -f $LOG_FILE"
echo "  - Stoppen: ./stop-auto-sync.sh"
