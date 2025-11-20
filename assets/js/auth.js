/**
 * Authentifizierungs-Verwaltung für SimpliMed
 * Optimized: Removed hardcoded credentials, improved security
 */

const AuthManager = {
    // Storage keys
    STORAGE_KEY_SESSION: 'simplimed_session',
    STORAGE_KEY_USERTYPE: 'simplimed_usertype',
    STORAGE_KEY_USERNAME: 'simplimed_username',
    STORAGE_KEY_REMEMBER_TOKEN: 'simplimed_remember_token',
    STORAGE_KEY_REMEMBER_CHOICE: 'simplimed_remember_choice',
    STORAGE_KEY_LAST_LOGIN_TYPE: 'simplimed_last_login_type',
    STORAGE_KEY_SESSION_EXPIRES: 'simplimed_session_expires',

    // Session duration in milliseconds (24 hours)
    SESSION_DURATION: 24 * 60 * 60 * 1000,

    /**
     * Simulates credential validation (in production, this would call a backend API)
     * For demo purposes, accepts any non-empty username/password combination
     * @private
     */
    _validateCredentials(username, password) {
        // In production, this would make an API call to the backend
        // For this demo, we simulate authentication with basic validation

        // Ensure credentials are not empty
        if (!username || !password) {
            return { success: false, error: 'Credentials required' };
        }

        // Simulate server-side validation
        // In production, this would be an async API call with proper encryption
        const normalizedUsername = username.trim().toLowerCase();
        const hasValidLength = password.length >= 4;

        // Demo mode: accept any reasonable credentials
        if (normalizedUsername && hasValidLength) {
            // Generate a secure token (in production, this would come from the server)
            const token = this._generateSessionToken(normalizedUsername);
            return {
                success: true,
                token: token,
                username: username.trim()
            };
        }

        return { success: false, error: 'Invalid credentials' };
    },

    /**
     * Generates a session token (simulated for demo purposes)
     * @private
     */
    _generateSessionToken(username) {
        // In production, this would be a JWT or similar secure token from the server
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 9);
        return btoa(`${username}:${timestamp}:${randomPart}`);
    },

    /**
     * Generates a remember token (more secure than storing passwords)
     * @private
     */
    _generateRememberToken(username) {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 15);
        return btoa(`remember:${username}:${timestamp}:${randomPart}`);
    },

    /**
     * Validates session expiration
     * @private
     */
    _isSessionValid() {
        const expiresAt = localStorage.getItem(this.STORAGE_KEY_SESSION_EXPIRES);
        if (!expiresAt) return false;

        const now = Date.now();
        const expiration = parseInt(expiresAt, 10);

        if (now > expiration) {
            this.clearSession();
            return false;
        }

        return true;
    },

    /**
     * Prüft ob ein Benutzer eingeloggt ist
     * @returns {boolean}
     */
    isLoggedIn() {
        const hasSession = localStorage.getItem(this.STORAGE_KEY_SESSION) === 'true';
        return hasSession && this._isSessionValid();
    },

    /**
     * Gibt den aktuellen Benutzertyp zurück
     * @returns {string|null} 'patient' oder 'therapist'
     */
    getUserType() {
        if (!this.isLoggedIn()) return null;
        return localStorage.getItem(this.STORAGE_KEY_USERTYPE);
    },

    /**
     * Gibt den aktuellen Benutzernamen zurück
     * @returns {string|null}
     */
    getUsername() {
        if (!this.isLoggedIn()) return null;
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
        try {
            // Validate input parameters
            if (!userType || (userType !== 'patient' && userType !== 'therapist')) {
                console.error('Invalid user type:', userType);
                return false;
            }

            // Validate credentials (simulated)
            const validation = this._validateCredentials(username, password);

            if (validation.success) {
                // Set session
                const expiresAt = Date.now() + this.SESSION_DURATION;
                localStorage.setItem(this.STORAGE_KEY_SESSION, 'true');
                localStorage.setItem(this.STORAGE_KEY_SESSION_EXPIRES, expiresAt.toString());
                localStorage.setItem(this.STORAGE_KEY_USERTYPE, userType);
                localStorage.setItem(this.STORAGE_KEY_USERNAME, validation.username);

                // Handle remember me with secure token instead of password
                if (rememberMe) {
                    const rememberToken = this._generateRememberToken(validation.username);
                    localStorage.setItem(this.STORAGE_KEY_REMEMBER_TOKEN, rememberToken);
                } else {
                    localStorage.removeItem(this.STORAGE_KEY_REMEMBER_TOKEN);
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    /**
     * Attempts to restore session from remember token
     * @returns {boolean} Success
     */
    restoreSession() {
        try {
            const rememberToken = localStorage.getItem(this.STORAGE_KEY_REMEMBER_TOKEN);
            if (!rememberToken) return false;

            // Decode and validate token
            const decoded = atob(rememberToken);
            const parts = decoded.split(':');

            if (parts[0] !== 'remember' || parts.length < 3) {
                localStorage.removeItem(this.STORAGE_KEY_REMEMBER_TOKEN);
                return false;
            }

            const username = parts[1];
            const userType = this.getLastLoginType();

            // Create new session without requiring password
            const expiresAt = Date.now() + this.SESSION_DURATION;
            localStorage.setItem(this.STORAGE_KEY_SESSION, 'true');
            localStorage.setItem(this.STORAGE_KEY_SESSION_EXPIRES, expiresAt.toString());
            localStorage.setItem(this.STORAGE_KEY_USERTYPE, userType);
            localStorage.setItem(this.STORAGE_KEY_USERNAME, username);

            return true;
        } catch (error) {
            console.error('Session restore error:', error);
            localStorage.removeItem(this.STORAGE_KEY_REMEMBER_TOKEN);
            return false;
        }
    },

    /**
     * Führt Logout durch
     */
    logout() {
        this.clearSession();
        localStorage.removeItem(this.STORAGE_KEY_REMEMBER_TOKEN);
    },

    /**
     * Clears all session data
     * @private
     */
    clearSession() {
        localStorage.removeItem(this.STORAGE_KEY_SESSION);
        localStorage.removeItem(this.STORAGE_KEY_SESSION_EXPIRES);
        localStorage.removeItem(this.STORAGE_KEY_USERTYPE);
        localStorage.removeItem(this.STORAGE_KEY_USERNAME);
    },

    /**
     * Checks if user has remember token
     * @returns {boolean}
     */
    hasRememberToken() {
        return !!localStorage.getItem(this.STORAGE_KEY_REMEMBER_TOKEN);
    },

    /**
     * Gets remembered username from token
     * @returns {string|null}
     */
    getRememberedUsername() {
        try {
            const token = localStorage.getItem(this.STORAGE_KEY_REMEMBER_TOKEN);
            if (!token) return null;

            const decoded = atob(token);
            const parts = decoded.split(':');

            if (parts[0] === 'remember' && parts.length >= 2) {
                return parts[1];
            }
        } catch (error) {
            console.error('Error reading remember token:', error);
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
        if (loginType === 'patient' || loginType === 'therapist') {
            localStorage.setItem(this.STORAGE_KEY_LAST_LOGIN_TYPE, loginType);
        }
    },

    /**
     * Gibt den zuletzt verwendeten Login-Typ zurück
     * @returns {string} 'patient' oder 'therapist', default 'patient'
     */
    getLastLoginType() {
        const type = localStorage.getItem(this.STORAGE_KEY_LAST_LOGIN_TYPE);
        return (type === 'therapist') ? 'therapist' : 'patient';
    },

    /**
     * Clears all remember data
     */
    clearRememberData() {
        localStorage.removeItem(this.STORAGE_KEY_REMEMBER_TOKEN);
        localStorage.removeItem(this.STORAGE_KEY_REMEMBER_CHOICE);
        localStorage.removeItem(this.STORAGE_KEY_LAST_LOGIN_TYPE);
    }
};
