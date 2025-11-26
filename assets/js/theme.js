/**
 * Theme-Verwaltung für SimpliMed
 * Verwaltet das Wechseln zwischen 4 Themes: light, dark, design, contrast
 */

const ThemeManager = {
    STORAGE_KEY: 'simplimed_theme',
    DEFAULT_THEME: 'light',
    THEMES: ['light', 'dark', 'design', 'contrast'],

    /**
     * Initialisiert das Theme-System
     */
    init() {
        const savedTheme = this.getTheme();
        this.setTheme(savedTheme);
    },

    /**
     * Gibt das aktuell gespeicherte Theme zurück
     * @returns {string} Theme-Name
     */
    getTheme() {
        const theme = localStorage.getItem(this.STORAGE_KEY);
        return this.THEMES.includes(theme) ? theme : this.DEFAULT_THEME;
    },

    /**
     * Setzt das aktuelle Theme
     * @param {string} themeName - Name des Themes ('light'|'dark'|'design'|'contrast')
     */
    setTheme(themeName) {
        if (!this.THEMES.includes(themeName)) {
            themeName = this.DEFAULT_THEME;
        }
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem(this.STORAGE_KEY, themeName);
    }
};

// ThemeManager wird zentral über App.init() gestartet, um doppelte Initialisierung zu vermeiden.
