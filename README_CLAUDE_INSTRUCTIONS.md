# Claude Code Instruktionen für SimpliMed+

## 📁 Dateien und deren Verwendung

### 1. `.claude/project.md` 
**Hauptinstruktionsdatei - IMMER verwenden**

- **Zweck**: Wird von Claude Code automatisch geladen
- **Speicherort**: `.claude/project.md` im Projektverzeichnis
- **Inhalt**: Strikte Regeln, Projekt-Kontext, wichtigste Standards
- **Verwendung**: 
  ```bash
  mkdir .claude
  cp .claude_project.md .claude/project.md
  ```

### 2. `DEVELOPMENT_CONSTRAINTS.md`
**Detaillierte Entwicklungsrichtlinien - Bei Bedarf**

- **Zweck**: Erweiterte Richtlinien und technische Details
- **Speicherort**: Im Projektverzeichnis root
- **Inhalt**: Ausführliche Constraints, Code-Examples, Checklisten
- **Verwendung**: Bei komplexen Änderungen als Referenz

## 🚀 Quick Setup

```bash
# In Ihrem SimpliMed+ Projektverzeichnis:

# 1. Claude-Verzeichnis erstellen
mkdir -p .claude

# 2. Hauptinstruktionen kopieren (Dateiname anpassen!)
mv .claude_project.md .claude/project.md

# 3. Entwicklungs-Constraints im Root platzieren
# (DEVELOPMENT_CONSTRAINTS.md bleibt wie sie ist)

# 4. Optional: Git ignorieren (wenn gewünscht)
echo ".claude/" >> .gitignore
```

## 💡 Verwendungstipps

### Beim Start eines neuen Features:
1. Claude Code öffnet automatisch `.claude/project.md`
2. Spezifizieren Sie GENAU was implementiert werden soll
3. Definieren Sie erlaubte Dateien/Bereiche
4. Verweisen Sie bei Bedarf auf `DEVELOPMENT_CONSTRAINTS.md`

### Beispiel-Prompt:
```
Ziel: Login-Button Farbe auf Primärfarbe ändern
Scope: Nur /src/components/LoginForm.vue
Erlaubt: CSS-Klasse des Buttons anpassen
Tabu: Alles andere
```

### Bei Unsicherheiten:
- Claude wird FRAGEN statt zu raten
- Claude wird STOPPEN wenn Regeln verletzt würden
- Das ist GEWOLLT und schützt vor unerwünschten Änderungen

## ⚠️ Wichtige Hinweise

1. **Feature Creep Prevention**: Die Regeln sind bewusst SEHR strikt
2. **Keine Improvisation**: Claude wird NICHTS "verbessern" ohne Auftrag  
3. **Pixel-Genau**: UI-Specs werden EXAKT umgesetzt
4. **Minimal-Invasiv**: Kleinste mögliche Änderung wird bevorzugt

## 📝 Anpassung der Instruktionen

Falls Sie die Instruktionen anpassen möchten:

1. **Projekt-spezifische Anpassungen** → `.claude/project.md`
2. **Neue technische Standards** → `DEVELOPMENT_CONSTRAINTS.md`
3. **Nach Anpassung**: Neue Claude Code Session starten

## 🔄 Updates

Die Instruktionen sollten mit dem Projekt wachsen:
- Neue Module? → In project.md ergänzen
- Neue Security-Regeln? → In DEVELOPMENT_CONSTRAINTS.md
- Neue Team-Standards? → In beide Dateien

---

**Tipp**: Diese strikten Regeln mögen anfangs übertrieben wirken, aber sie verhindern effektiv unerwünschte "Kreativität" von KI-Assistenten und sorgen für vorhersagbare, kontrollierte Entwicklung.
