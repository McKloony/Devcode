/**
 * SimpliMed View Templates
 * Separates markup from router logic for easier debugging and maintenance
 * @version 1.1.4
 */
const ViewTemplates = {
    /**
     * Gets the current year for copyright notices
     * @returns {number} Current year
     */
    getCurrentYear() {
        return new Date().getFullYear();
    },
    // ========================================
    // LOGIN VIEW
    // ========================================

    /**
     * Renders the login view markup
     * @returns {string} HTML template string
     */
    getLoginView() {
        return `
            <div class="titlebar">
                <div class="titlebar-logo-container">
                    <img
                        src="assets/images/logos/logo_simplimed_fullsize.svg"
                        alt="SimpliMed"
                        class="titlebar-logo"
                    >
                </div>
                <div class="titlebar-center"></div>
                <div class="titlebar-right">
                    <div class="avatar-container" id="avatar">
                        <div class="avatar">
                            <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span class="iconify avatar-indicator" data-icon="tabler:chevron-down"></span>
                    </div>
                </div>
            </div>

            <div class="app-content">
                <div class="login-container">
                    <div class="login-wrapper">
                        <div class="login-card">
                            <h1 class="login-title" id="login-type-title">
                                ${I18n.t('login.patientLogin')}
                            </h1>

                            <form id="login-form">
                                <div class="form-group">
                                    <label class="form-label">${I18n.t('login.username')}</label>
                                    <input type="text" class="form-input" id="username" name="username" required autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email" placeholder="${I18n.t('login.usernamePlaceholder')}">
                                </div>

                                <div id="password-group" class="form-group">
                                    <label class="form-label">${I18n.t('login.password')}</label>
                                    <div class="password-input-wrapper">
                                        <input type="password" class="form-input" id="password" name="password" required autocomplete="current-password" placeholder="${I18n.t('login.passwordPlaceholder')}">
                                        <span id="toggle-password" class="iconify password-toggle" data-icon="tabler:eye-off"></span>
                                    </div>
                                </div>

                                <div class="form-toggle-row">
                                    <label class="form-toggle" for="remember-me">
                                        <input type="checkbox" class="form-toggle-input" id="remember-me" name="remember-me">
                                        <span class="form-toggle-visual" aria-hidden="true">
                                            <span class="form-toggle-knob"></span>
                                        </span>
                                        <span class="form-toggle-label">${I18n.t('login.rememberMe')}</span>
                                    </label>
                                    <a href="#" class="form-link">${I18n.t('login.forgotPassword')}</a>
                                </div>

                                <button type="submit" class="btn-primary" style="margin-top: 28px;">
                                    ${I18n.t('login.loginButton')}
                                </button>
                            </form>
                        </div>

                        <a href="#" class="switch-login-type-link" id="switch-login-type">
                            ${I18n.t('login.switchToTherapist')}
                        </a>

                        <div id="error-message" style="display: none;" class="error-message-external"></div>
                    </div>
                </div>
            </div>

            <div class="avatar-menu" id="avatar-menu">
                <div class="avatar-menu-section">
                    <select class="avatar-menu-select" id="theme-select">
                        <option value="light">${I18n.t('themes.light')}</option>
                        <option value="dark">${I18n.t('themes.dark')}</option>
                        <option value="design">${I18n.t('themes.design')}</option>
                        <option value="contrast">${I18n.t('themes.contrast')}</option>
                    </select>
                </div>

                <div class="avatar-menu-section">
                    <select class="avatar-menu-select" id="language-select">
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="it">Italiano</option>
                        <option value="ru">Русский</option>
                        <option value="uk">Українська</option>
                        <option value="nl">Nederlands</option>
                        <option value="sv">Svenska</option>
                    </select>
                </div>

                <div class="avatar-menu-section">
                    <div class="avatar-menu-item">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:help"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.help')}</span>
                    </div>
                    <div class="avatar-menu-item">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:mail"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.contact')}</span>
                    </div>
                    <div class="avatar-menu-item" data-action="imprint">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:info-circle"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.imprint')}</span>
                    </div>
                </div>
            </div>

            <div class="statusbar">
                <div class="statusbar-left">
                    <span>© ${this.getCurrentYear()} SimpliMed GmbH</span>
                </div>
                <div class="statusbar-right">
                    <span>${I18n.t('statusbar.release')}: ${window.APP_VERSION || '1.0.0'}</span>
                </div>
            </div>
        `;
    },

    // ========================================
    // DASHBOARD VIEW
    // ========================================

    /**
     * Renders the dashboard view markup
     * @param {string} userType - Either 'patient' or 'therapist'
     * @returns {string} HTML template string
     */
    getDashboardView(userType) {
        const modules = userType === 'therapist' ? this.getTherapistModules() : this.getPatientModules();
        const isSidenavCollapsed = localStorage.getItem('simplimed_sidenav_collapsed') === 'true';

        // Logout-Modul von den Hauptmodulen trennen
        const logoutModule = modules.pop();
        const mainModules = modules;

        // Alle Module für Bottom Navigation (ohne Logout)
        const bottomNavModules = mainModules;

        return `
            <div class="sidenav ${isSidenavCollapsed ? 'collapsed' : ''}" id="sidenav">
                <div class="sidenav-logo-container" id="sidenav-logo">
                    <img
                        src="assets/images/logos/logo_simplimed_fullsize.svg"
                        alt="SimpliMed"
                        class="sidenav-logo sidenav-logo-full"
                        id="sidenav-logo-full"
                    >
                    <img
                        src="assets/images/logos/logo_simplimed_smallsize.svg"
                        alt="SimpliMed"
                        class="sidenav-logo sidenav-logo-small"
                        id="sidenav-logo-small"
                    >
                </div>

                <div class="sidenav-items" id="sidenav-items">
                    ${mainModules.map((module, index) => `
                        <div class="sidenav-item ${index === 0 ? 'active' : ''}" data-module="${module.id}">
                            <span class="iconify sidenav-item-icon" data-icon="${module.icon}"></span>
                            <span class="sidenav-item-text">${module.name}</span>
                        </div>
                    `).join('')}

                    <div class="sidenav-divider" aria-hidden="true"></div>

                    <div class="sidenav-item" data-module="${logoutModule.id}">
                        <span class="iconify sidenav-item-icon" data-icon="${logoutModule.icon}"></span>
                        <span class="sidenav-item-text">${logoutModule.name}</span>
                    </div>
                </div>

                <div class="sidenav-toggle" id="sidenav-toggle">
                    <span class="iconify sidenav-toggle-icon" data-icon="tabler:chevron-left"></span>
                </div>
            </div>

            <div class="titlebar with-sidenav ${isSidenavCollapsed ? 'sidenav-collapsed' : ''}" id="titlebar">
                <div class="titlebar-logo-container mobile-only">
                    <img
                        src="assets/images/logos/logo_simplimed_fullsize.svg"
                        alt="SimpliMed"
                        class="titlebar-logo"
                    >
                </div>
                <div class="titlebar-search">
                    <div class="search-input-container">
                        <span class="iconify search-icon" data-icon="tabler:search"></span>
                        <input
                            type="text"
                            class="search-input"
                            placeholder="${I18n.t('search.search')}"
                            id="search-input"
                        >
                        <button
                            type="button"
                            class="search-clear-button"
                            id="search-clear-button"
                            aria-label="${I18n.t('search.clear')}"
                        >
                            <span class="iconify" data-icon="tabler:x"></span>
                        </button>
                    </div>
                </div>

                <div class="titlebar-right">
                    <div class="avatar-container" id="avatar">
                        <div class="avatar">
                            <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span class="iconify avatar-indicator" data-icon="tabler:chevron-down"></span>
                    </div>
                </div>
            </div>

            <div class="avatar-menu" id="avatar-menu">
                <div class="avatar-menu-section">
                    <select class="avatar-menu-select" id="theme-select">
                        <option value="light">${I18n.t('themes.light')}</option>
                        <option value="dark">${I18n.t('themes.dark')}</option>
                        <option value="design">${I18n.t('themes.design')}</option>
                        <option value="contrast">${I18n.t('themes.contrast')}</option>
                    </select>
                </div>

                <div class="avatar-menu-section">
                    <select class="avatar-menu-select" id="language-select">
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="it">Italiano</option>
                        <option value="ru">Русский</option>
                        <option value="uk">Українська</option>
                        <option value="nl">Nederlands</option>
                        <option value="sv">Svenska</option>
                    </select>
                </div>

                <div class="avatar-menu-section">
                    <div class="avatar-menu-item" data-action="profile">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:user"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.profile')}</span>
                    </div>
                    <div class="avatar-menu-item" data-action="settings">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:settings"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.settings')}</span>
                    </div>
                </div>

                <div class="avatar-menu-section">
                    <div class="avatar-menu-item">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:help"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.help')}</span>
                    </div>
                </div>

                <div class="avatar-menu-section">
                    <div class="avatar-menu-item" data-action="logout">
                        <span class="iconify avatar-menu-icon" data-icon="tabler:logout"></span>
                        <span class="avatar-menu-text">${I18n.t('menu.logout')}</span>
                    </div>
                </div>
            </div>

            <div class="toolbar with-sidenav ${isSidenavCollapsed ? 'sidenav-collapsed' : ''}" id="toolbar">
                <button class="btn-cta context-accent">
                    <span id="cta-text">${I18n.t('buttons.addWidget')}</span>
                </button>
            </div>

            <!-- Mobile Toolbar mit Suchfeld -->
            <div class="mobile-toolbar" id="mobile-toolbar">
                <div class="mobile-toolbar-search">
                    <span class="iconify mobile-toolbar-search-icon" data-icon="tabler:search" id="mobile-search-icon"></span>
                    <input
                        type="text"
                        class="mobile-toolbar-search-input"
                        placeholder="${I18n.t('search.search')}"
                        id="mobile-search-input"
                    >
                    <button
                        type="button"
                        class="mobile-search-clear-button"
                        id="mobile-search-clear"
                        aria-label="${I18n.t('search.clear')}"
                    >
                        <span class="iconify" data-icon="tabler:x"></span>
                    </button>
                </div>
            </div>

            <!-- Floating Action Button -->
            <button class="fab" id="fab">
                <span class="iconify fab-icon" data-icon="tabler:plus"></span>
                <span class="fab-text" id="fab-text">${I18n.t('buttons.new')}</span>
            </button>

            <div class="app-content with-toolbar" style="margin-left: ${isSidenavCollapsed ? '64px' : '230px'};" id="app-content">
                <div style="padding: 24px;">
                    <h1 id="module-title" style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">${I18n.t('dashboard.title')}</h1>
                    <p style="color: var(--color-text-secondary);">${I18n.t('dashboard.content')}</p>
                </div>
            </div>

            <div class="bottom-navigation" id="bottom-navigation">
                ${bottomNavModules.map((module, index) => `
                    <div class="bottom-nav-item ${index === 0 ? 'active' : ''}" data-module="${module.id}">
                        <span class="iconify bottom-nav-item-icon" data-icon="${module.icon}"></span>
                        <span class="bottom-nav-item-text">${module.name}</span>
                    </div>
                `).join('')}
                <div class="bottom-nav-item overflow-menu" id="bottom-nav-overflow">
                    <div class="bottom-nav-item-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="bottom-nav-item-text">${I18n.t('buttons.more')}</span>
                </div>
            </div>

            <div class="bottom-nav-overflow-popup" id="bottom-nav-overflow-popup">
                <!-- Overflow items werden hier dynamisch eingefügt -->
            </div>

            <div class="statusbar">
                <div class="statusbar-left">
                    <div class="statusbar-item module-info">
                        <span class="iconify statusbar-icon" data-icon="tabler:layout-dashboard"></span>
                        <span id="statusbar-module">${I18n.t('modules.dashboard')}</span>
                    </div>
                </div>
                <div class="statusbar-right">
                    <div class="statusbar-item user-info">
                        <span class="iconify statusbar-icon" data-icon="tabler:user"></span>
                        <span id="statusbar-user">${AuthManager.getUsername() || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================
    // MODULE CONFIGURATIONS
    // ========================================

    /**
     * Gets patient-specific modules
     * @returns {Array<{id:string, name:string, icon:string}>} Module configuration array
     */
    getPatientModules() {
        return [
            { id: 'dashboard', name: I18n.t('modules.dashboard'), icon: 'tabler:smart-home' },
            { id: 'appointments', name: I18n.t('modules.appointments'), icon: 'tabler:calendar-time' },
            { id: 'documents', name: I18n.t('modules.documents'), icon: 'tabler:file-type-pdf' },
            { id: 'healthtalk', name: I18n.t('modules.healthtalk'), icon: 'tabler:brand-hipchat' },
            { id: 'payments', name: I18n.t('modules.payments'), icon: 'tabler:credit-card' },
            { id: 'healthshop', name: I18n.t('modules.healthshop'), icon: 'tabler:shopping-bag' },
            { id: 'logout', name: I18n.t('menu.logout'), icon: 'tabler:door-exit' }
        ];
    },

    /**
     * Gets therapist-specific modules
     * @returns {Array<{id:string, name:string, icon:string}>} Module configuration array
     */
    getTherapistModules() {
        return [
            { id: 'dashboard', name: I18n.t('modules.dashboard'), icon: 'tabler:smart-home' },
            { id: 'calendar', name: I18n.t('modules.calendar'), icon: 'tabler:calendar-week' },
            { id: 'contacts', name: I18n.t('modules.contacts'), icon: 'tabler:users' },
            { id: 'documentation', name: I18n.t('modules.documentation'), icon: 'tabler:notes' },
            { id: 'invoices', name: I18n.t('modules.invoices'), icon: 'tabler:cash-register' },
            { id: 'payments', name: I18n.t('modules.payments'), icon: 'tabler:credit-card' },
            { id: 'healthtalk', name: I18n.t('modules.healthtalk'), icon: 'tabler:brand-hipchat' },
            { id: 'healthshop', name: I18n.t('modules.healthshop'), icon: 'tabler:shopping-bag' },
            { id: 'logout', name: I18n.t('menu.logout'), icon: 'tabler:door-exit' }
        ];
    },

    // ========================================
    // IMPRINT POPUP
    // ========================================

    /**
     * Renders the imprint popup markup
     * @param {Object} imprintData - Imprint data from JSON
     * @returns {string} HTML template string
     */
    getImprintPopup(imprintData) {
        return `
            <div class="imprint-overlay" id="imprint-overlay">
                <div class="imprint-popup">
                    <div class="imprint-header">
                        <h2 class="imprint-title">${imprintData.title}</h2>
                        <button class="imprint-close" id="imprint-close" aria-label="Schließen">
                            <span class="iconify imprint-close-icon" data-icon="tabler:x"></span>
                        </button>
                    </div>
                    <div class="imprint-content">
                        <h3 class="imprint-subtitle">${imprintData.subtitle}</h3>

                        <div class="imprint-section">
                            <p class="imprint-company-name">${imprintData.company.name}</p>
                            <p class="imprint-text">${imprintData.company.address.street}</p>
                            <p class="imprint-text">${imprintData.company.address.zipCode} ${imprintData.company.address.city}</p>
                            <p class="imprint-text">${imprintData.company.address.country}</p>
                        </div>

                        <div class="imprint-divider"></div>

                        <div class="imprint-section">
                            <p class="imprint-text"><strong>Registergericht:</strong> ${imprintData.company.registration.court} ${imprintData.company.registration.number}</p>
                            <p class="imprint-text"><strong>Geschäftsführer:</strong> ${imprintData.company.management}</p>
                            <p class="imprint-text"><strong>Ust.-ID.-Nr:</strong> ${imprintData.company.vatId}</p>
                        </div>

                        <div class="imprint-divider"></div>

                        <div class="imprint-section">
                            <p class="imprint-text"><strong>Fon.:</strong> ${imprintData.company.contact.phone}</p>
                            <p class="imprint-text"><strong>Fax.:</strong> ${imprintData.company.contact.fax}</p>
                            <p class="imprint-text"><strong>E-Mail:</strong> ${imprintData.company.contact.email}</p>
                        </div>

                        <div class="imprint-divider"></div>

                        <div class="imprint-section">
                            <h4 class="imprint-section-title">${imprintData.disclaimer.title}</h4>
                            <p class="imprint-text">${imprintData.disclaimer.text}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
