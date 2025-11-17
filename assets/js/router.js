/**
 * Einfacher Router für SimpliMed
 */

const Router = {
    currentView: 'login',
    _autoLoginAttempted: false,

    /**
     * Navigiert zu einer View
     * @param {string} viewName - Name der View
     */
    navigate(viewName) {
        this.currentView = viewName;
        this.render();
    },

    /**
     * Rendert die aktuelle View
     */
    render() {
        const app = document.getElementById('app');

        if (!AuthManager.isLoggedIn()) {
            if (!this._autoLoginAttempted) {
                this._autoLoginAttempted = true;
                const rememberChoice = AuthManager.getRememberChoice();
                const rememberedUser = AuthManager.getRememberedUser();

                if (rememberChoice === true && rememberedUser) {
                    const userType = AuthManager.getLastLoginType();
                    const success = AuthManager.login(
                        rememberedUser.username,
                        rememberedUser.password,
                        userType,
                        true
                    );

                    if (success) {
                        app.innerHTML = ViewTemplates.getDashboardView(userType);
                        this.attachDashboardEventListeners(userType);
                        return;
                    }
                }
            }

            app.innerHTML = ViewTemplates.getLoginView();
            this.attachLoginEventListeners();
        } else {
            const userType = AuthManager.getUserType();
            app.innerHTML = ViewTemplates.getDashboardView(userType);
            this.attachDashboardEventListeners(userType);
        }
    },

    /**
     * Fügt Event-Listener für Login hinzu
     */
    attachLoginEventListeners() {
        // Wiederherstellen des zuletzt verwendeten Login-Typs
        let selectedUserType = AuthManager.getLastLoginType();

        // UI entsprechend dem gespeicherten Login-Typ initialisieren
        const titleEl = document.getElementById('login-type-title');
        const linkEl = document.getElementById('switch-login-type');
        if (selectedUserType === 'therapist') {
            titleEl.textContent = I18n.t('login.therapistLogin');
            linkEl.textContent = I18n.t('login.switchToPatient');
        } else {
            titleEl.textContent = I18n.t('login.patientLogin');
            linkEl.textContent = I18n.t('login.switchToTherapist');
        }

        // Benutzernamen und Passwort aus dem Local Storage abrufen
        const rememberedUser = AuthManager.getRememberedUser();
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser.username;
            document.getElementById('password').value = rememberedUser.password;
        }

        const rememberMeInput = document.getElementById('remember-me');
        const storedRememberChoice = AuthManager.getRememberChoice();
        if (storedRememberChoice !== null) {
            rememberMeInput.checked = storedRememberChoice;
        } else if (rememberedUser) {
            rememberMeInput.checked = true;
        }

        rememberMeInput.addEventListener('change', (event) => {
            AuthManager.setRememberChoice(event.target.checked);
        });

        // Switch Login Type Link
        document.getElementById('switch-login-type').addEventListener('click', (e) => {
            e.preventDefault();
            const titleEl = document.getElementById('login-type-title');
            const linkEl = document.getElementById('switch-login-type');

            if (selectedUserType === 'patient') {
                selectedUserType = 'therapist';
                titleEl.textContent = I18n.t('login.therapistLogin');
                linkEl.textContent = I18n.t('login.switchToPatient');
            } else {
                selectedUserType = 'patient';
                titleEl.textContent = I18n.t('login.patientLogin');
                linkEl.textContent = I18n.t('login.switchToTherapist');
            }

            // Login-Typ für zukünftige Besuche speichern
            AuthManager.setLastLoginType(selectedUserType);
        });

        // Login-Form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('remember-me').checked;

            const success = AuthManager.login(username, password, selectedUserType, rememberMe);

            if (success) {
                requestAnimationFrame(() => this.navigate('dashboard'));
            } else {
                const errorMsg = document.getElementById('error-message');
                errorMsg.textContent = I18n.t('login.errorInvalidCredentials');
                errorMsg.style.display = 'block';
            }
        });

        // Passwort-Toggler
        // Event-Delegation verwenden, um Klicks auf Iconify-SVG-Elemente zu erfassen
        const passwordGroup = document.getElementById('password-group');
        if (passwordGroup) {
            passwordGroup.addEventListener('click', (e) => {
                // Prüfen ob das geklickte Element das toggle-password Element ist
                // oder innerhalb davon liegt (für Iconify SVG-Elemente)
                const toggleElement = e.target.closest('#toggle-password');
                if (toggleElement || e.target.id === 'toggle-password') {
                    const passwordInput = document.getElementById('password');
                    const togglePassword = document.getElementById('toggle-password');
                    if (passwordInput && togglePassword) {
                        if (passwordInput.type === 'password') {
                            passwordInput.type = 'text';
                            togglePassword.setAttribute('data-icon', 'tabler:eye');
                        } else {
                            passwordInput.type = 'password';
                            togglePassword.setAttribute('data-icon', 'tabler:eye-off');
                        }
                    }
                }
            });
        }

        this.attachAvatarMenuListeners();
    },
    /**
     * Aktualisiert die Statusleiste mit dem aktuellen Modulnamen
     * @param {string} moduleId - ID des aktuellen Moduls
     */
    updateStatusBar(moduleId) {
        const statusbarModule = document.getElementById('statusbar-module');
        const statusbarUser = document.getElementById('statusbar-user');

        if (statusbarModule && moduleId) {
            const moduleName = I18n.t(`modules.${moduleId}`);
            statusbarModule.textContent = moduleName;
        }

        if (statusbarUser) {
            const username = AuthManager.getUsername() || 'N/A';
            statusbarUser.textContent = username;
        }
    },

    /**
     * Berechnet und aktualisiert die Bottom Navigation Items basierend auf verfügbarem Platz
     */
    updateBottomNavigation() {
        const bottomNav = document.getElementById('bottom-navigation');
        if (!bottomNav) return;

        const allItems = Array.from(bottomNav.querySelectorAll('.bottom-nav-item:not(.overflow-menu)'));
        const overflowButton = document.getElementById('bottom-nav-overflow');
        const overflowPopup = document.getElementById('bottom-nav-overflow-popup');

        if (allItems.length === 0) return;

        const markNavigationReady = () => {
            if (!bottomNav.classList.contains('is-ready')) {
                bottomNav.classList.add('is-ready');
            }
        };

        // Breite der Bottom Navigation
        const containerWidth = bottomNav.offsetWidth;

        // Feste Breite pro Item (92px: 90px CSS-Breite + 2px Sicherheitspuffer für Abstände)
        const itemWidth = 92;

        // Berechne wie viele Items maximal passen
        let maxVisibleItems = Math.floor(containerWidth / itemWidth);

        // Wenn alle Items passen (ohne Overflow-Button)
        if (allItems.length <= maxVisibleItems) {
            allItems.forEach(item => item.style.display = 'flex');
            overflowButton.classList.remove('visible');
            overflowButton.style.display = 'none';
            overflowPopup.innerHTML = '';
            markNavigationReady();
            return;
        }

        // Andernfalls: zeige maxVisibleItems-1 Items + Overflow-Button
        // Mindestens 3 Items + Overflow
        const visibleCount = Math.max(2, maxVisibleItems - 1);
        const visibleItems = allItems.slice(0, visibleCount);
        const hiddenItems = allItems.slice(visibleCount);

        // Wenn es versteckte Items gibt
        if (hiddenItems.length > 0) {
            // Sichtbare Items anzeigen
            visibleItems.forEach(item => item.style.display = 'flex');

            // Versteckte Items ausblenden
            hiddenItems.forEach(item => item.style.display = 'none');

            // Overflow-Button anzeigen
            overflowButton.classList.add('visible');
            overflowButton.style.display = 'flex';

            // Overflow-Popup mit versteckten Items füllen
            const activeModule = document.querySelector('.bottom-nav-item.active') ||
                               document.querySelector('.bottom-nav-overflow-item.active');
            const activeModuleId = activeModule ? activeModule.dataset.module : null;

            overflowPopup.innerHTML = hiddenItems.map(item => {
                const moduleId = item.dataset.module;
                const icon = item.querySelector('.bottom-nav-item-icon').getAttribute('data-icon');
                const text = item.querySelector('.bottom-nav-item-text').textContent;
                const isActive = moduleId === activeModuleId;

                return `
                    <div class="bottom-nav-overflow-item ${isActive ? 'active' : ''}" data-module="${moduleId}">
                        <span class="iconify bottom-nav-overflow-item-icon" data-icon="${icon}"></span>
                        <span class="bottom-nav-overflow-item-text">${text}</span>
                    </div>
                `;
            }).join('');
        } else {
            // Alle Items anzeigen, Overflow verstecken
            allItems.forEach(item => item.style.display = 'flex');
            overflowButton.classList.remove('visible');
            overflowButton.style.display = 'none';
            overflowPopup.innerHTML = '';
        }

        markNavigationReady();
    },

    /**
     * Fügt Event-Listener für Dashboard hinzu
     * @param {string} userType
     */
    updateSearchUI(moduleId) {
        const searchIcon = document.querySelector('.search-icon');
        const searchInput = document.getElementById('search-input');
        const mobileSearchIcon = document.getElementById('mobile-search-icon');
        const mobileSearchInput = document.getElementById('mobile-search-input');

        // Desktop Suchleiste
        if (searchIcon && searchInput) {
            if (moduleId === 'dashboard') {
                searchIcon.setAttribute('data-icon', 'tabler:bolt');
                searchInput.placeholder = I18n.t('search.actionOrCommand');
            } else {
                searchIcon.setAttribute('data-icon', 'tabler:search');
                searchInput.placeholder = I18n.t('search.search');
            }
        }

        // Mobile Suchleiste
        if (mobileSearchIcon && mobileSearchInput) {
            if (moduleId === 'dashboard') {
                mobileSearchIcon.setAttribute('data-icon', 'tabler:bolt');
                mobileSearchInput.placeholder = I18n.t('search.action');
            } else {
                mobileSearchIcon.setAttribute('data-icon', 'tabler:search');
                mobileSearchInput.placeholder = I18n.t('search.search');
            }
        }
    },

    /**
     * Handles module navigation updates (shared logic for all navigation types)
     * @param {string} moduleId - The module to navigate to
     * @param {string} moduleName - Display name of the module
     */
    handleModuleNavigation(moduleId, moduleName) {
        // Update title
        const moduleTitle = document.getElementById('module-title');
        if (moduleTitle) {
            moduleTitle.textContent = moduleName;
        }

        // Update status bar
        this.updateStatusBar(moduleId);

        // Update search UI
        this.updateSearchUI(moduleId);

        // Update toolbar button text and FAB icon
        const ctaText = document.getElementById('cta-text');
        const fabIcon = document.querySelector('.fab-icon');

        if (ctaText) {
            ctaText.textContent = moduleId === 'dashboard'
                ? I18n.t('buttons.addWidget')
                : I18n.t('buttons.add');
        }

        if (fabIcon) {
            fabIcon.setAttribute('data-icon',
                moduleId === 'dashboard'
                    ? 'tabler:layout-dashboard'
                    : 'tabler:plus'
            );
        }

        // Module navigation: ${moduleId}
    },

    attachDashboardEventListeners(userType) {
        const sidenav = document.getElementById('sidenav');
        const sidenavToggle = document.getElementById('sidenav-toggle');
        const titlebar = document.getElementById('titlebar');
        const appContent = document.getElementById('app-content');
        const sidenavLogo = document.getElementById('sidenav-logo');
        const toolbar = document.getElementById('toolbar');
        const searchInput = document.getElementById('search-input');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mobileSearchIcon = document.getElementById('mobile-search-icon');
        const searchClearButton = document.getElementById('search-clear-button');
        const mobileSearchClearButton = document.getElementById('mobile-search-clear');
        const ctaText = document.getElementById('cta-text');
        const ctaButton = document.querySelector('.btn-cta');
        const fab = document.getElementById('fab');
        const fabText = document.getElementById('fab-text');

        // Search input helper functions
        const setupSearchInputs = () => {
            const toggleClearButtonVisibility = (inputEl, buttonEl) => {
                if (!buttonEl) return;
                const hasValue = inputEl && inputEl.value.trim().length > 0;
                buttonEl.classList.toggle('is-visible', hasValue);
            };

            const syncClearButtonVisibility = () => {
                toggleClearButtonVisibility(searchInput, searchClearButton);
                toggleClearButtonVisibility(mobileSearchInput, mobileSearchClearButton);
            };

            const syncSearchValues = (sourceInput, targetInput) => {
                if (targetInput) {
                    targetInput.value = sourceInput.value;
                }
                syncClearButtonVisibility();
            };

            const clearSearchInputs = () => {
                if (searchInput) searchInput.value = '';
                if (mobileSearchInput) mobileSearchInput.value = '';
                syncClearButtonVisibility();
            };

            return { syncClearButtonVisibility, syncSearchValues, clearSearchInputs };
        };

        const { syncClearButtonVisibility, syncSearchValues, clearSearchInputs } = setupSearchInputs();

        // Toolbar initial anpassen (sichtbar, korrekter Text für Dashboard)
        if (toolbar) {
            toolbar.style.display = 'flex';
            if (ctaText) {
                ctaText.textContent = I18n.t('buttons.addWidget');
            }
        }

        // CTA Button Funktionalität wurde entfernt - Buttons bleiben ohne Funktion

        // Mobile Suchfeld Event-Handler
        if (mobileSearchInput) {
            // Synchronisiere mit Desktop-Suchfeld
            mobileSearchInput.addEventListener('input', (e) => {
                syncSearchValues(e.target, searchInput);
            });

            // Enter-Taste für Dashboard-Aktionen
            mobileSearchInput.addEventListener('keydown', (e) => {
                const activeModule = document.querySelector('.bottom-nav-item.active');
                const moduleId = activeModule ? activeModule.dataset.module : 'dashboard';

                if (moduleId === 'dashboard' && e.key === 'Enter') {
                    e.preventDefault();
                    // Dashboard action executed
                    clearSearchInputs();
                }
            });
        }

        // Desktop Suchfeld synchronisieren
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                syncSearchValues(e.target, mobileSearchInput);
            });
        }

        if (searchClearButton && searchInput) {
            searchClearButton.addEventListener('click', () => {
                clearSearchInputs();
                searchInput.focus();
            });
        }

        if (mobileSearchClearButton && mobileSearchInput) {
            mobileSearchClearButton.addEventListener('click', () => {
                clearSearchInputs();
                mobileSearchInput.focus();
            });
        }

        // Suchleiste initial für Dashboard anpassen
        this.updateSearchUI('dashboard');

        // Event Listener für Such-Prompt auf Dashboard
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                const activeModule = document.querySelector('.sidenav-item.active');
                const moduleId = activeModule ? activeModule.dataset.module : 'dashboard';

                if (moduleId === 'dashboard' && e.key === 'Enter') {
                    e.preventDefault();
                    // Dashboard action executed
                    clearSearchInputs();
                }
            });
        }

        syncClearButtonVisibility();


        // Sidenav Toggle
        sidenavToggle.addEventListener('click', () => {
            // Animation-Klasse hinzufügen um Icons einzufrieren
            sidenav.classList.add('animating');

            // Kollabieren/Expandieren
            const isCollapsed = sidenav.classList.toggle('collapsed');
            titlebar.classList.toggle('sidenav-collapsed', isCollapsed);

            // Toolbar auch verschieben
            const toolbar = document.getElementById('toolbar');
            if (toolbar) {
                toolbar.classList.toggle('sidenav-collapsed', isCollapsed);
            }

            // Content verschieben
            appContent.style.marginLeft = isCollapsed ? '64px' : '230px';

            // Nach Animation: Einfrierung aufheben
            setTimeout(() => {
                sidenav.classList.remove('animating');
            }, 250); // Etwas länger als die 230ms Animation

            // Status speichern
            localStorage.setItem('simplimed_sidenav_collapsed', isCollapsed.toString());
        });

        // Logo Click
        const sidenavLogoContainer = document.getElementById('sidenav-logo');
        sidenavLogoContainer.addEventListener('click', () => {
            this.navigate('dashboard');
        });

        // Navigations-Items
        const navItems = document.querySelectorAll('.sidenav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.getAttribute('data-module');

                if (moduleId === 'logout') {
                    AuthManager.logout();
                    this.navigate('login');
                } else {
                    // Aktiven Status setzen
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // Get module name and handle navigation
                    const moduleName = item.querySelector('.sidenav-item-text').textContent;
                    this.handleModuleNavigation(moduleId, moduleName);
                }
            });
        });

        // Bottom Navigation Items
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item:not(.overflow-menu)');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.getAttribute('data-module');

                // Aktiven Status setzen
                bottomNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Desktop Sidenav auch synchronisieren
                navItems.forEach(i => {
                    if (i.getAttribute('data-module') === moduleId) {
                        navItems.forEach(n => n.classList.remove('active'));
                        i.classList.add('active');
                    }
                });

                // Get module name and handle navigation
                const moduleName = item.querySelector('.bottom-nav-item-text').textContent;
                this.handleModuleNavigation(moduleId, moduleName);

                // Bottom Navigation aktualisieren
                this.updateBottomNavigation();
            });
        });

        // Overflow Menu Button Click
        const overflowButton = document.getElementById('bottom-nav-overflow');
        const overflowPopup = document.getElementById('bottom-nav-overflow-popup');

        if (overflowButton && overflowPopup) {
            overflowButton.addEventListener('click', (e) => {
                e.stopPropagation();
                overflowPopup.classList.toggle('show');
            });

            // Klick außerhalb schließt Popup
            document.addEventListener('click', (e) => {
                if (!overflowPopup.contains(e.target) && e.target !== overflowButton && !overflowButton.contains(e.target)) {
                    overflowPopup.classList.remove('show');
                }
            });

            // Overflow Items Click Handler (Event Delegation)
            overflowPopup.addEventListener('click', (e) => {
                const overflowItem = e.target.closest('.bottom-nav-overflow-item');
                if (!overflowItem) return;

                const moduleId = overflowItem.dataset.module;

                // Popup schließen
                overflowPopup.classList.remove('show');

                // Aktiven Status setzen in Bottom Nav Items
                bottomNavItems.forEach(i => i.classList.remove('active'));
                const matchingItem = Array.from(bottomNavItems).find(i => i.dataset.module === moduleId);
                if (matchingItem) {
                    matchingItem.classList.add('active');
                }

                // Desktop Sidenav auch synchronisieren
                navItems.forEach(i => {
                    if (i.getAttribute('data-module') === moduleId) {
                        navItems.forEach(n => n.classList.remove('active'));
                        i.classList.add('active');
                    }
                });

                // Get module name and handle navigation
                const moduleName = overflowItem.querySelector('.bottom-nav-overflow-item-text').textContent;
                this.handleModuleNavigation(moduleId, moduleName);

                // Bottom Navigation aktualisieren
                this.updateBottomNavigation();
            });
        }

        // Initial Bottom Navigation aktualisieren (nachdem das Layout einmal berechnet wurde)
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(() => this.updateBottomNavigation());
        } else {
            this.updateBottomNavigation();
        }

        // Bei Fenstergrößenänderung Bottom Navigation aktualisieren (Frame-gebunden für flüssigere Updates)
        const handleResize = () => {
            if (typeof window.requestAnimationFrame === 'function') {
                if (this._resizeRafId) {
                    return;
                }
                this._resizeRafId = window.requestAnimationFrame(() => {
                    this._resizeRafId = null;
                    this.updateBottomNavigation();
                });
            } else {
                // Fallback wenn requestAnimationFrame nicht verfügbar ist
                this.updateBottomNavigation();
            }
        };

        // Entferne vorherigen Listener falls vorhanden
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            if (this._resizeRafId && typeof window.cancelAnimationFrame === 'function') {
                window.cancelAnimationFrame(this._resizeRafId);
                this._resizeRafId = null;
            }
        }
        this._resizeHandler = handleResize;
        window.addEventListener('resize', handleResize);

        this.attachAvatarMenuListeners();
    },

    /**
     * Aktualisiert die Uhrzeit in der Statusbar
     */
    updateTime() {
        const timeEl = document.getElementById('current-time');
        if (timeEl) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}`;
        }
    },

    /**
     * Fügt Event-Listener für Avatar-Menü hinzu
     */
    attachAvatarMenuListeners() {
        const avatar = document.getElementById('avatar');
        const avatarMenu = document.getElementById('avatar-menu');
        const languageSelect = document.getElementById('language-select');
        const themeSelect = document.getElementById('theme-select');

        if (!avatar || !avatarMenu || !languageSelect || !themeSelect) {
            return;
        }

        // Aktuellen Wert setzen
        languageSelect.value = I18n.getLanguage();
        themeSelect.value = ThemeManager.getTheme();

        // Avatar Click - Menü öffnen/schließen
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            avatarMenu.classList.toggle('show');
        });

        if (this._avatarOutsideHandler) {
            document.removeEventListener('click', this._avatarOutsideHandler);
        }
        this._avatarOutsideHandler = (e) => {
            if (!avatarMenu.contains(e.target) && !avatar.contains(e.target)) {
                avatarMenu.classList.remove('show');
            }
        };

        // Klick außerhalb schließt Menü
        document.addEventListener('click', this._avatarOutsideHandler);

        // Sprache wechseln
        languageSelect.addEventListener('change', async (e) => {
            await I18n.setLanguage(e.target.value);
            this.render();
        });

        // Theme wechseln
        themeSelect.addEventListener('change', (e) => {
            ThemeManager.setTheme(e.target.value);
            avatarMenu.classList.remove('show');
        });

        // Menü-Items
        const menuItems = avatarMenu.querySelectorAll('.avatar-menu-item[data-action]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');

                if (action === 'logout') {
                    AuthManager.logout();
                    this.navigate('login');
                } else if (action === 'imprint') {
                    ImprintManager.show();
                    avatarMenu.classList.remove('show');
                } else {
                    // Handle action: ${action}
                    avatarMenu.classList.remove('show');
                }
            });
        });
    }
};
