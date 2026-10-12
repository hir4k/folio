// Delegation keeps native dialogs usable when a host swaps component fragments.
(() => {
    const enhanceWordBanks = () => {
        document.querySelectorAll('[data-folio-word-bank]').forEach(bank => {
            bank.querySelectorAll('select').forEach(select => {
                select.hidden = true;
                select.required = false;
                select.nextElementSibling.hidden = false;
            });
            bank.querySelector('.folio-word-choices').hidden = false;
        });
    };
    document.addEventListener('DOMContentLoaded', enhanceWordBanks);
    const enhancedSearchForms = new WeakSet();
    const enhanceSearch = () => document.querySelectorAll('[data-folio-search]').forEach(form => {
        if (enhancedSearchForms.has(form)) return;
        enhancedSearchForms.add(form);
        const input = form.querySelector('input[type=search]');
        const results = form.querySelector('[data-folio-search-results]');
        let timer;
        let pendingRequest;
        const search = async () => {
            pendingRequest?.abort();
            pendingRequest = new AbortController();
            if (!input.value.trim()) { results.replaceChildren(); return; }
            const url = new URL(form.action, window.location.href);
            new FormData(form).forEach((value, name) => url.searchParams.set(name, value));
            url.searchParams.set('search_dialog', '1');
            results.setAttribute('aria-busy', 'true');
            try {
                const response = await fetch(url, { signal: pendingRequest.signal });
                if (!response.ok) throw new Error('Search failed');
                results.innerHTML = await response.text();
            } catch (error) {
                if (error.name !== 'AbortError') results.textContent = 'Search could not load. Try again.';
            } finally { results.removeAttribute('aria-busy'); }
        };
        input.addEventListener('input', () => { pendingRequest?.abort(); clearTimeout(timer); timer = setTimeout(search, 200); });
        form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
        if (input.value) form.closest('dialog').showModal();
    });
    document.addEventListener('DOMContentLoaded', enhanceSearch);
    document.addEventListener('folio:refresh', enhanceSearch);
    document.addEventListener('htmx:after:swap', enhanceSearch);
    document.addEventListener('htmx:afterSwap', enhanceWordBanks);
    document.addEventListener('htmx:after:swap', enhanceWordBanks);
    document.addEventListener('folio:refresh', enhanceWordBanks);
    const fullscreenButtons = () => document.querySelectorAll('[data-fullscreen]');
    const refreshFullscreen = () => fullscreenButtons().forEach(button => {
        button.hidden = !document.fullscreenEnabled;
        button.setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
    });
    document.addEventListener('DOMContentLoaded', refreshFullscreen);
    document.addEventListener('folio:refresh', refreshFullscreen);
    document.addEventListener('fullscreenchange', refreshFullscreen);
    document.addEventListener('click', async event => {
        if (event.target.closest('[data-fullscreen]')) {
            try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await document.documentElement.requestFullscreen();
            } catch { /* Fullscreen may be denied by the browser. */ }
            return;
        }
        const slot = event.target.closest('[data-folio-word-slot]');
        if (slot) {
            const select = slot.previousElementSibling;
            select.value = '';
            slot.textContent = '___';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const word = event.target.closest('[data-folio-word-value]');
        if (word) {
            const bank = word.closest('[data-folio-word-bank]');
            const blank = Array.from(bank.querySelectorAll('select')).find(select => !select.value);
            if (blank) {
                blank.value = word.dataset.folioWordValue;
                blank.nextElementSibling.textContent = word.textContent;
                blank.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        const opener = event.target.closest('[data-folio-open]');
        if (opener) {
            const dialog = document.getElementById(opener.dataset.folioOpen);
            dialog?.showModal();
            dialog?.querySelector('[data-folio-search] input')?.focus();
        }
        const closer = event.target.closest('[data-folio-close]');
        if (closer) closer.closest('dialog')?.close();
        if (event.target.matches('dialog.folio-dialog')) {
            const bounds = event.target.getBoundingClientRect();
            const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
            if (outside) event.target.close();
        }
    });
})();

(() => {
    const resetButton = button => {
        delete button.dataset.pairPending;
        delete button.dataset.pairState;
        button.setAttribute('aria-pressed', 'false');
        button.removeAttribute('aria-label');
        button.querySelector('[data-pair-error]').hidden = true;
    };
    const updateCompletion = matching => {
        const left = Array.from(matching.querySelectorAll('[data-pair-side=left]'));
        const complete = left.every(button => button.dataset.pairState === 'correct');
        const submit = matching.closest('.folio-practice')?.querySelector('[data-pairs-submit]');
        if (submit) submit.disabled = !complete;
    };
    document.addEventListener('click', event => {
        const button = event.target.closest('[data-pair-side]');
        if (!button || button.disabled) return;
        const matching = button.closest('[data-folio-pairs]');
        if (!matching || matching.dataset.pairBusy) return;
        if (button.dataset.pairPending) {
            resetButton(button);
            return;
        }
        const choices = Array.from(matching.querySelectorAll('[data-pair-side]'));
        const pending = choices.find(choice => choice.dataset.pairPending && choice.dataset.pairSide === button.dataset.pairSide);
        if (pending) resetButton(pending);
        button.dataset.pairPending = 'true';
        button.setAttribute('aria-pressed', 'true');
        const left = choices.find(choice => choice.dataset.pairPending && choice.dataset.pairSide === 'left');
        const right = choices.find(choice => choice.dataset.pairPending && choice.dataset.pairSide === 'right');
        if (!left || !right) return;
        const correct = left.dataset.pairMatch === right.dataset.pairId;
        [left, right].forEach(choice => {
            delete choice.dataset.pairPending;
            choice.setAttribute('aria-pressed', 'false');
            choice.dataset.pairState = correct ? 'correct' : 'wrong';
            choice.setAttribute('aria-label', `${choice.dataset.pairLabel}: ${correct ? 'correct' : 'incorrect'} match`);
            choice.querySelector(correct ? '[data-pair-mark]' : '[data-pair-error]').hidden = false;
            choice.disabled = correct;
        });
        if (correct) {
            left.closest('[data-pair-row]').querySelector('[data-pair-answer]').value = right.dataset.pairId;
            updateCompletion(matching);
            return;
        }
        // Keep rapid clicks from overlapping the brief error state.
        matching.dataset.pairBusy = 'true';
        matching.setAttribute('aria-busy', 'true');
        setTimeout(() => {
            resetButton(left);
            resetButton(right);
            delete matching.dataset.pairBusy;
            matching.removeAttribute('aria-busy');
        }, 600);
    });
})();
