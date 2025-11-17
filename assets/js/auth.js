/**
 * Authentifizierungs-Verwaltung für SimpliMed
 */

const AuthManager = {
    STORAGE_KEY_SESSION: 'simplimed_session',
    STORAGE_KEY_USERTYPE: 'simplimed_usertype',
    STORAGE_KEY_USERNAME: 'simplimed_username',
    STORAGE_KEY_REMEMBER: 'simplimed_remember',
    STORAGE_KEY_REMEMBER_CHOICE: 'simplimed_remember_choice',
    STORAGE_KEY_LAST_LOGIN_TYPE: 'simplimed_last_login_type',

    VALID_USERNAME: 'admin',
    VALID_PASSWORD: 'admin123',

    /**
     * Prüft ob ein Benutzer eingeloggt ist
     * @returns {boolean}
     */
    isLoggedIn() {
        return localStorage.getItem(this.STORAGE_KEY_SESSION) === 'true';
    },

    /**
     * Gibt den aktuellen Benutzertyp zurück
     * @returns {string|null} 'patient' oder 'therapist'
     */
    getUserType() {
        return localStorage.getItem(this.STORAGE_KEY_USERTYPE);
    },

    /**
     * Gibt den aktuellen Benutzernamen zurück
     * @returns {string|null}
     */
    getUsername() {
        return localStorage.getItem(this.STORAGE_KEY_USERNAME);
    },

    /**
     * Führt Login durch
     * @param {string} username
     * @param {string} password
     * @param {string} userType - 'patient' oder 'therapist'
     * @param {boolean} rememberMe
     * @returns {boolean} Erfolg
     */
    login(username, password, userType, rememberMe) {
        // Normalize credentials to make login checks case-insensitive
        const cleanedUsername = (username || '').trim();
        const normalizedUsername = cleanedUsername.toLowerCase();
        const normalizedPassword = (password || '').toLowerCase();
        const validUsername = this.VALID_USERNAME.toLowerCase();
        const validPassword = this.VALID_PASSWORD.toLowerCase();

        if (normalizedUsername === validUsername && normalizedPassword === validPassword) {
            localStorage.setItem(this.STORAGE_KEY_SESSION, 'true');
            localStorage.setItem(this.STORAGE_KEY_USERTYPE, userType);
            localStorage.setItem(this.STORAGE_KEY_USERNAME, cleanedUsername);
            if (rememberMe) {
                const credentials = { username: cleanedUsername, password };
                localStorage.setItem(this.STORAGE_KEY_REMEMBER, JSON.stringify(credentials));
            } else {
                localStorage.removeItem(this.STORAGE_KEY_REMEMBER);
            }
            return true;
        }
        return false;
    },

    /**
     * Führt Logout durch
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY_SESSION);
        localStorage.removeItem(this.STORAGE_KEY_USERTYPE);
        localStorage.removeItem(this.STORAGE_KEY_USERNAME);
    },

    /**
     * Gibt die gespeicherten Anmeldeinformationen zurück
     * @returns {{username, password}|null}
     */
    getRememberedUser() {
        const stored = localStorage.getItem(this.STORAGE_KEY_REMEMBER);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    },

    /**
     * Speichert die Auswahl der Remember-Me-Option
     * @param {boolean} remember
     */
    setRememberChoice(remember) {
        localStorage.setItem(this.STORAGE_KEY_REMEMBER_CHOICE, remember ? 'true' : 'false');
    },

    /**
     * Gibt die Remember-Me-Auswahl zurück
     * @returns {boolean|null}
     */
    getRememberChoice() {
        const stored = localStorage.getItem(this.STORAGE_KEY_REMEMBER_CHOICE);
        if (stored === null) {
            return null;
        }
        return stored === 'true';
    },

    /**
     * Speichert den zuletzt verwendeten Login-Typ
     * @param {string} loginType - 'patient' oder 'therapist'
     */
    setLastLoginType(loginType) {
        localStorage.setItem(this.STORAGE_KEY_LAST_LOGIN_TYPE, loginType);
    },

    /**
     * Gibt den zuletzt verwendeten Login-Typ zurück
     * @returns {string} 'patient' oder 'therapist', default 'patient'
     */
    getLastLoginType() {
        return localStorage.getItem(this.STORAGE_KEY_LAST_LOGIN_TYPE) || 'patient';
    }
};
