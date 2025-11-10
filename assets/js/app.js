/**
 * Hauptanwendung SimpliMed
 */

/**
 * Version Manager
 * Handles application versioning and cache management
 */
const VersionManager = {
    currentVersion: null,

    /**
     * Loads version information from version.json
     */
    async loadVersion() {
        try {
            // Add timestamp to prevent caching of version.json itself
            const response = await fetch(`/assets/version.json?t=${Date.now()}`);
            if (response.ok) {
                const versionData = await response.json();
                this.currentVersion = versionData.version;

                // Store version in window object for global access
                window.APP_VERSION = versionData.version;

                // Check for version changes
                this.checkVersionUpdate();
            }
        } catch (error) {
            console.warn('Could not load version information:', error);
            // Set default version if loading fails
            this.currentVersion = '1.0.0';
            window.APP_VERSION = '1.0.0';
        }
    },

    /**
     * Checks if version has changed and handles cache updates
     */
    checkVersionUpdate() {
        const storedVersion = localStorage.getItem('simplimed_version');

        if (storedVersion && storedVersion !== this.currentVersion) {
            // Version has changed - clear caches if needed
            console.log(`Version updated from ${storedVersion} to ${this.currentVersion}`);

            // Update stored version
            localStorage.setItem('simplimed_version', this.currentVersion);

            // Optional: Clear other cached data if needed
            // This ensures a clean state for the new version
            if (this.shouldClearCache(storedVersion, this.currentVersion)) {
                this.clearApplicationCache();
            }
        } else if (!storedVersion) {
            // First time running - store version
            localStorage.setItem('simplimed_version', this.currentVersion);
        }
    },

    /**
     * Determines if cache should be cleared based on version change
     */
    shouldClearCache(oldVersion, newVersion) {
        // Clear cache on major version changes (x.0.0)
        const oldMajor = parseInt(oldVersion.split('.')[0]);
        const newMajor = parseInt(newVersion.split('.')[0]);
        return newMajor > oldMajor;
    },

    /**
     * Clears application-specific cached data
     */
    clearApplicationCache() {
        // Preserve important user settings
        const preserveKeys = [
            'simplimed_theme',
            'simplimed_language',
            'simplimed_remember',
            'simplimed_version'
        ];

        // Get all keys
        const allKeys = Object.keys(localStorage);

        // Remove non-preserved keys
        allKeys.forEach(key => {
            if (key.startsWith('simplimed_') && !preserveKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        console.log('Application cache cleared for new version');
    },

    /**
     * Gets the current version
     */
    getVersion() {
        return this.currentVersion || '1.0.0';
    }
};

const App = {
    /**
     * Initialisiert die Anwendung
     */
    async init() {
        // Load version first
        await VersionManager.loadVersion();

        ThemeManager.init();
        await I18n.init();
        Router.render();
    }
};

// App starten
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

document.addEventListener('contextmenu', event => {
    const target = event.target;
    if (target && target.closest('input, textarea, select, button, [contenteditable="true"]')) {
        return;
    }
    event.preventDefault();
});
