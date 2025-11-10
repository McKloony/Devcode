/**
 * Internationalisierung für SimpliMed
 * Unterstützt 9 Sprachen: de, en, fr, es, it, ru, uk, nl, sv
 */

const I18n = {
    STORAGE_KEY: 'simplimed_language',
    DEFAULT_LANGUAGE: 'de',
    LANGUAGES: ['de', 'en', 'fr', 'es', 'it', 'ru', 'uk', 'nl', 'sv'],

    translations: {},
    currentLanguage: '',

    /**
     * Initialisiert das i18n-System
     */
    async init() {
        this.currentLanguage = this.getLanguage();
        await this.loadTranslations(this.currentLanguage);
        document.documentElement.setAttribute('lang', this.currentLanguage);
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
     * Setzt die aktuelle Sprache
     * @param {string} langCode - Sprachcode
     */
    async setLanguage(langCode) {
        if (!this.LANGUAGES.includes(langCode)) {
            langCode = this.DEFAULT_LANGUAGE;
        }
        this.currentLanguage = langCode;
        localStorage.setItem(this.STORAGE_KEY, langCode);
        await this.loadTranslations(langCode);
        document.documentElement.setAttribute('lang', langCode);
    },

    /**
     * Lädt Übersetzungen aus JSON-Datei
     * @param {string} langCode - Sprachcode
     */
    async loadTranslations(langCode) {
        try {
            const response = await fetch(`assets/locales/${langCode}.json`);
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
