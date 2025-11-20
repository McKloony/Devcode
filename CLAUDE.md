# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SimpliMed is a healthcare practice management SPA serving 8,500+ therapists and 3.8M patient records. The application provides two distinct portals (Patient & Therapist) with a modular architecture and multi-language support (9 languages, German default).

**Technology Stack:**
- Vanilla JavaScript (ES6+) with JSDoc annotations
- Tailwind CSS 3.x via CDN
- Iconify Icons (Tabler icon set)
- No build system - direct browser execution
- MariaDB backend with JWT authentication

## Development Commands

This is a static SPA served directly - no build, lint, or test commands. Simply open `index.html` in a browser or use any static file server:

```bash
# Local development with Python
python3 -m http.server 8000

# Or with Node.js
npx serve .
```

## Core Architecture

### Application Initialization Sequence

The app initializes in strict order (defined in `index.html` script load sequence):

1. **I18n** (`assets/js/i18n.js`) - Loads translations from `assets/locales/{lang}.json`
2. **ThemeManager** (`assets/js/theme.js`) - Applies theme from localStorage
3. **AuthManager** (`assets/js/auth.js`) - Validates session and remember tokens
4. **ImprintManager** (`assets/js/imprint.js`) - Lazy-loads legal data
5. **ViewTemplates** (`assets/js/view-templates.js`) - Provides HTML template strings
6. **Router** (`assets/js/router.js`) - Renders views and attaches event listeners
7. **App** (`assets/js/app.js`) - Orchestrates initialization via `VersionManager`

**Critical:** This script load order in `index.html` must never change - it defines initialization dependencies.

### State Management

All application state persists in localStorage with the `simplimed_` prefix:

```javascript
// Session & Auth
simplimed_session          // 'true' when logged in
simplimed_session_expires  // Timestamp (24h validity)
simplimed_usertype         // 'patient' | 'therapist'
simplimed_username         // Current username
simplimed_remember_token   // Secure token for session restore
simplimed_remember_choice  // User's remember-me preference
simplimed_last_login_type  // Last used login type

// UI Preferences
simplimed_theme            // 'light' | 'dark' | 'design' | 'contrast'
simplimed_language         // 'de' | 'en' | 'fr' | 'es' | 'it' | 'ru' | 'uk' | 'nl' | 'sv'
simplimed_sidenav_collapsed // 'true' | 'false'
simplimed_version          // Current app version for cache management
```

### Router Architecture

The Router is the central controller managing view lifecycle:

- **View States:** `login` (pre-auth) → `dashboard` (post-auth)
- **Memory Management:** `cleanup()` method removes all event listeners before re-render
- **Layout Scheduling:** Uses `requestAnimationFrame` batching to prevent reflow loops
- **Performance Optimization:**
  - Throttled pointer move handlers for fine-pointer devices
  - ResizeObserver with rAF callbacks for responsive layouts
  - Single in-progress layout update at a time

**Critical Pattern:** Always call `Router.cleanup()` before re-rendering to prevent memory leaks.

### Authentication Flow

`AuthManager` implements demo-mode authentication (accepts any non-empty credentials):

1. Login validation generates session token (simulated JWT)
2. Session expires after 24 hours
3. Remember-me creates secure token (never stores passwords)
4. Session restore attempts on app init if remember token exists
5. `_isSessionValid()` checks expiration on every auth check

**Production Note:** All authentication logic marked for backend replacement. Current implementation is client-side simulation only.

### View Template System

`ViewTemplates` separates markup from logic:

- `getLoginView()` - Pre-authentication UI (no sidenav/toolbar/bottom-nav)
- `getDashboardView(userType)` - Post-authentication UI with role-based modules
- `getImprintPopup(data)` - Legal notice overlay

**Module Configuration:**
- Patient: dashboard, appointments, documents, healthtalk, payments, healthshop
- Therapist: dashboard, calendar, contacts, documentation, invoices, payments, healthtalk, healthshop

### Internationalization

`I18n` loads translations dynamically with version-based cache busting:

```javascript
// Translation key format: module.component.element
I18n.t('login.username')           // "Benutzername"
I18n.t('modules.dashboard')        // "Dashboard"
I18n.t('search.actionOrCommand')   // "Aktion oder Befehl"
```

**Rule:** Never hardcode user-facing strings. All text must use `I18n.t()` with structured keys.

## UI Specifications

### Z-Index Hierarchy (Strict - Never Violate)

```
sidenav:        1000
overlays:        500  (modals, dropdowns, popups)
titlebar:        100
toolbar:          90
statusbar:        80
app-content:       1
```

### Responsive Breakpoints

