#!/bin/bash

# Zeigt den Status der automatischen Git-Synchronisation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.git/auto-sync.pid"
LOG_FILE="$SCRIPT_DIR/.git/auto-sync.log"

echo "=== Auto-Sync Status ==="
echo ""

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Status: ✓ Läuft"
        echo "PID: $PID"
        echo "Seit: $(ps -p "$PID" -o lstart=)"
        echo ""
        echo "Letzte Log-Einträge:"
        echo "---"
        tail -n 10 "$LOG_FILE" 2>/dev/null || echo "(Keine Logs vorhanden)"
    else
        echo "Status: ✗ Gestoppt (Prozess existiert nicht mehr)"
        rm "$PID_FILE"
    fi
else
    echo "Status: ✗ Nicht gestartet"
fi

echo ""
echo "Befehle:"
echo "  - Starten: ./start-auto-sync.sh"
echo "  - Stoppen: ./stop-auto-sync.sh"
echo "  - Live-Logs: tail -f $LOG_FILE"
