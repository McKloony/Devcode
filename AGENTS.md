# AGENTS.md — Projektregeln für Codex CLI

## Zweck
Diese Datei definiert **strikte, projektweite Prämissen**. Codex muss sie bei allen Aufgaben berücksichtigen. Fokus: **Minimal-invasiv, vorhersehbar, sicher**. (Quelle: SimpliMed Code Project & Development Constraints) 

## 0. Ultimative Regeln
- **Kein Feature-Creep**: NUR exakt angeforderte Änderungen; keine „Verbesserungen“ aus Eigeninitiative.  
- **Minimal-invasiv**: Kleinste, lokal begrenzte Änderung ohne Seiteneffekte.  
- **Bei Unsicherheit: STOPP & Rückfrage**.  
(Ref: Absolute Prioritäten & Verbote)  

## 1. Was NIEMALS geändert wird
- Öffentlich sichtbares UI (Design, Abstände, Farben, Typografie)  
- Öffentliche APIs/Signaturen, Datenmodell/DB-Struktur  
- i18n-Keys/Übersetzungen, Import-Reihenfolgen, Performance-/SEO-Verhalten  
(Ref: Unveränderliche Bereiche)

## 2. Erlaubte Änderungstypen (in Priorität)
**Level 1 — Bugfix**: Syntax/Null-Pointer/falsche Berechnung; nur betroffene Zeile anpassen.  
**Level 3 — Security**: XSS/SQLi/CSRF minimal-invasiv schließen.  
**Level 2 — Feature (nur explizit)**: exakt Wortlaut der Spezifikation; keine Interpretationen.  
(Ref: Änderungs-Protokoll)

## 3. Verbotene Praktiken
- Refactoring, Formatierung, Import-Reihenfolge, Variablen-/Funktions-Umbenennung  
- Neue Abhängigkeiten ohne Auftrag, „Aufräumen“ von CSS/Leerzeilen  
- `console.log` im Produktivcode  
(Ref: Verbotene Änderungen)

## 4. Architektur & UI-Rahmen (nicht verletzen)
- SPA mit Application-Shell, Lazy Loading, modulare Struktur  
- Zwei UIs: Therapeuten-Portal & Patienten-Portal  
- State in `localStorage` (Einstellungen), 9 Sprachen (DE Default)  
- **Z-Index-Hierarchie** strikt: sidenav 1000; overlays 500; titlebar 100; toolbar 90; statusbar 80; appcontent 1  
- **Sidenav (Desktop)**: 230 px expandiert / 64 px kontrahiert; Logos stets 40 px hoch  
- Vor Login: **keine** Sidenav/Toolbar/Bottom-Nav; nur Titlebar, generischer Avatar, Login, Statusbar  
(Ref: UI-Spezifikationen & Kritische Warnungen)

## 5. Coding-Standards
- Kommentare **Deutsch**; Variablen `camelCase`, Komponenten `PascalCase`, Endpoints `kebab-case`, DB-Felder `snake_case`  
- **Keine hartcodierten Strings** → alles über `i18n` mit Keys wie `module.component.element`  
- API-Aufrufe immer: Auth-Header, **CSRF-Token**, Statusprüfung, Validierung, user-freundliche Fehlermeldung  
- **Kein direktes DOM mit ungesäubertem Input**; stets sanitisieren  
(Ref: Entwicklungs-Standards, i18n, Security-Checkliste)

## 6. Performance
- Lazy Loading verpflichtend; Virtual Scrolling bei >100 Einträgen  
(Ref: Performance-Richtlinien)

## 7. Tabellen-Interaktion (Desktop-like)
- Ganze Zeilen auswählbar; Text-Markierung aus  
- Multi-Select via Strg/Shift  
(Ref: Tabellen-Verhalten)

## 8. Vorgehen vor jeder Änderung
1) **Scope definieren** (welche Dateien/Bereiche sind erlaubt?)  
2) **Tabu-Bereiche abgrenzen**  
3) **Impact prüfen** (UI, APIs, i18n, Security, Performance)  
(Ref: Arbeitsweise)

## 9. Ausgabeformat bei Pull-Requests
```diff
# Unified Diff mit Kontext
- alt
+ neu

# Begründung (max. 3 Sätze)
Warum die Änderung nötig ist.

# Selbst-Checkliste
✓ Nur erlaubte Dateien
✓ Keine API/Signatur geändert
✓ Keine unbeabsichtigten UI-Änderungen
✓ Änderung minimal & zielgenau
```
## 10. Pre-Submit Checkliste
- [ ] Keine zusätzlichen Features  
- [ ] Bestehende Formatierung unberührt  
- [ ] Alle Inputs sanitisiert; CSRF gesetzt  
- [ ] Lazy Load/Virtual Scroll eingehalten  
- [ ] Alle Strings via i18n  
- [ ] Tests laufen/grenzen neue Fälle ab  
(Ref: Pre-Submit-Checklist)

## 11. Login/Start-Kontext (kritisch)
- Vor Login: **keine** Sidenav/Toolbar/Bottom-Nav  
- Bottom-Nav mobil erst **nach** Login; Höhe 56; Touch-Target min. 48  
(Ref: Kritische Warnungen, Mobile Bottom Nav)

## 12. Git-Konvention
```
type(scope): subject
Beispiele: 
fix(login): Null-Pointer bei fehlendem Token
security(api): XSS in Kommentaren verhindern
```
(Ref: Commit-Guidelines)

## 13. Wenn Regelbruch nötig wäre
**STOPP.** Änderung nicht durchführen. Grund nennen und Rückfrage.  
(Ref: Wenn Aufgabe nicht regelkonform lösbar)
