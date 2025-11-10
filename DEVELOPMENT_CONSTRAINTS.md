# SimpliMed+ Development Constraints & Guidelines

## 🔒 Änderungs-Protokoll (MANDATORY)

### Erlaubte Änderungstypen

#### Level 1: Bug-Fixes
- Syntax-Fehler beheben
- Null-Pointer-Exceptions verhindern
- Falsche Berechnungen korrigieren
- **ABER**: Nur die fehlerhafte Zeile ändern

#### Level 2: Explizit angeforderte Features
- NUR was wörtlich spezifiziert wurde
- KEINE eigenen Interpretationen
- KEINE "nice-to-have" Ergänzungen
- Bei Unklarheiten: STOPPEN und FRAGEN

#### Level 3: Security-Fixes
- XSS-Lücken schließen
- SQL-Injection verhindern
- CSRF-Token implementieren
- **ABER**: Minimal-invasiv

### Verbotene Änderungen (ABSOLUTE NO-GO)

```
❌ Refactoring "weil es besser ist"
❌ Code-Formatierung anpassen
❌ Variablen umbenennen für "bessere Lesbarkeit"
❌ Kommentare hinzufügen/entfernen (außer angefordert)
❌ Import-Reihenfolgen ändern
❌ Leerzeilen hinzufügen/entfernen
❌ Performance-Optimierungen ohne Messung
❌ Neue npm-Pakete ohne explizite Anforderung
❌ CSS-Klassen "aufräumen"
❌ Console.logs hinzufügen (auch nicht "temporär")
```

## 📐 UI-Implementierungs-Details

### Sidenav-Spezifikationen (PIXEL-GENAU)

```javascript
// Desktop Sidenav - EXAKTE Maße
const sidenavConfig = {
  expanded: {
    width: 230,  // px - NICHT ÄNDERN
    logoHeight: 40,
    logoPaddingTop: 2,
    logoPaddingLeft: 2,
    containerHeight: 44
  },
  contracted: {
    width: 64,   // px - NICHT ÄNDERN
    logoHeight: 40,
    logoPaddingTop: 2,
    logoPaddingLeft: 2
  },
  zIndex: 1000,  // Höchste Priorität
  height: 'calc(100vh - 28px)' // Statusbar berücksichtigen
}
```

### Mobile Bottom Navigation

```javascript
// NUR nach erfolgreichem Login anzeigen
const bottomNav = {
  display: isLoggedIn ? 'flex' : 'none',
  height: 56,
  position: 'fixed',
  bottom: 28, // Über Statusbar
  icons: {
    size: 24,
    touchTarget: 48 // Minimum für Accessibility
  }
}
```

### Tabellen-Verhalten

```css
/* Desktop-like Table Selection */
.table-row {
  user-select: none; /* Textmarkierung deaktiviert */
  cursor: pointer;
}

.table-row.selected {
  background-color: var(--selection-bg);
  /* KEINE text-selection, NUR row-selection */
}

/* Multi-Select mit Keyboard */
.table-row[data-ctrl-select="true"] { /* Strg/Cmd gedrückt */ }
.table-row[data-shift-select="true"] { /* Shift-Bereich */ }
```

## 🌍 Internationalisierung (i18n)

### Sprachen-Hierarchie
```javascript
const languages = {
  'de': 'Deutsch',     // DEFAULT
  'en': 'English',
  'fr': 'Français',
  'es': 'Español',
  'it': 'Italiano',
  'ru': 'Русский',
  'uk': 'Українська',
  'nl': 'Nederlands',
  'sv': 'Svenska'
};

// Fallback-Kette
// user-selected → browser-lang → 'de'
```

### i18n-Keys Struktur
```javascript
// NIEMALS hartcodierte Strings!
// FALSCH:
element.textContent = "Willkommen";

// RICHTIG:
element.textContent = i18n.t('welcome.message');

// Keys-Struktur:
{
  "module.component.element": "Übersetzung",
  "common.button.save": "Speichern",
  "error.network.timeout": "Zeitüberschreitung"
}
```

## 🔐 Security-Checkliste

### Bei jeder API-Interaktion
```javascript
// IMMER mit Try-Catch
try {
  const response = await fetch('/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,  // PFLICHT
      'Content-Type': 'application/json'
    }
  });
  
  // IMMER Status prüfen
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  
  // IMMER Daten validieren
  const data = await response.json();
  validateApiResponse(data);
  
} catch (error) {
  // NIEMALS technische Details an User
  showUserMessage(getUserFriendlyError(error));
  // Aber loggen für Debugging
  console.error('API Error:', error);
}
```

### Input-Validierung
```javascript
// IMMER sanitizen
function sanitizeInput(input) {
  // XSS-Prevention
  return DOMPurify.sanitize(input);
}

// NIEMALS direkt in DOM
// FALSCH:
element.innerHTML = userInput;

// RICHTIG:
element.textContent = userInput;
// ODER:
element.innerHTML = DOMPurify.sanitize(userInput);
```

## 📊 Module-Spezifikationen

### Therapeuten-Module (Icons & Routing)