- **Mobile:** < 768px (primary: 360-414px)
- **Tablet:** 768-1023px
- **Desktop:** ≥ 1024px

### Sidenav Dimensions

- **Expanded:** 230px width
- **Collapsed:** 64px width
- **Height:** calc(100vh - 28px) - accounts for statusbar
- **Logo:** Always 40px height (all variants)

### Bottom Navigation (Mobile)

- **Visibility:** Only shown when logged in and viewport < 768px
- **Height:** 56px
- **Overflow Behavior:** Dynamically calculates visible items, overflow menu for hidden items
- **Item Width:** 92px per item
- **Min Visible:** 2 items + overflow menu

**Critical:** Bottom navigation uses `applyBottomNavigationLayout()` scheduled via rAF to prevent layout thrashing.

## Code Conventions

### Naming Standards

```javascript
const userName = '';           // camelCase: variables, functions
const UserComponent = {};      // PascalCase: components, classes
'/api/user-data'              // kebab-case: API endpoints
'user_name'                   // snake_case: database fields
```

### Component Pattern

All managers follow singleton pattern:

```javascript
const ManagerName = {
    STORAGE_KEY: 'simplimed_key',
    _privateState: null,

    init() {
        // Initialization logic
    },

    publicMethod() {
        // Public API
    },

    _privateMethod() {
        // Internal logic
    },

    cleanup() {
        // Resource cleanup
    }
};
```

### Event Handler Cleanup

Always store event handlers for cleanup:

```javascript
this._eventHandlers = new Map();

// Store handler
const handler = (e) => { /* ... */ };
element.addEventListener('click', handler);
this._eventHandlers.set('handlerName', handler);

// Cleanup
cleanup() {
    this._eventHandlers.clear();
}
```

### Version Management

`VersionManager` handles cache invalidation:

- Loads version from `assets/version.json` with cache-busting timestamp
- Clears application cache on major version changes (x.0.0)
- Preserves user settings (theme, language, remember-me, sidenav state)
- Periodic version check every 5 minutes in production

## Critical Constraints

### Absolute Rules (from AGENTS.md)

1. **No Feature Creep:** Only implement explicitly requested changes
2. **Minimal Invasive:** Smallest possible, locally bounded modifications
3. **No Refactoring:** Never rename variables, reformat code, or reorganize imports
4. **UI Immutable:** Never change visible design, spacing, colors, typography without explicit request
5. **API Stability:** Never modify public APIs, function signatures, or data structures

### Pre-Login Restrictions

Before authentication, ONLY show:
- Titlebar with generic avatar
- Login form
- Statusbar

**Never render before login:**
- Sidenav
- Toolbar
- Mobile toolbar
- Bottom navigation
- FAB (Floating Action Button)

### Security Requirements

- All API calls must include CSRF tokens (when backend implemented)
- Sanitize all user input before DOM insertion
- Never store passwords (use tokens only)
- Session validation on every protected operation

### Performance Requirements

- Lazy loading mandatory for all modules
- Virtual scrolling for lists > 100 items
- requestAnimationFrame batching for layout operations
- ResizeObserver for responsive layout adjustments

## Common Patterns

### Adding New UI Components

1. Define template in `ViewTemplates`
2. Add event listeners in Router's `attach*EventListeners()` method
3. Store handlers in `_eventHandlers` Map for cleanup
4. Add cleanup logic to `Router.cleanup()`
5. Add i18n keys to all locale files

### Adding New Routes/Modules

1. Add module definition to `getPatientModules()` or `getTherapistModules()`
2. Add translation keys to all 9 locale files
3. Update `handleModuleNavigation()` if special behavior needed
4. Add routing logic to `Router.navigate()`

### Adding New Themes

1. Create CSS file in `assets/css/themes/{theme}.css`
2. Add theme to `ThemeManager.THEMES` array
3. Add theme option to avatar menu in `ViewTemplates.getLoginView()` and `getDashboardView()`
4. Add translation key in all locale files

## Git Commit Convention

```
type(scope): subject

Examples:
fix(login): Prevent null pointer when token missing
security(api): Sanitize user input in comments
feat(dashboard): Add widget drag-and-drop
```

**Types:** fix, feat, security, refactor, docs, test

## Development Notes

- Context menu disabled except on form elements (see `app.js` contextmenu handler)
- Time display updates every second via `setInterval` in Router
- Iconify icons lazy-load via CDN (3.1.0)
- Tailwind CSS loaded via CDN (no config, uses default + custom CSS)
- Production detection: checks if hostname is localhost/127.*/192.168.*
- Logger conditionally outputs based on production flag
