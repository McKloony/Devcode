/**
 * SimpliMed Internationalization (i18n)
 * Supports 9 languages: de, en, fr, es, it, ru, uk, nl, sv
 * @version 1.1.4
 */

const I18n = {
    STORAGE_KEY: 'simplimed_language',
    DEFAULT_LANGUAGE: 'de',
    LANGUAGES: ['de', 'en', 'fr', 'es', 'it', 'ru', 'uk', 'nl', 'sv'],

    translations: {},
    currentLanguage: '',

    /**
     * Initializes the i18n system
     */
    async init() {
        this.currentLanguage = this.getLanguage();
        await this.loadTranslations(this.currentLanguage);
        this.updateDocumentLanguage(this.currentLanguage);
    },

    /**
     * Gibt die aktuell gespeicherte Sprache zurück
     * @returns {string} Sprachcode
     */
    getLanguage() {
        const lang = localStorage.getItem(this.STORAGE_KEY);
        return this.LANGUAGES.includes(lang) ? lang : this.DEFAULT_LANGUAGE;
    },

    /**
     * Sets the current language
     * @param {string} langCode - Language code
     */
    async setLanguage(langCode) {
        if (!this.LANGUAGES.includes(langCode)) {
            langCode = this.DEFAULT_LANGUAGE;
        }
        this.currentLanguage = langCode;
        localStorage.setItem(this.STORAGE_KEY, langCode);
        await this.loadTranslations(langCode);
        this.updateDocumentLanguage(langCode);
    },

    /**
     * Updates the document language attribute
     * @param {string} langCode - Language code
     */
    updateDocumentLanguage(langCode) {
        const html = document.documentElement;
        html.setAttribute('lang', langCode);
        // Also update meta tags if needed
        const metaLang = document.querySelector('meta[http-equiv="Content-Language"]');
        if (metaLang) {
            metaLang.setAttribute('content', langCode);
        }
    },

    /**
     * Lädt Übersetzungen aus JSON-Datei
     * @param {string} langCode - Sprachcode
     */
    async loadTranslations(langCode) {
        try {
            const versionParam = window.APP_VERSION
                ? `?v=${encodeURIComponent(window.APP_VERSION)}`
                : `?t=${Date.now()}`;
            const response = await fetch(`assets/locales/${langCode}.json${versionParam}`);
            this.translations = await response.json();
        } catch (error) {
            console.error(`Failed to load translations for ${langCode}`, error);
            if (langCode !== this.DEFAULT_LANGUAGE) {
                await this.loadTranslations(this.DEFAULT_LANGUAGE);
            }
        }
    },

    /**
     * Gibt die Übersetzung für einen Key zurück
     * @param {string} key - Übersetzungs-Key (z.B. 'login.title')
     * @returns {string} Übersetzter Text
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    }
};