| Modul | Icon | Route | Komponente |
|-------|------|-------|------------|
| Dashboard | `tabler:smart-home` | `/therapist/dashboard` | `TherapistDashboard.vue` |
| Kalender | `tabler:calendar-week` | `/therapist/calendar` | `CalendarView.vue` |
| Kontakte | `tabler:users` | `/therapist/contacts` | `ContactsManager.vue` |
| Dokumentation | `tabler:notes` | `/therapist/documentation` | `Documentation.vue` |
| Rechnungen | `tabler:cash-register` | `/therapist/invoices` | `InvoiceManager.vue` |
| Zahlungen | `tabler:credit-card` | `/therapist/payments` | `PaymentOverview.vue` |
| Healthtalk | `tabler:brand-hipchat` | `/therapist/healthtalk` | `HealthtalkCreator.vue` |
| Healthshop | `tabler:shopping-bag` | `/therapist/shop` | `Healthshop.vue` |

### Patienten-Module (Icons & Routing)

| Modul | Icon | Route | Komponente |
|-------|------|-------|------------|
| Dashboard | `tabler:smart-home` | `/patient/dashboard` | `PatientDashboard.vue` |
| Termine | `tabler:calendar-time` | `/patient/appointments` | `AppointmentBooking.vue` |
| Dokumente | `tabler:file-type-pdf` | `/patient/documents` | `DocumentManager.vue` |
| Healthtalk | `tabler:brand-hipchat` | `/patient/healthtalk` | `HealthtalkChat.vue` |
| Zahlungen | `tabler:credit-card` | `/patient/payments` | `PaymentHistory.vue` |
| Healthshop | `tabler:shopping-bag` | `/patient/shop` | `PatientShop.vue` |

## 🧪 Test-Daten & Development

### localStorage Struktur
```javascript
// Development Mock Data
const devStorage = {
  'simplimed_auth': {
    isLoggedIn: true,
    userType: 'therapist', // oder 'patient'
    username: 'admin',
    token: 'dev-jwt-token',
    rememberMe: true
  },
  'simplimed_preferences': {
    language: 'de',
    theme: 'light',
    sidenavExpanded: true
  },
  'simplimed_session': {
    lastActivity: Date.now(),
    currentModule: 'dashboard'
  }
};
```

### API-Mock für Development
```javascript
// Wenn Backend nicht verfügbar
if (DEVELOPMENT_MODE) {
  window.mockApi = {
    '/api/auth/login': {
      delay: 500,
      response: {
        success: true,
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Test User' }
      }
    },
    // weitere Endpoints...
  };
}
```

## 📝 Git Commit Guidelines

### Commit-Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `fix`: Bug-Fix
- `feat`: Neues Feature (NUR wenn angefordert!)
- `security`: Security-Fix
- `docs`: Nur Dokumentation
- `style`: NUR wenn explizit angefordert
- `refactor`: VERBOTEN (außer explizit angefordert)
- `perf`: VERBOTEN (außer mit Messung)
- `test`: Test-Änderungen

### Beispiele
```bash
fix(login): Korrigiere Null-Pointer bei fehlendem Token

feat(calendar): Implementiere Termin-Export nach Spezifikation #123

security(api): Verhindere XSS in Patienten-Kommentaren
```

## ⚡ Performance-Richtlinien

### Lazy Loading (PFLICHT)
```javascript
// Module nur bei Bedarf laden
const routes = [
  {
    path: '/therapist/calendar',
    component: () => import('./views/CalendarView.vue')
  }
];
```

### Virtual Scrolling bei großen Listen
```javascript
// Bei >100 Einträgen PFLICHT
if (items.length > 100) {
  useVirtualScroll = true;
}
```

## 🚨 Fehlerbehandlung

### User-Facing Fehlermeldungen
```javascript
const errorMessages = {
  'network': 'Verbindung fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung.',
  'auth': 'Benutzername oder Passwort falsch.',
  'permission': 'Sie haben keine Berechtigung für diese Aktion.',
  'validation': 'Bitte überprüfen Sie Ihre Eingaben.',
  'server': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
};

// NIEMALS Stack-Traces oder technische Details zeigen!
```

## 🎯 Checkliste vor Code-Abgabe

```markdown
## Pre-Submit Checklist

### Funktionalität
- [ ] Exakt die angeforderte Funktion implementiert
- [ ] Keine zusätzlichen Features hinzugefügt
- [ ] Alle Edge-Cases berücksichtigt

### Code-Qualität
- [ ] Keine unnötigen Änderungen
- [ ] Bestehende Formatierung beibehalten
- [ ] Keine neuen console.logs

### UI/UX
- [ ] Pixel-genaue Umsetzung der Specs
- [ ] Responsive auf allen Breakpoints getestet
- [ ] Keine visuellen Regressionen

### Security
- [ ] Inputs sanitized
- [ ] CSRF-Token verwendet
- [ ] Keine sensiblen Daten im localStorage

### Performance
- [ ] Lazy Loading wo nötig
- [ ] Keine Performance-Regressionen

### i18n
- [ ] Alle Strings über i18n
- [ ] Keine hartcodierten Texte

### Tests
- [ ] Bestehende Tests laufen noch
- [ ] Neue Tests für neue Features
```

---

## ⛔ ULTIMATE RULE

**Wenn unsicher ob eine Änderung erlaubt ist: SIE IST ES NICHT!**

Fragen > Vermutungen
Minimal > Optimal  
Spezifikation > Kreativität
Stabilität > Innovation

---

**Version**: 1.0.0
**Letzte Aktualisierung**: 2025-11-08
**Gültig für**: SimpliMed+ PWA Development
