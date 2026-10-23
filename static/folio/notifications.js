(() => {
    if (window.folioNotificationsReady) return;
    window.folioNotificationsReady = true;

    const pending = [];
    const visible = new Map();
    const processed = new WeakSet();
    const persistentLevels = new Set(['error', 'warning']);
    const duration = 6000;

    function stack() {
        let region = document.querySelector('[data-folio-notifications]');
        if (region) return region;
        region = document.createElement('section');
        region.className = 'folio-notifications folio';
        region.dataset.folioNotifications = '';
        region.setAttribute('aria-label', 'Notifications');
        document.body.append(region);
        return region;
    }

    function pause(card) {
        const state = visible.get(card);
        if (!state?.timer) return;
        clearTimeout(state.timer);
        state.remaining = Math.max(0, state.remaining - (performance.now() - state.started));
        state.timer = null;
    }

    function resume(card) {
        const state = visible.get(card);
        if (!state || state.timer || state.persistent || document.hidden) return;
        const interacting = card.matches(':hover') || card.contains(document.activeElement);
        if (interacting) return;
        state.started = performance.now();
        state.timer = setTimeout(() => dismiss(card), state.remaining);
    }

    function dismiss(card) {
        pause(card);
        const hadFocus = card.contains(document.activeElement);
        visible.delete(card);
        card.remove();
        showPending();
        // Keep keyboard users in the notification stack after dismissing a card.
        if (hadFocus) stack().querySelector('[data-notification-dismiss]')?.focus();
    }

    function showPending() {
        const region = stack();
        while (visible.size < 3 && pending.length) {
            const card = pending.shift();
            visible.set(card, {remaining: duration, timer: null, persistent: persistentLevels.has(card.dataset.level)});
            card.hidden = false;
            region.append(card);
            resume(card);
        }
    }

    function enqueue(card) {
        if (processed.has(card)) return;
        processed.add(card);
        card.hidden = true;
        card.remove();
        card.addEventListener('mouseenter', () => pause(card));
        card.addEventListener('mouseleave', () => resume(card));
        card.addEventListener('focusin', () => pause(card));
        card.addEventListener('focusout', () => queueMicrotask(() => resume(card)));
        card.querySelector('[data-notification-dismiss]').addEventListener('click', () => dismiss(card));
        pending.push(card);
    }

    function initialize() {
        visible.forEach((state, card) => {
            if (card.isConnected) return;
            pause(card);
            visible.delete(card);
        });
        document.querySelectorAll('[data-folio-notification]').forEach(enqueue);
        showPending();
    }

    document.addEventListener('visibilitychange', () => {
        visible.forEach((state, card) => document.hidden ? pause(card) : resume(card));
    });
    document.addEventListener('htmx:after:swap', initialize);
    document.addEventListener('folio:notify', event => {
        const {message, level = 'info'} = event.detail || {};
        if (typeof message !== 'string' || !message.trim()) return;
        const card = document.createElement('article');
        card.className = 'folio-notification';
        card.dataset.level = level;
        card.setAttribute('role', level === 'error' ? 'alert' : 'status');
        card.setAttribute('aria-atomic', 'true');
        const text = document.createElement('div');
        text.className = 'folio-notification-message';
        text.textContent = message;
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'folio-notification-dismiss';
        close.dataset.notificationDismiss = '';
        close.setAttribute('aria-label', 'Dismiss notification');
        close.textContent = '×';
        card.append(text, close);
        enqueue(card);
        showPending();
    });
    initialize();
})();
