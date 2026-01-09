/**
 * Sidebar Component for EU5 Inspector
 * Handles category navigation and object listing
 */

class Sidebar {
    constructor(container, onSelect) {
        this.container = container;
        this.onSelect = onSelect;
        this.categories = [];
        this.currentCategory = null;
        this.items = {};
        this.filteredItems = {};
        this.searchQuery = '';
        this.activeFilters = null;
        this.filtersOpen = false;
    }

    /**
     * Set up the sidebar with categories
     * @param {Array} categories - List of category definitions
     */
    setCategories(categories) {
        this.categories = categories;
        this.render();
    }

    /**
     * Set items for a category
     * @param {string} categoryId - Category identifier
     * @param {Object} items - Items in the category
     */
    setItems(categoryId, items) {
        this.items[categoryId] = items;
        this.filteredItems[categoryId] = items;

        if (this.currentCategory === categoryId) {
            this.applyAllFilters();
            this.renderItems();
        }
    }

    /**
     * Filter items based on search query
     * @param {string} query - Search query
     */
    filter(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applyAllFilters();
        this.renderItems();
    }

    /**
     * Apply property filters from the Filters component
     * @param {Filters} filters - Filters instance
     */
    applyFilters(filters) {
        this.activeFilters = filters;
        this.applyAllFilters();
        this.renderItems();
        this.updateFilterButton();
    }

    /**
     * Apply both search query and property filters
     */
    applyAllFilters() {
        const categoryId = this.currentCategory;
        if (!categoryId || !this.items[categoryId]) return;

        const items = this.items[categoryId];
        const filtered = {};

        for (const [key, value] of Object.entries(items)) {
            if (key.startsWith('_')) continue;

            // Apply search filter
            if (this.searchQuery && !key.toLowerCase().includes(this.searchQuery)) {
                continue;
            }

            // Apply property filters
            if (this.activeFilters && !this.activeFilters.itemPassesFilters(value)) {
                continue;
            }

            filtered[key] = value;
        }

        this.filteredItems[categoryId] = filtered;
    }

    /**
     * Toggle filters dropdown
     */
    toggleFilters() {
        this.filtersOpen = !this.filtersOpen;
        this.updateFilterButton();
        this.updateFiltersDropdown();
    }

    /**
     * Update filter button state
     */
    updateFilterButton() {
        const btn = this.container.querySelector('.filter-toggle-btn');
        if (!btn) return;

        const hasActiveFilters = this.activeFilters && this.activeFilters.hasActiveFilters();
        btn.classList.toggle('open', this.filtersOpen);
        btn.classList.toggle('has-filters', hasActiveFilters);
    }

    /**
     * Update filters dropdown visibility
     */
    updateFiltersDropdown() {
        const dropdown = document.getElementById('filters');
        if (dropdown) {
            dropdown.classList.toggle('open', this.filtersOpen);
        }
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        if (this.activeFilters) {
            this.activeFilters.resetAll();
        }
    }

    /**
     * Render the sidebar
     */
    render() {
        this.container.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-categories">
                    ${this.categories.map(cat => `
                        <button class="category-btn ${cat.id === this.currentCategory ? 'active' : ''}"
                                data-category="${cat.id}">
                            <span class="category-icon">${cat.icon}</span>
                            <span class="category-name">${cat.name}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="filter-controls">
                    <button class="filter-toggle-btn" title="Toggle Filters">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M3 4h18v2H3V4zm3 7h12v2H6v-2zm3 7h6v2H9v-2z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="filter-clear-btn" title="Clear All Filters">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="sidebar-items" id="sidebar-items"></div>
        `;

        // Add category click handlers
        this.container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const categoryId = btn.dataset.category;
                this.selectCategory(categoryId);
            });
        });

        // Filter toggle handler
        const filterToggle = this.container.querySelector('.filter-toggle-btn');
        if (filterToggle) {
            filterToggle.addEventListener('click', () => this.toggleFilters());
        }

        // Filter clear handler
        const filterClear = this.container.querySelector('.filter-clear-btn');
        if (filterClear) {
            filterClear.addEventListener('click', () => this.clearAllFilters());
        }
    }

    /**
     * Select a category
     * @param {string} categoryId - Category to select
     */
    selectCategory(categoryId) {
        this.currentCategory = categoryId;

        // Update active state
        this.container.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryId);
        });

        // Trigger loading if not loaded
        const category = this.categories.find(c => c.id === categoryId);
        if (category && category.onLoad && !this.items[categoryId]) {
            category.onLoad(categoryId);
        } else {
            this.applyAllFilters();
        }

        this.renderItems();
    }

    /**
     * Render items list for current category
     */
    renderItems() {
        const itemsContainer = this.container.querySelector('#sidebar-items');
        if (!itemsContainer) return;

        const allItems = this.items[this.currentCategory] || {};
        const items = this.filteredItems[this.currentCategory] || {};
        const keys = Object.keys(items).filter(k => !k.startsWith('_'));
        const totalKeys = Object.keys(allItems).filter(k => !k.startsWith('_')).length;

        if (keys.length === 0) {
            if (this.items[this.currentCategory]) {
                itemsContainer.innerHTML = '<div class="no-items">No matching items</div>';
            } else {
                itemsContainer.innerHTML = '<div class="loading">Loading...</div>';
            }
            return;
        }

        const countText = keys.length === totalKeys
            ? `${keys.length} items`
            : `${keys.length} of ${totalKeys} items`;

        itemsContainer.innerHTML = `
            <div class="items-count">${countText}</div>
            <div class="items-list">
                ${keys.map(key => `
                    <button class="item-btn" data-key="${key}">
                        ${this.formatItemName(key)}
                    </button>
                `).join('')}
            </div>
        `;

        // Add item click handlers
        itemsContainer.querySelectorAll('.item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                const item = items[key];

                // Update active state
                itemsContainer.querySelectorAll('.item-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });

                this.onSelect(this.currentCategory, key, item);
            });
        });
    }

    /**
     * Format item name for display
     * @param {string} name - Raw item name
     * @returns {string} Formatted name
     */
    formatItemName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
}

// Export for use in other modules
window.Sidebar = Sidebar;
