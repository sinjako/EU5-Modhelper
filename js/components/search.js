/**
 * Search Component for EU5 Inspector
 * Provides real-time search across game objects
 */

class Search {
    constructor(container, onSearch) {
        this.container = container;
        this.onSearch = onSearch;
        this.debounceTimer = null;
        this.render();
    }

    /**
     * Render the search input
     */
    render() {
        this.container.innerHTML = `
            <div class="search-wrapper">
                <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
                    <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input type="text"
                       class="search-input"
                       placeholder="Search objects..."
                       autocomplete="off"
                       spellcheck="false">
                <button class="search-clear" title="Clear search">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;

        const input = this.container.querySelector('.search-input');
        const clearBtn = this.container.querySelector('.search-clear');

        // Input handler with debounce
        input.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.onSearch(input.value);
            }, 150);

            clearBtn.classList.toggle('visible', input.value.length > 0);
        });

        // Clear button handler
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.remove('visible');
            this.onSearch('');
            input.focus();
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });
    }

    /**
     * Clear the search input
     */
    clear() {
        const input = this.container.querySelector('.search-input');
        const clearBtn = this.container.querySelector('.search-clear');
        if (input) {
            input.value = '';
            clearBtn.classList.remove('visible');
        }
    }

    /**
     * Get current search value
     * @returns {string} Current search query
     */
    getValue() {
        const input = this.container.querySelector('.search-input');
        return input?.value || '';
    }
}

// Export for use in other modules
window.Search = Search;
