/**
 * Impressum Manager
 * Verwaltet das Laden und Anzeigen des Impressums
 */
const ImprintManager = {
    imprintData: null,
    overlay: null,

    /**
     * Lädt die Impressumsdaten aus der JSON-Datei
     * @returns {Promise<Object>}
     */
    async loadImprintData() {
        if (this.imprintData) {
            return this.imprintData;
        }

        try {
            const response = await fetch('assets/data/imprint.json');
            if (!response.ok) {
                throw new Error('Impressum-Daten konnten nicht geladen werden');
            }
            this.imprintData = await response.json();
            return this.imprintData;
        } catch (error) {
            console.error('Fehler beim Laden der Impressumsdaten:', error);
            // Fallback-Daten
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
        }
    },

    /**
     * Öffnet das Impressum-Popup
     */
    async show() {
        // Lade Impressumsdaten falls noch nicht geladen
        const data = await this.loadImprintData();

        // Entferne existierendes Overlay falls vorhanden
        const existingOverlay = document.getElementById('imprint-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Erstelle neues Popup
        const popupHTML = ViewTemplates.getImprintPopup(data);
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Referenz zum Overlay speichern
        this.overlay = document.getElementById('imprint-overlay');

        // Event-Listener hinzufügen
        this.attachEventListeners();

        // Popup anzeigen mit Animation
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);

        // Body-Scroll deaktivieren
        document.body.style.overflow = 'hidden';
    },

    /**
     * Schließt das Impressum-Popup
     */
    hide() {
        if (!this.overlay) return;

        this.overlay.classList.remove('show');

        // Entferne Overlay nach Animation
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            // Body-Scroll wieder aktivieren
            document.body.style.overflow = '';
        }, 200);
    },

    /**
     * Fügt Event-Listener für das Popup hinzu
     */
    attachEventListeners() {
        if (!this.overlay) return;

        // Close Button
        const closeButton = this.overlay.querySelector('#imprint-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }

        // Overlay Click (außerhalb des Popups)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // ESC-Taste
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
};
