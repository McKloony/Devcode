/**
 * SimpliMed Imprint Manager
 * Handles loading and displaying the imprint/legal notice
 * @version 1.1.4
 */
const ImprintManager = {
    imprintData: null,
    overlay: null,
    _escHandler: null,

    /**
     * Gets fallback imprint data
     * @returns {Object} Fallback imprint data
     * @private
     */
    _getFallbackData() {
        return {
            title: 'Impressum',
            subtitle: 'Anbieterkennzeichnung',
            company: {
                name: 'SimpliMed GmbH',
                address: {
                    street: 'Am Ehrenmal 19',
                    zipCode: '51588',
                    city: 'Nümbrecht',
                    country: 'Deutschland'
                },
                registration: {
                    court: 'Siegburg',
                    number: 'HRB 11878'
                },
                management: 'Marcus Schmitz',
                vatId: 'DE282076515',
                contact: {
                    phone: '+49 (2293) 8192710',
                    fax: '+49 (2293) 8192780',
                    email: 'info(@)simplimed.de'
                }
            },
            disclaimer: {
                title: 'Haftungshinweis',
                text: 'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für die Inhalte verlinkter Seiten sind ausschließlich deren Betreiber zuständig.'
            }
        };
    },

    /**
     * Validates imprint data structure
     * @param {Object} data - Data to validate
     * @returns {boolean} True if data is valid
     * @private
     */
    _validateImprintData(data) {
        if (!data || typeof data !== 'object') return false;

        const required = [
            'title',
            'subtitle',
            'company.name',
            'company.address.street',
            'company.contact.phone',
            'company.contact.email'
        ];

        for (const path of required) {
            const keys = path.split('.');
            let current = data;

            for (const key of keys) {
                if (!current || typeof current !== 'object' || !(key in current)) {
                    return false;
                }
                current = current[key];
            }

            if (!current) return false;
        }

        return true;
    },

    /**
     * Loads imprint data from JSON file
     * @returns {Promise<Object>} Imprint data
     */
    async loadImprintData() {
        // Return cached data if available
        if (this.imprintData) {
            return this.imprintData;
        }

        try {
            const versionParam = window.APP_VERSION
                ? `?v=${encodeURIComponent(window.APP_VERSION)}`
                : `?t=${Date.now()}`;

            const response = await fetch(`assets/data/imprint.json${versionParam}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Validate data structure
            if (!this._validateImprintData(data)) {
                throw new Error('Invalid imprint data structure');
            }

            this.imprintData = data;
            return this.imprintData;
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Failed to load imprint data:', error);
            } else {
                console.error('Failed to load imprint data:', error);
            }

            // Return fallback data
            this.imprintData = this._getFallbackData();
            return this.imprintData;
        }
    },

    /**
     * Shows the imprint popup
     */
    async show() {
        try {
            // Load imprint data if not already loaded
            const data = await this.loadImprintData();

            // Remove existing overlay if present
            this.cleanup();

            // Check if ViewTemplates is available
            if (typeof ViewTemplates === 'undefined' || !ViewTemplates.getImprintPopup) {
                throw new Error('ViewTemplates not available');
            }

            // Create new popup
            const popupHTML = ViewTemplates.getImprintPopup(data);
            document.body.insertAdjacentHTML('beforeend', popupHTML);

            // Get overlay reference
            this.overlay = document.getElementById('imprint-overlay');

            if (!this.overlay) {
                throw new Error('Failed to create imprint overlay');
            }

            // Attach event listeners
            this.attachEventListeners();

            // Show popup with animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this.overlay) {
                        this.overlay.classList.add('show');
                    }
                });
            });

            // Disable body scroll
            document.body.style.overflow = 'hidden';
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Failed to show imprint popup:', error);
            } else {
                console.error('Failed to show imprint popup:', error);
            }
        }
    },

    /**
     * Hides the imprint popup
     */
    hide() {
        if (!this.overlay) return;

        // Remove show class to trigger animation
        this.overlay.classList.remove('show');

        // Remove overlay after animation completes
        setTimeout(() => {
            this.cleanup();
        }, 200);
    },

    /**
     * Cleans up the overlay and restores page state
     * @private
     */
    cleanup() {
        // Remove existing overlay
        const existingOverlay = document.getElementById('imprint-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Clean up references
        this.overlay = null;

        // Remove ESC handler
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }

        // Re-enable body scroll
        document.body.style.overflow = '';
    },

    /**
     * Attaches event listeners to the popup
     * @private
     */
    attachEventListeners() {
        if (!this.overlay) return;

        // Close button
        const closeButton = this.overlay.querySelector('#imprint-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide(), { once: true });
        }

        // Overlay click (outside popup)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // ESC key handler
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    },

    /**
     * Clears cached data (useful for testing or forced reload)
     */
    clearCache() {
        this.imprintData = null;
    }
};
