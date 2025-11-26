/**
 * Zentrale Icon-Bibliothek für semantische Icon-Namen.
 * Vereinheitlicht Auflösung, Rendering und Wechsel von Icons.
 */
const IconLibrary = (() => {
    const fallback = 'information';

    const definitions = {
        user: { className: 'icon_user', unicode: '\\e900' },
        user_earth: { className: 'icon_user_earth', unicode: '\\e901' },
        document_zip: { className: 'icon_document_zip', unicode: '\\e902' },
        drop_down_list: { className: 'icon_drop_down_list', unicode: '\\e903' },
        folder_zip: { className: 'icon_folder_zip', unicode: '\\e904' },
        navigate_cross: { className: 'icon_navigate_cross', unicode: '\\e905' },
        navigate_minus: { className: 'icon_navigate_minus', unicode: '\\e95e' },
        navigate_plus: { className: 'icon_navigate_plus', unicode: '\\e95f' },
        about: { className: 'icon_about', unicode: '\\e906' },
        bell: { className: 'icon_bell', unicode: '\\e907' },
        bookkeeper: { className: 'icon_bookkeeper', unicode: '\\e908' },
        bookmark: { className: 'icon_bookmark', unicode: '\\e909' },
        bottle_of_pills: { className: 'icon_bottle_of_pills', unicode: '\\e90a' },
        businesswoman: { className: 'icon_businesswoman', unicode: '\\e90b' },
        businesswomen: { className: 'icon_businesswomen', unicode: '\\e90c' },
        calendar: { className: 'icon_calendar', unicode: '\\e90d' },
        calendar_5: { className: 'icon_calendar_5', unicode: '\\e90e' },
        calendar_clock: { className: 'icon_calendar_clock', unicode: '\\e90f' },
        cash_register: { className: 'icon_cash_register', unicode: '\\e910' },
        cashier: { className: 'icon_cashier', unicode: '\\e911' },
        chart_area: { className: 'icon_chart_area', unicode: '\\e912' },
        chart_column: { className: 'icon_chart_column', unicode: '\\e913' },
        check: { className: 'icon_check', unicode: '\\e914' },
        checks: { className: 'icon_checks', unicode: '\\e915' },
        clipboard: { className: 'icon_clipboard', unicode: '\\e916' },
        clipboard_checks: { className: 'icon_clipboard_checks', unicode: '\\e917' },
        clipboard_paste: { className: 'icon_clipboard_paste', unicode: '\\e918' },
        contract: { className: 'icon_contract', unicode: '\\e919' },
        copy: { className: 'icon_copy', unicode: '\\e91a' },
        credit_card: { className: 'icon_credit_card', unicode: '\\e91b' },
        cut: { className: 'icon_cut', unicode: '\\e91c' },
        doctor: { className: 'icon_doctor', unicode: '\\e91d' },
        document_attachment: { className: 'icon_document_attachment', unicode: '\\e91e' },
        document_notebook: { className: 'icon_document_notebook', unicode: '\\e91f' },
        document_pulse: { className: 'icon_document_pulse', unicode: '\\e920' },
        door_exit: { className: 'icon_door_exit', unicode: '\\e921' },
        edit: { className: 'icon_edit', unicode: '\\e922' },
        eye: { className: 'icon_eye', unicode: '\\e923' },
        eye_blind: { className: 'icon_eye_blind', unicode: '\\e924' },
        fingerprint_scan: { className: 'icon_fingerprint_scan', unicode: '\\e925' },
        folder: { className: 'icon_folder', unicode: '\\e926' },
        folder_into: { className: 'icon_folder_into', unicode: '\\e927' },
        folder_open: { className: 'icon_folder_open', unicode: '\\e928' },
        folder_out: { className: 'icon_folder_out', unicode: '\\e929' },
        folders2: { className: 'icon_folders2', unicode: '\\e92a' },
        funnel: { className: 'icon_funnel', unicode: '\\e92b' },
        garbage: { className: 'icon_garbage', unicode: '\\e92c' },
        gearwheel: { className: 'icon_gearwheel', unicode: '\\e92d' },
        gearwheels: { className: 'icon_gearwheels', unicode: '\\e92e' },
        history: { className: 'icon_history', unicode: '\\e92f' },
        history2: { className: 'icon_history2', unicode: '\\e930' },
        home: { className: 'icon_home', unicode: '\\e931' },
        id_card: { className: 'icon_id_card', unicode: '\\e932' },
        index2: { className: 'icon_index2', unicode: '\\e933' },
        information: { className: 'icon_information', unicode: '\\e934' },
        key2: { className: 'icon_key2', unicode: '\\e935' },
        laptop: { className: 'icon_laptop', unicode: '\\e936' },
        lightbulb_off: { className: 'icon_lightbulb_off', unicode: '\\e937' },
        lock: { className: 'icon_lock', unicode: '\\e938' },
        lock_open: { className: 'icon_lock_open', unicode: '\\e939' },
        magic_wand: { className: 'icon_magic_wand', unicode: '\\e93a' },
        magnifying_glass: { className: 'icon_magnifying_glass', unicode: '\\e93b' },
        mail: { className: 'icon_mail', unicode: '\\e93c' },
        mail_open: { className: 'icon_mail_open', unicode: '\\e93d' },
        mail_open2: { className: 'icon_mail_open2', unicode: '\\e93e' },
        message: { className: 'icon_message', unicode: '\\e93f' },
        money_coins: { className: 'icon_money_coins', unicode: '\\e940' },
        money_coins2: { className: 'icon_money_coins2', unicode: '\\e941' },
        navigate_close: { className: 'icon_navigate_close', unicode: '\\e942' },
        navigate_down: { className: 'icon_navigate_down', unicode: '\\e943' },
        navigate_left: { className: 'icon_navigate_left', unicode: '\\e944' },
        navigate_open: { className: 'icon_navigate_open', unicode: '\\e945' },
        navigate_right: { className: 'icon_navigate_right', unicode: '\\e946' },
        navigate_up: { className: 'icon_navigate_up', unicode: '\\e947' },
        newspaper: { className: 'icon_newspaper', unicode: '\\e948' },
        note_text: { className: 'icon_note_text', unicode: '\\e949' },
        notebook: { className: 'icon_notebook', unicode: '\\e94a' },
        notebook3: { className: 'icon_notebook3', unicode: '\\e94b' },
        paperclip: { className: 'icon_paperclip', unicode: '\\e94c' },
        pill: { className: 'icon_pill', unicode: '\\e94d' },
        plus: { className: 'icon_plus', unicode: '\\e94e' },
        print_calculator: { className: 'icon_print_calculator', unicode: '\\e94f' },
        printer: { className: 'icon_printer', unicode: '\\e950' },
        question: { className: 'icon_question', unicode: '\\e951' },
        server_earth: { className: 'icon_server_earth', unicode: '\\e952' },
        shopping_bag_full: { className: 'icon_shopping_bag_full', unicode: '\\e953' },
        shopping_cart_full: { className: 'icon_shopping_cart_full', unicode: '\\e954' },
        sort_ascending: { className: 'icon_sort_ascending', unicode: '\\e955' },
        sort_descending: { className: 'icon_sort_descending', unicode: '\\e956' },
        stethoscope: { className: 'icon_stethoscope', unicode: '\\e957' },
        tag: { className: 'icon_tag', unicode: '\\e958' },
        view_1_1: { className: 'icon_view_1_1', unicode: '\\e959' },
        wallet: { className: 'icon_wallet', unicode: '\\e95a' },
        wax_seal: { className: 'icon_wax_seal', unicode: '\\e95b' },
        zoom_out: { className: 'icon_zoom_out', unicode: '\\e95c' },
        zoom_in: { className: 'icon_zoom_in', unicode: '\\e95d' }
    };

    const aliases = {
        avatar: 'user_earth',
        user: 'user',
        users: 'businesswomen',
        hilfe: 'question',
        kontakt: 'mail',
        impressum: 'information',
        übersicht: 'home',
        uebersicht: 'home',
        kalender: 'calendar',
        termine: 'calendar_clock',
        kontakte: 'businesswomen',
        dokumentation: 'history2',
        rechnungen: 'print_calculator',
        healthtalk: 'message',
        healthshop: 'shopping_bag_full',
        abmelden: 'door_exit',
        zahlungen: 'credit_card',
        einstellungen: 'gearwheel',
        'suchfeld in übersicht': 'magic_wand',
        'suchfeld allgemein': 'magnifying_glass',
        search_overview: 'magic_wand',
        search: 'magnifying_glass',
        dropdown: 'navigate_down',
        collapse: 'navigate_left',
        close: 'navigate_cross',
        add: 'plus',
        'password-visible': 'eye',
        'password-hidden': 'eye_blind',
        'door-enter': 'door_exit',
        'id-card': 'id_card',
        'lightbulb': 'lightbulb_off',
        'magic-wand': 'magic_wand',
        'mail-open': 'mail_open',
        'mail-out': 'mail_open2',
        'calendar-5': 'calendar_5',
        'calendar-clock': 'calendar_clock',
        'calendar-12': 'calendar',
        'pos-terminal': 'cash_register',
        'credit-card': 'credit_card',
        'chart-area': 'chart_area',
        'chart-bar': 'chart_column',
        'chart-ecg': 'document_pulse',
        'alert-circle': 'information',
        'user-tie': 'id_card',
        'checklist-time': 'clipboard_checks',
        clipboard_check_edit: 'clipboard_checks',
        minus: 'navigate_minus',
        'time-report': 'history',
        'bag': 'shopping_bag_full',
        'cart': 'shopping_cart_full',
        'gear': 'gearwheel',
        'gears': 'gearwheels',
        'notepad': 'note_text',
        'document': 'document_attachment',
        'calculator': 'print_calculator',
        'logo-mark': 'information',
        'receipt': 'contract',
        'checklist': 'clipboard_checks',
        'chat': 'message'
    };

    const normalizeKey = (iconKey) => {
        if (!iconKey) return '';
        return iconKey.toString().trim().toLowerCase();
    };

    const resolveKey = (iconKey) => {
        const normalized = normalizeKey(iconKey);
        if (!normalized) return fallback;

        const cleaned = normalized.replace(/\s+/g, '_');
        const hyphenNormalized = cleaned.replace(/-/g, '_');
        const withoutPrefix = hyphenNormalized.replace(/^icon[_-]?/, '');

        if (aliases[normalized]) return aliases[normalized];
        if (aliases[cleaned]) return aliases[cleaned];
        if (aliases[hyphenNormalized]) return aliases[hyphenNormalized];
        if (aliases[withoutPrefix]) return aliases[withoutPrefix];

        if (definitions[normalized]) return normalized;
        if (definitions[cleaned]) return cleaned;
        if (definitions[hyphenNormalized]) return hyphenNormalized;
        if (definitions[withoutPrefix]) return withoutPrefix;

        return fallback;
    };

    const resolveClass = (iconKey) => {
        const resolvedKey = resolveKey(iconKey);
        const definition = definitions[resolvedKey] || definitions[fallback];
        return { className: definition.className, resolvedKey };
    };

    const apply = (element, iconKey) => {
        if (!element) return;

        const { className, resolvedKey } = resolveClass(iconKey);
        const previousClass = element.dataset.iconClass || element.dataset.iconResolved;

        if (previousClass && previousClass !== className) {
            element.classList.remove(previousClass);
        }

        element.classList.add('icon', className);
        element.dataset.icon = iconKey || '';
        element.dataset.iconResolved = resolvedKey;
        element.dataset.iconClass = className;
    };

    const render = (iconKey, extraClasses = '', attributes = {}) => {
        const { className, resolvedKey } = resolveClass(iconKey);
        const classes = ['icon', className];

        if (extraClasses) {
            classes.push(extraClasses);
        }

        const attrString = Object.entries(attributes)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');

        return `<span class="${classes.join(' ')}" data-icon="${iconKey || ''}" data-icon-resolved="${resolvedKey}" data-icon-class="${className}"${attrString}></span>`;
    };

    return {
        resolve: (iconKey) => resolveClass(iconKey).className,
        resolveKey,
        apply,
        render,
        definitions
    };
})();
