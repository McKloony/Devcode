# SimpliMed+ Claude Code Project Instructions

## 🚨 ABSOLUTE PRIORITÄT - STRIKTE REGELN

### REGEL #1: KEINE UNAUTORISIERTEN ÄNDERUNGEN
**NIEMALS** Features, Funktionen oder Verbesserungen hinzufügen, die nicht explizit angefordert wurden:
- KEINE "Aufräum"- oder Stil-Anpassungen
- KEINE Umbenennungen von Variablen/Funktionen
- KEINE neuen Abhängigkeiten ohne explizite Anforderung
- KEINE Formatierungs-Änderungen (außer technisch zwingend)
- KEINE Performance-"Optimierungen" ohne Auftrag

### REGEL #2: MINIMAL-INVASIVE ÄNDERUNGEN
Jede Änderung muss:
- Die kleinstmögliche, lokal begrenzte Modifikation sein
- Bestehende IDs, Klassen, Test-Selectoren beibehalten
- Keine Seiteneffekte verursachen
- Deterministisch und nachvollziehbar sein

### REGEL #3: UNVERÄNDERLICHE BEREICHE
Folgendes darf NICHT verändert werden (außer explizit angefordert):
- Sichtbares UI/Design/Abstände/Farben/Typografie
- Öffentliche APIs/Signaturen
- Bestehende Funktionen und deren Verhalten
- Datenmodell und Datenbankstrukturen
- Übersetzungen und i18n-Keys
- Performance- und SEO-Verhalten
- Import-Reihenfolgen

## 📋 Projekt-Kontext: SimpliMed SPA

### Produkt-Information
- **Name**: SimpliMed
- **Zweck**: Praxisverwaltungssoftware
- **Nutzer**: 8.500 Therapeuten, 3.8 Mio Patientenakten
- **Firma**: SimpliMed GmbH (Mid-Size, Deutschland)

### Technologie-Stack
```
Frontend:
- Vue.js 3.x via CDN
- Tailwind CSS 3.x via CDN  
- JavaScript ES6+ mit JSDoc-Annotations
- TailGrids UI-Komponenten
- Iconify Icons (tabler Icons)

Backend:
- MariaDB Multi-Tenant (alphabetische DB-Units)
- Node.js/Express
- ASP.net / Castrell
- JWT Authentication
```

### Architektur-Prinzipien
- **SPA mit Application Shell**: Lazy Loading, modularer Aufbau
- **Zwei getrennte UIs**: Therapeuten-Portal / Patienten-Portal
- **State Management**: localStorage für persistente Einstellungen
- **Multi-Language**: 9 Sprachen (DE Standard)

## 🎨 UI-Spezifikationen (EXAKT EINHALTEN)

### Responsive Breakpoints
- Mobile: < 768px (primär 360-414px)
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

### Z-Index Hierarchie (KRITISCH)
```
component.sidenav:    1000 (höchste Priorität)
component.overlays:    500 (Modals, Dropdowns)
component.titlebar:    100
component.toolbar:      90
component.statusbar:    80
component.appcontent:    1
```

### Logo-Spezifikationen
- **Alle Logos**: Einheitlich 40px Höhe
- **Sidenav expandiert**: logo_simplimed_fullsize.svg
- **Sidenav kontrahiert**: logo_simplimed_smallsize.svg  
- **Titlebar**: logo_simplimed_fullsize.svg

### Desktop Sidenav Abmessungen
- Expandiert: 230px Breite
- Kontrahiert: 64px Breite
- Höhe: calc(100vh - 28px) für Statusbar

## 💻 Entwicklungs-Standards

### Code-Konventionen
```javascript
// Kommentare: Deutsch
const benutzerName = '';     // camelCase für Variablen
const BenutzerKomponente = {}; // PascalCase für Komponenten
'/api/benutzer-daten'        // kebab-case für Endpoints
'benutzer_name'              // snake_case für DB-Felder
```

### Verbotene Praktiken
- ❌ Bootstrap/jQuery (nur Tailwind CSS)
- ❌ Hartcodierte Strings (alles über i18n)
- ❌ Direkte DB-Queries im Frontend
- ❌ console.log im Production Code

## 🔧 Arbeitsweise bei Änderungen

### Vor jeder Änderung
1. **Scope definieren**: Welche Dateien/Bereiche sind erlaubt?
2. **Tabu-Bereiche**: Alles andere ist tabu
3. **Impact analysieren**: Keine unbeabsichtigten Seiteneffekte

### Ausgabe-Format für Änderungen
```diff
# 1. Unified Diff mit Kontext
- alte zeile
+ neue zeile

# 2. Begründung (max. 3 Sätze)
Zeile X wurde geändert weil...

# 3. Selbstcheckliste
✓ Nur erlaubte Dateien berührt
✓ Keine APIs/Signaturen geändert  
✓ Keine Styles unbeabsichtigt verändert
✓ Änderung ist minimal und zielgenau
```

## ⚠️ Kritische Warnungen

### Bei Login/Startscreen
- KEINE Seitenleiste vor Login
- KEINE untere Navigation (Mobile) vor Login
- KEINE Toolbar vor Login
- NUR Titlebar, Avatar (generisch), Login-Form, Statusbar

### Bei Tabellen
- Ganze Zeilen als Auswahlobjekt
- HTML-Textmarkierung deaktiviert
- Desktop-ähnliches Verhalten (Strg/Shift-Auswahl)

## 🧪 Test-Simulation

### Login-Credentials (Entwicklung)
```
Username: admin
Passwort: admin123
```

## 📝 Wenn Aufgabe nicht regelkonform lösbar

**STOPP**: Keine Änderung vornehmen!
Stattdessen: Grund nennen, warum die Aufgabe ohne Regelbruch nicht lösbar ist.

---

**REMEMBER**: Diese Regeln sind ABSOLUT. Bei Unsicherheit: FRAGEN statt raten!
