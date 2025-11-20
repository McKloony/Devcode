/**
 * SimpliMed Application Core
 * Main application initialization and version management
 * @version 1.1.4
 */

/**
 * Application Configuration
 */
const AppConfig = {
    IS_PRODUCTION: window.location.hostname !== 'localhost' &&
                   !window.location.hostname.startsWith('127.') &&
                   !window.location.hostname.startsWith('192.168.'),
    VERSION_CHECK_INTERVAL: 300000, // 5 minutes
    DEFAULT_VERSION: '1.0.0',
    STORAGE_PREFIX: 'simplimed_'
};

/**
 * Logger utility for conditional console logging
 */
const Logger = {
    log(...args) {
        if (!AppConfig.IS_PRODUCTION) {
            console.log(...args);
        }
    },
    warn(...args) {
        if (!AppConfig.IS_PRODUCTION) {
            console.warn(...args);
        }
    },
    error(...args) {
        console.error(...args); // Always log errors
    },
    info(...args) {
        if (!AppConfig.IS_PRODUCTION) {
            console.info(...args);
        }
    }
};

/**
 * Version Manager
 * Handles application versioning and cache management
 */
const VersionManager = {
    currentVersion: null,
    _checkInterval: null,

    /**
     * Initializes version management
     */
    async init() {
        try {
            await this.loadVersion();
            this.setupVersionCheck();
        } catch (error) {
            Logger.error('Failed to initialize version manager:', error);
            this.setDefaultVersion();
        }
    },

    /**
     * Loads version information from version.json
     */
    async loadVersion() {
        try {
            const timestamp = Date.now();
            const response = await fetch(`/assets/version.json?t=${timestamp}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const versionData = await response.json();

            if (!versionData.version) {
                throw new Error('Invalid version data: missing version field');
            }

            this.currentVersion = versionData.version;
            window.APP_VERSION = versionData.version;

            this.checkVersionUpdate();
            Logger.info('Version loaded:', this.currentVersion);
        } catch (error) {
            Logger.error('Failed to load version information:', error);
            this.setDefaultVersion();
        }
    },

    /**
     * Sets default version as fallback
     */
    setDefaultVersion() {
        this.currentVersion = AppConfig.DEFAULT_VERSION;
        window.APP_VERSION = AppConfig.DEFAULT_VERSION;
        Logger.warn('Using default version:', AppConfig.DEFAULT_VERSION);
    },

    /**
     * Sets up periodic version checking
     */
    setupVersionCheck() {
        if (AppConfig.IS_PRODUCTION && !this._checkInterval) {
            this._checkInterval = setInterval(() => {
                this.loadVersion().catch(err => {
                    Logger.error('Version check failed:', err);
                });
            }, AppConfig.VERSION_CHECK_INTERVAL);
        }
    },

    /**
     * Checks if version has changed and handles cache updates
     */
    checkVersionUpdate() {
        const storedVersion = localStorage.getItem(`${AppConfig.STORAGE_PREFIX}version`);

        if (storedVersion && storedVersion !== this.currentVersion) {
            Logger.log(`Version updated: ${storedVersion} → ${this.currentVersion}`);

            localStorage.setItem(`${AppConfig.STORAGE_PREFIX}version`, this.currentVersion);

            if (this.shouldClearCache(storedVersion, this.currentVersion)) {
                this.clearApplicationCache();
            }
        } else if (!storedVersion) {
            localStorage.setItem(`${AppConfig.STORAGE_PREFIX}version`, this.currentVersion);
            Logger.info('First run, version stored:', this.currentVersion);
        }
    },

    /**
     * Determines if cache should be cleared based on version change
     * @param {string} oldVersion - Previous version
     * @param {string} newVersion - New version
     * @returns {boolean} True if cache should be cleared
     */
    shouldClearCache(oldVersion, newVersion) {
        try {
            const oldParts = oldVersion.split('.').map(n => parseInt(n) || 0);
            const newParts = newVersion.split('.').map(n => parseInt(n) || 0);

            // Clear cache on major version changes (x.0.0)
            return newParts[0] > oldParts[0];
        } catch (error) {
            Logger.error('Error comparing versions:', error);
            return false;
        }
    },

    /**
     * Clears application-specific cached data while preserving user settings
     */
    clearApplicationCache() {
        const preserveKeys = [
            'theme',
            'language',
            'remember',
            'remember_choice',
            'version',
            'last_login_type',
            'sidenav_collapsed'
        ].map(key => `${AppConfig.STORAGE_PREFIX}${key}`);

        try {
            const allKeys = Object.keys(localStorage);
            let clearedCount = 0;

            allKeys.forEach(key => {
                if (key.startsWith(AppConfig.STORAGE_PREFIX) && !preserveKeys.includes(key)) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            });

            Logger.log(`Cache cleared: ${clearedCount} items removed`);
        } catch (error) {
            Logger.error('Error clearing cache:', error);
        }
    },

    /**
     * Gets the current version
     * @returns {string} Current version string
     */
    getVersion() {
        return this.currentVersion || AppConfig.DEFAULT_VERSION;
    },

    /**
     * Cleanup method for proper shutdown
     */
    destroy() {
        if (this._checkInterval) {
            clearInterval(this._checkInterval);
            this._checkInterval = null;
        }
    }
};

/**
 * Main Application Controller
 */
const App = {
    _initialized: false,

    /**
     * Initializes the application
     */
    async init() {
        if (this._initialized) {
            Logger.warn('App already initialized');
            return;
        }

        try {
            Logger.info('Initializing SimpliMed application...');

            // Initialize version management first
            await VersionManager.init();

            // Initialize core systems in sequence
            ThemeManager.init();
            await I18n.init();
            Router.init();

            this._initialized = true;
            Logger.info('Application initialized successfully');
        } catch (error) {
            Logger.error('Application initialization failed:', error);
            this.handleInitError(error);
        }
    },

    /**
     * Handles initialization errors
     * @param {Error} error - The error that occurred
     */
    handleInitError(error) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
                    <div style="text-align: center; max-width: 500px;">
                        <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
                        <p style="color: #6b7280; margin-bottom: 16px;">
                            The application failed to initialize. Please refresh the page.
                        </p>
                        <button onclick="location.reload()"
                                style="padding: 10px 20px; background: #007BB4; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Reload Application
                        </button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Gets initialization status
     * @returns {boolean} True if app is initialized
     */
    isInitialized() {
        return this._initialized;
    }
};

/**
 * Application startup
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init().catch(error => {
        Logger.error('Fatal error during app initialization:', error);
    });
});

/**
 * Context menu handler
 * Prevents right-click except on interactive elements
 */
document.addEventListener('contextmenu', event => {
    const target = event.target;
    const allowedElements = 'input, textarea, select, button, [contenteditable="true"]';

    if (target && target.closest(allowedElements)) {
        return; // Allow context menu on form elements
    }

    event.preventDefault();
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    VersionManager.destroy();
});
