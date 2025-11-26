/**
 * Optimized Router für SimpliMed
 * - Split large functions
 * - Fixed memory leaks
 * - Better error handling
 */

const Router = {
    currentView: 'login',
    currentModule: 'dashboard',
    _initialized: false,
    _eventHandlers: new Map(),
    _resizeRafId: null,
    _resizeObserver: null,
    _pendingNavLayout: false,
    _pendingToggleLayout: false,
    _supportsFinePointer: window.matchMedia
        ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
        : false,
    _pointerMoveHandler: null,
    _pointerMoveRafId: null,

    // Constants
    ANIMATION_DURATION: 250,
    SIDENAV_WIDTH_EXPANDED: 230,
    SIDENAV_WIDTH_COLLAPSED: 64,
    BOTTOM_NAV_ITEM_WIDTH: 92,
    MIN_VISIBLE_BOTTOM_NAV_ITEMS: 2,

    /**
     * Initializes the router
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Initial render
        this.render();

        // Start time updates
        setInterval(() => this.updateTime(), 1000);
        this.updateTime();
    },

    /**
     * Navigates to a view
     * @param {string} viewName - Name of the view
     * @param {string} module - Optional module name
     */
    navigate(viewName, module = 'dashboard') {
        this.currentView = viewName;
        this.currentModule = module;
        this.render();
    },

    /**
     * Renders the current view
     */
    render() {
        const app = document.getElementById('app');
        if (!app) return;

        // Clean up previous event handlers
        this.cleanup();

        const isAuthenticated = AuthManager.ensureSession();

        if (isAuthenticated) {
            const userType = AuthManager.getUserType();
            app.innerHTML = ViewTemplates.getDashboardView(userType);
            this.attachDashboardEventListeners(userType);
            this.currentView = 'dashboard';
            return;
        }

        app.innerHTML = ViewTemplates.getLoginView();
        this.attachLoginEventListeners();
        this.currentView = 'login';
    },

    /**
     * Cleanup event handlers to prevent memory leaks
     */
    cleanup() {
        // Remove resize handler
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        // Cancel any pending animation frames
        if (this._resizeRafId) {
            cancelAnimationFrame(this._resizeRafId);
            this._resizeRafId = null;
        }

        // Disconnect resize observer
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        // Remove throttled pointer guard
        if (this._pointerMoveHandler) {
            document.removeEventListener('pointermove', this._pointerMoveHandler);
            this._pointerMoveHandler = null;
        }

        if (this._pointerMoveRafId) {
            cancelAnimationFrame(this._pointerMoveRafId);
            this._pointerMoveRafId = null;
        }

        this._pendingNavLayout = false;
        this._pendingToggleLayout = false;

        // Remove document click handlers
        if (this._avatarOutsideHandler) {
            document.removeEventListener('click', this._avatarOutsideHandler);
            this._avatarOutsideHandler = null;
        }

        if (this._overflowOutsideHandler) {
            document.removeEventListener('click', this._overflowOutsideHandler);
            this._overflowOutsideHandler = null;
        }

        // Clear all stored event handlers
        this._eventHandlers.clear();
    },

    /**
     * Attaches event listeners for login view
     */
    attachLoginEventListeners() {
        const elements = this.getLoginElements();
        if (!elements) return;

        // Restore last used login type
        let selectedUserType = AuthManager.getLastLoginType();
        this.updateLoginTypeUI(selectedUserType, elements);

        // Restore remembered username if available
        const rememberedUsername = AuthManager.getRememberedUsername();
        if (rememberedUsername && elements.username) {
            elements.username.value = rememberedUsername;
        }

        // Setup remember me checkbox
        this.setupRememberMeCheckbox(elements);

        // Setup login type switcher
        this.setupLoginTypeSwitcher(elements, selectedUserType);

        // Setup login form
        this.setupLoginForm(elements);

        // Setup password toggle
        this.setupPasswordToggle();

        // Setup avatar menu (for theme switching on login page)
        this.attachAvatarMenuListeners();
    },

    /**
     * Get login page elements
     */
    getLoginElements() {
        return {
            title: document.getElementById('login-type-title'),
            titleText: document.getElementById('login-type-label'),
            link: document.getElementById('switch-login-type'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            rememberMe: document.getElementById('remember-me'),
            form: document.getElementById('login-form'),
            error: document.getElementById('error-message')
        };
    },

    /**
     * Updates login type UI
     */
    updateLoginTypeUI(userType, elements) {
        if (!elements.title || !elements.link) return;

        const titleTarget = elements.titleText || elements.title;

        if (userType === 'therapist') {
            titleTarget.textContent = I18n.t('login.therapistLogin');
            elements.link.textContent = I18n.t('login.switchToPatient');
        } else {
            titleTarget.textContent = I18n.t('login.patientLogin');
            elements.link.textContent = I18n.t('login.switchToTherapist');
        }
    },

    /**
     * Setup remember me checkbox
     */
    setupRememberMeCheckbox(elements) {
        if (!elements.rememberMe) return;

        const storedChoice = AuthManager.getRememberChoice();
        const hasRememberToken = AuthManager.hasRememberToken();

        if (storedChoice !== null) {
            elements.rememberMe.checked = storedChoice;
        } else if (hasRememberToken) {
            elements.rememberMe.checked = true;
        }

        elements.rememberMe.addEventListener('change', (e) => {
            AuthManager.setRememberChoice(e.target.checked);
        });
    },

    /**
     * Setup login type switcher
     */
    setupLoginTypeSwitcher(elements, selectedUserType) {
        if (!elements.link) return;

        const handler = (e) => {
            e.preventDefault();
            selectedUserType = selectedUserType === 'patient' ? 'therapist' : 'patient';
            this.updateLoginTypeUI(selectedUserType, elements);
            AuthManager.setLastLoginType(selectedUserType);
        };

        elements.link.addEventListener('click', handler);
        this._eventHandlers.set('loginTypeSwitch', handler);
    },

    /**
     * Setup login form submission
     */
    setupLoginForm(elements) {
        if (!elements.form) return;

        const handler = (e) => {
            e.preventDefault();

            const username = elements.username.value.trim();
            const password = elements.password.value.trim();
            const rememberMe = elements.rememberMe.checked;

            const userType = AuthManager.getLastLoginType();
            const success = AuthManager.login(username, password, userType, rememberMe);

            if (success) {
                requestAnimationFrame(() => this.navigate('dashboard'));
            } else {
                if (elements.error) {
                    elements.error.textContent = I18n.t('login.errorInvalidCredentials');
                    elements.error.style.display = 'block';
                }
            }
        };

        elements.form.addEventListener('submit', handler);
        this._eventHandlers.set('loginForm', handler);
    },

    /**
     * Setup password visibility toggle
     */
    setupPasswordToggle() {
        const passwordGroup = document.getElementById('password-group');
        if (!passwordGroup) return;

        const handler = (e) => {
            const toggleElement = e.target.closest('#toggle-password');
            if (!toggleElement && e.target.id !== 'toggle-password') return;

            const passwordInput = document.getElementById('password');
            const togglePassword = document.getElementById('toggle-password');

            if (passwordInput && togglePassword) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    IconResolver.apply(togglePassword, 'password-visible');
                } else {
                    passwordInput.type = 'password';
                    IconResolver.apply(togglePassword, 'password-hidden');
                }
            }
        };

        passwordGroup.addEventListener('click', handler);
        this._eventHandlers.set('passwordToggle', handler);
    },

    /**
     * Attaches event listeners for dashboard view
     */
    attachDashboardEventListeners(userType) {
        // Setup sidenav
        this.setupSidenav();

        // Setup navigation
        this.setupNavigation();

        // Setup bottom navigation
        this.setupBottomNavigation();

        // Setup search functionality
        this.setupSearch();

        // Setup avatar menu
        this.attachAvatarMenuListeners();

        // Setup pointer guard (nur bei Trackpad/Fine Pointer)
        this.setupPointerGuards();

        // Initial updates
        this.updateStatusBar('dashboard');
        this.updateSearchUI('dashboard');
        this.scheduleLayoutUpdate({ nav: true, toggle: true });

        // Setup resize tracking
        this.setupResizeHandler();
        this.setupResizeObserver();
    },

    /**
     * Setup sidenav functionality
     */
    setupSidenav() {
        const sidenav = document.getElementById('sidenav');
        const toggle = document.getElementById('sidenav-toggle');
        const titlebar = document.getElementById('titlebar');
        const appContent = document.getElementById('app-content');
        const toolbar = document.getElementById('toolbar');
        const logo = document.getElementById('sidenav-logo');

        if (!sidenav || !toggle) return;

        this.scheduleLayoutUpdate({ toggle: true });

        // Restore collapsed state
        const savedState = localStorage.getItem('simplimed_sidenav_collapsed');
        if (savedState === 'true') {
            sidenav.classList.add('collapsed');
            titlebar?.classList.add('sidenav-collapsed');
            toolbar?.classList.add('sidenav-collapsed');
            if (appContent) {
                appContent.style.marginLeft = `${this.SIDENAV_WIDTH_COLLAPSED}px`;
            }
        }

        // Toggle handler
        toggle.addEventListener('click', () => {
            sidenav.classList.add('animating');
            const isCollapsed = sidenav.classList.toggle('collapsed');

            titlebar?.classList.toggle('sidenav-collapsed', isCollapsed);
            toolbar?.classList.toggle('sidenav-collapsed', isCollapsed);

            if (appContent) {
                appContent.style.marginLeft = isCollapsed
                    ? `${this.SIDENAV_WIDTH_COLLAPSED}px`
                    : `${this.SIDENAV_WIDTH_EXPANDED}px`;
            }

            setTimeout(() => {
                sidenav.classList.remove('animating');
            }, this.ANIMATION_DURATION);

            localStorage.setItem('simplimed_sidenav_collapsed', isCollapsed.toString());

            this.scheduleLayoutUpdate({ nav: true, toggle: true });
        });

        // Logo click handler
        if (logo) {
            logo.addEventListener('click', () => {
                this.navigate('dashboard', 'dashboard');
            });
        }
    },

    /**
     * Positioniert den Sidenav-Toggle abhängig vom Benutzertyp
     */
    positionSidenavToggle() {
        const sidenav = document.getElementById('sidenav');
        const toggle = document.getElementById('sidenav-toggle');
        if (!sidenav || !toggle) return;

        const userType = AuthManager.getUserType() || AuthManager.getLastLoginType();
        const targetModule = userType === 'therapist' ? 'payments' : 'healthshop';
        const targetItem = document.querySelector(`.sidenav-item[data-module="${targetModule}"]`);
        if (!targetItem) return;

        const sidenavRect = sidenav.getBoundingClientRect();
        const targetRect = targetItem.getBoundingClientRect();
        const targetCenter = (targetRect.top - sidenavRect.top) + (targetRect.height / 2);

        toggle.style.top = `${targetCenter}px`;
    },

    /**
     * Setup main navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.sidenav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.getAttribute('data-module');

                if (moduleId === 'logout') {
                    AuthManager.logout();
                    this.navigate('login');
                } else {
                    // Update active states
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // Sync with bottom nav
                    this.syncBottomNavActive(moduleId);

                    // Handle navigation
                    const moduleName = item.querySelector('.sidenav-item-text')?.textContent || moduleId;
                    this.handleModuleNavigation(moduleId, moduleName);
                }
            });
        });
    },

    /**
     * Setup bottom navigation
     */
    setupBottomNavigation() {
        const bottomItems = document.querySelectorAll('.bottom-nav-item:not(.overflow-menu)');
        const overflowButton = document.getElementById('bottom-nav-overflow');
        const overflowPopup = document.getElementById('bottom-nav-overflow-popup');

        // Regular items
        bottomItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.getAttribute('data-module');

                // Update active states
                bottomItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Sync with sidenav
                this.syncSidenavActive(moduleId);

                // Handle navigation
                const moduleName = item.querySelector('.bottom-nav-item-text')?.textContent || moduleId;
                this.handleModuleNavigation(moduleId, moduleName);

                // Update overflow menu
                this.updateBottomNavigation();
            });
        });

        // Overflow menu
        if (overflowButton && overflowPopup) {
            // Toggle overflow menu
            overflowButton.addEventListener('click', (e) => {
                e.stopPropagation();
                overflowPopup.classList.toggle('show');
            });

            // Close on outside click
            this._overflowOutsideHandler = (e) => {
                if (!overflowPopup.contains(e.target) &&
                    !overflowButton.contains(e.target)) {
                    overflowPopup.classList.remove('show');
                }
            };
            document.addEventListener('click', this._overflowOutsideHandler);

            // Handle overflow item clicks
            overflowPopup.addEventListener('click', (e) => {
                const item = e.target.closest('.bottom-nav-overflow-item');
                if (!item) return;

                const moduleId = item.dataset.module;
                overflowPopup.classList.remove('show');

                // Update active states
                bottomItems.forEach(i => i.classList.remove('active'));
                const matchingItem = Array.from(bottomItems)
                    .find(i => i.dataset.module === moduleId);
                if (matchingItem) {
                    matchingItem.classList.add('active');
                }

                // Sync with sidenav
                this.syncSidenavActive(moduleId);

                // Handle navigation
                const moduleName = item.querySelector('.bottom-nav-overflow-item-text')?.textContent || moduleId;
                this.handleModuleNavigation(moduleId, moduleName);

                // Update overflow menu
                this.updateBottomNavigation();
            });
        }
    },

    /**
     * Syncs sidenav active state
     */
    syncSidenavActive(moduleId) {
        const navItems = document.querySelectorAll('.sidenav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-module') === moduleId);
        });
    },

    /**
     * Syncs bottom nav active state
     */
    syncBottomNavActive(moduleId) {
        const bottomItems = document.querySelectorAll('.bottom-nav-item:not(.overflow-menu)');
        bottomItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-module') === moduleId);
        });
    },

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const searchClear = document.getElementById('search-clear-button');
        const mobileClear = document.getElementById('mobile-search-clear');

        const updateClearButtons = () => {
            if (searchClear) {
                searchClear.classList.toggle('is-visible',
                    searchInput && searchInput.value.trim().length > 0);
            }
            if (mobileClear) {
                mobileClear.classList.toggle('is-visible',
                    mobileSearchInput && mobileSearchInput.value.trim().length > 0);
            }
        };

        const clearAll = () => {
            if (searchInput) searchInput.value = '';
            if (mobileSearchInput) mobileSearchInput.value = '';
            updateClearButtons();
        };

        // Sync search inputs
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (mobileSearchInput) mobileSearchInput.value = e.target.value;
                updateClearButtons();
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.currentModule === 'dashboard') {
                    e.preventDefault();
                    clearAll();
                }
            });
        }

        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                if (searchInput) searchInput.value = e.target.value;
                updateClearButtons();
            });

            mobileSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.currentModule === 'dashboard') {
                    e.preventDefault();
                    clearAll();
                }
            });
        }

        // Clear buttons
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                clearAll();
                searchInput?.focus();
            });
        }

        if (mobileClear) {
            mobileClear.addEventListener('click', () => {
                clearAll();
                mobileSearchInput?.focus();
            });
        }

        updateClearButtons();
    },

    /**
     * Schedules Layout-Updates über requestAnimationFrame, um Reflow-Schleifen zu vermeiden
     * @param {Object} options - Flags für die benötigten Updates
     * @param {boolean} options.nav - Bottom Navigation neu berechnen
     * @param {boolean} options.toggle - Position des Sidenav-Toggles aktualisieren
     */
    scheduleLayoutUpdate({ nav = false, toggle = false } = {}) {
        if (!nav && !toggle) return;

        this._pendingNavLayout = this._pendingNavLayout || nav;
        this._pendingToggleLayout = this._pendingToggleLayout || toggle;

        if (this._resizeRafId) return;

        this._resizeRafId = requestAnimationFrame(() => {
            this._resizeRafId = null;

            if (this._pendingNavLayout) {
                this._pendingNavLayout = false;
                this.applyBottomNavigationLayout();
            }

            if (this._pendingToggleLayout) {
                this._pendingToggleLayout = false;
                this.positionSidenavToggle();
            }
        });
    },

    /**
     * Setup pointer guards für Geräte mit feinem Pointer
     * Verhindert, dass pointermove-Handler bei 120 Hz laufen
     */
    setupPointerGuards() {
        if (!this._supportsFinePointer || this._pointerMoveHandler) return;

        const throttledPointerMove = () => {
            if (this._pointerMoveRafId) return;

            this._pointerMoveRafId = requestAnimationFrame(() => {
                this._pointerMoveRafId = null;
                if (this._pointerMoveHandler) {
                    document.removeEventListener('pointermove', this._pointerMoveHandler);
                    this._pointerMoveHandler = null;
                }
            });
        };

        this._pointerMoveHandler = throttledPointerMove;
        document.addEventListener('pointermove', throttledPointerMove, { passive: true });
    },

    /**
     * Setup resize handler with proper cleanup
     */
    setupResizeHandler() {
        const handleResize = () => {
            this.scheduleLayoutUpdate({ nav: true, toggle: true });
        };

        this._resizeHandler = handleResize;
        window.addEventListener('resize', handleResize);
    },

    /**
     * Beobachtet kritische Layout-Container per ResizeObserver (Callback via rAF)
     */
    setupResizeObserver() {
        if (typeof ResizeObserver === 'undefined') return;

        const targets = [];
        const bottomNav = document.getElementById('bottom-navigation');
        const appContent = document.getElementById('app-content');

        if (bottomNav) targets.push(bottomNav);
        if (appContent) targets.push(appContent);

        if (targets.length === 0) return;

        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        this._resizeObserver = new ResizeObserver(() => {
            this.scheduleLayoutUpdate({ nav: true, toggle: true });
        });

        targets.forEach(target => this._resizeObserver.observe(target));
    },

    /**
     * Updates status bar
     */
    updateStatusBar(moduleId) {
        const moduleEl = document.getElementById('statusbar-module');
        const moduleIconEl = document.getElementById('statusbar-module-icon');
        const userEl = document.getElementById('statusbar-user');

        if (moduleEl && moduleId) {
            moduleEl.textContent = I18n.t(`modules.${moduleId}`);
        }

        if (moduleIconEl && moduleId) {
            const navIcon = document.querySelector(`.sidenav-item[data-module="${moduleId}"] .sidenav-item-icon`) ||
                document.querySelector(`.bottom-nav-item[data-module="${moduleId}"] .bottom-nav-item-icon`);
            const iconKey = navIcon?.dataset.icon || moduleId;

            IconResolver.apply(moduleIconEl, iconKey);
        }

        if (userEl) {
            userEl.textContent = AuthManager.getUsername() || 'N/A';
        }
    },

    /**
     * Updates search UI based on current module
     */
    updateSearchUI(moduleId) {
        const searchIcon = document.querySelector('.search-icon');
        const searchInput = document.getElementById('search-input');
        const mobileIcon = document.getElementById('mobile-search-icon');
        const mobileInput = document.getElementById('mobile-search-input');

        const isDashboard = moduleId === 'dashboard';
        const icon = isDashboard ? 'search_overview' : 'search';
        const placeholder = isDashboard
            ? I18n.t('search.actionOrCommand')
            : I18n.t('search.search');
        const mobilePlaceholder = isDashboard
            ? I18n.t('search.action')
            : I18n.t('search.search');

        if (searchIcon) IconResolver.apply(searchIcon, icon);
        if (searchInput) searchInput.placeholder = placeholder;
        if (mobileIcon) IconResolver.apply(mobileIcon, icon);
        if (mobileInput) mobileInput.placeholder = mobilePlaceholder;
    },

    /**
     * Handles module navigation
     */
    handleModuleNavigation(moduleId, moduleName) {
        // Update current module
        this.currentModule = moduleId;

        // Update title
        const moduleTitle = document.getElementById('module-title');
        if (moduleTitle) {
            moduleTitle.textContent = moduleName;
        }

        // Update various UI elements
        this.updateStatusBar(moduleId);
        this.updateSearchUI(moduleId);

        // Update toolbar and FAB
        const ctaText = document.getElementById('cta-text');
        const fabIcon = document.querySelector('.fab-icon');

        if (ctaText) {
            ctaText.textContent = moduleId === 'dashboard'
                ? I18n.t('buttons.addWidget')
                : I18n.t('buttons.add');
        }

        if (fabIcon) {
            IconResolver.apply(fabIcon, 'navigate_plus');
        }
    },

    /**
     * Updates bottom navigation overflow menu
     */
    updateBottomNavigation() {
        this.scheduleLayoutUpdate({ nav: true });
    },

    /**
     * Berechnet und rendert die Bottom Navigation (ausgeführt innerhalb rAF)
     */
    applyBottomNavigationLayout() {
        const bottomNav = document.getElementById('bottom-navigation');
        if (!bottomNav) return;

        const allItems = Array.from(bottomNav.querySelectorAll('.bottom-nav-item:not(.overflow-menu)'));
        const overflowButton = document.getElementById('bottom-nav-overflow');
        const overflowPopup = document.getElementById('bottom-nav-overflow-popup');

        if (allItems.length === 0) return;

        // Calculate how many items can fit
        const containerWidth = bottomNav.offsetWidth;
        const maxVisibleItems = Math.floor(containerWidth / this.BOTTOM_NAV_ITEM_WIDTH);

        // Mark navigation as ready
        const markReady = () => {
            if (!bottomNav.classList.contains('is-ready')) {
                bottomNav.classList.add('is-ready');
            }
        };

        // All items fit
        if (allItems.length <= maxVisibleItems) {
            allItems.forEach(item => item.style.display = 'flex');
            if (overflowButton) {
                overflowButton.classList.remove('visible');
                overflowButton.style.display = 'none';
            }
            if (overflowPopup) {
                overflowPopup.innerHTML = '';
            }
            markReady();
            return;
        }

        // Need overflow menu
        const visibleCount = Math.max(this.MIN_VISIBLE_BOTTOM_NAV_ITEMS, maxVisibleItems - 1);
        const visibleItems = allItems.slice(0, visibleCount);
        const hiddenItems = allItems.slice(visibleCount);

        // Show/hide items
        visibleItems.forEach(item => item.style.display = 'flex');
        hiddenItems.forEach(item => item.style.display = 'none');

        // Setup overflow button
        if (overflowButton) {
            overflowButton.classList.add('visible');
            overflowButton.style.display = 'flex';
        }

        // Populate overflow popup
        if (overflowPopup && hiddenItems.length > 0) {
            const activeModule = this.currentModule;

            overflowPopup.innerHTML = hiddenItems.map(item => {
                const moduleId = item.dataset.module;
                const icon = item.querySelector('.bottom-nav-item-icon')?.dataset.icon || '';
                const text = item.querySelector('.bottom-nav-item-text')?.textContent || '';
                const isActive = moduleId === activeModule;

                return `
                    <div class="bottom-nav-overflow-item ${isActive ? 'active' : ''}" data-module="${moduleId}">
                        ${IconResolver.render(icon, 'bottom-nav-overflow-item-icon')}
                        <span class="bottom-nav-overflow-item-text">${text}</span>
                    </div>
                `;
            }).join('');
        }

        markReady();
    },

    /**
     * Updates time in status bar
     */
    updateTime() {
        const timeEl = document.getElementById('current-time');
        if (!timeEl) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    },

    /**
     * Attaches avatar menu event listeners
     */
    attachAvatarMenuListeners() {
        const avatar = document.getElementById('avatar');
        const menu = document.getElementById('avatar-menu');
        const languageSelect = document.getElementById('language-select');
        const themeSelect = document.getElementById('theme-select');

        if (!avatar || !menu) return;

        // Set current values
        if (languageSelect) languageSelect.value = I18n.getLanguage();
        if (themeSelect) themeSelect.value = ThemeManager.getTheme();

        // Toggle menu
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close on outside click
        this._avatarOutsideHandler = (e) => {
            if (!menu.contains(e.target) && !avatar.contains(e.target)) {
                menu.classList.remove('show');
            }
        };
        document.addEventListener('click', this._avatarOutsideHandler);

        // Language change
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                await I18n.setLanguage(e.target.value);
                this.render();
            });
        }

        // Theme change
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                ThemeManager.setTheme(e.target.value);
                menu.classList.remove('show');
            });
        }

        // Menu items
        const menuItems = menu.querySelectorAll('.avatar-menu-item[data-action]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');

                switch (action) {
                    case 'logout':
                        AuthManager.logout();
                        this.navigate('login');
                        break;
                    case 'imprint':
                        if (typeof ImprintManager !== 'undefined') {
                            ImprintManager.show();
                        }
                        menu.classList.remove('show');
                        break;
                    default:
                        menu.classList.remove('show');
                        break;
                }
            });
        });
    }
};
