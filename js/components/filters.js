/**
 * Filters Component for EU5 Inspector
 * Provides sub-filtering with include/exclude states and match mode
 */

class Filters {
    constructor(container, onFilterChange) {
        this.container = container;
        this.onFilterChange = onFilterChange;

        // Filter state: 'neutral' | 'include' | 'exclude'
        this.filterStates = new Map();
        this.filterGroups = [];

        // Match mode: 'any' | 'all'
        this.matchMode = 'any';
    }

    /**
     * Set filter groups for the current category
     * @param {Array} groups - Filter group definitions
     */
    setFilterGroups(groups) {
        this.filterGroups = groups;
        this.filterStates.clear();

        for (const group of groups) {
            for (const item of group.values) {
                const key = `${group.key}:${item.value}`;
                this.filterStates.set(key, 'neutral');
            }
        }

        this.render();
    }

    /**
     * Clear all filters
     */
    clear() {
        this.filterGroups = [];
        this.filterStates.clear();
        this.render();
    }

    /**
     * Get current filter criteria
     * @returns {Object} Filter criteria with includes and excludes per key
     */
    getFilterCriteria() {
        const criteria = {};

        for (const group of this.filterGroups) {
            criteria[group.key] = {
                includes: [],
                excludes: []
            };

            for (const item of group.values) {
                const stateKey = `${group.key}:${item.value}`;
                const state = this.filterStates.get(stateKey);

                if (state === 'include') {
                    criteria[group.key].includes.push(item.value);
                } else if (state === 'exclude') {
                    criteria[group.key].excludes.push(item.value);
                }
            }
        }

        return criteria;
    }

    /**
     * Check if an item passes the current filters
     * @param {Object} item - Item to check
     * @returns {boolean} Whether item passes filters
     */
    itemPassesFilters(item) {
        const criteria = this.getFilterCriteria();

        if (this.matchMode === 'all') {
            return this.checkAllMatch(item, criteria);
        } else {
            return this.checkAnyMatch(item, criteria);
        }
    }

    /**
     * Check if item matches ALL filter groups (AND logic)
     */
    checkAllMatch(item, criteria) {
        for (const [key, { includes, excludes }] of Object.entries(criteria)) {
            const itemValue = this.getItemFilterValue(item, key);
            const itemValues = Array.isArray(itemValue) ? itemValue : [itemValue];

            // Must match ALL includes (if any)
            if (includes.length > 0) {
                const matchesInclude = itemValues.some(v => includes.includes(v));
                if (!matchesInclude) return false;
            }

            // Must not match ANY excludes
            if (excludes.length > 0) {
                const matchesExclude = itemValues.some(v => excludes.includes(v));
                if (matchesExclude) return false;
            }
        }
        return true;
    }

    /**
     * Check if item matches ANY filter group (OR logic for includes across groups)
     */
    checkAnyMatch(item, criteria) {
        let hasAnyIncludes = false;
        let matchesAnyInclude = false;

        for (const [key, { includes, excludes }] of Object.entries(criteria)) {
            const itemValue = this.getItemFilterValue(item, key);
            const itemValues = Array.isArray(itemValue) ? itemValue : [itemValue];

            // Check excludes first - these always apply
            if (excludes.length > 0) {
                const matchesExclude = itemValues.some(v => excludes.includes(v));
                if (matchesExclude) return false;
            }

            // Track includes
            if (includes.length > 0) {
                hasAnyIncludes = true;
                const matchesInclude = itemValues.some(v => includes.includes(v));
                if (matchesInclude) matchesAnyInclude = true;
            }
        }

        // If there are includes, must match at least one
        if (hasAnyIncludes && !matchesAnyInclude) return false;

        return true;
    }

    /**
     * Get the filter value from an item
     * @param {Object} item - Item to extract value from
     * @param {string} key - Filter key
     * @returns {*} Filter value(s)
     */
    getItemFilterValue(item, key) {
        if (!item || typeof item !== 'object') return null;

        if (key in item) {
            const value = item[key];
            // Handle object with keys (like culture_groups, tags)
            if (value && typeof value === 'object' && !Array.isArray(value) && !value._type) {
                return Object.keys(value).filter(k => !k.startsWith('_'));
            }
            // Handle arrays
            if (Array.isArray(value)) {
                return value.filter(v => typeof v === 'string');
            }
            return value;
        }

        return null;
    }

    /**
     * Cycle filter state: neutral -> include -> exclude -> neutral
     * @param {string} key - Filter key
     */
    cycleState(key) {
        const current = this.filterStates.get(key) || 'neutral';
        let next;

        switch (current) {
            case 'neutral': next = 'include'; break;
            case 'include': next = 'exclude'; break;
            case 'exclude': next = 'neutral'; break;
            default: next = 'neutral';
        }

        this.filterStates.set(key, next);
        this.render();
        this.onFilterChange();
    }

    /**
     * Set match mode
     * @param {string} mode - 'any' or 'all'
     */
    setMatchMode(mode) {
        this.matchMode = mode;
        this.render();
        this.onFilterChange();
    }

    /**
     * Reset all filters to neutral
     */
    resetAll() {
        for (const key of this.filterStates.keys()) {
            this.filterStates.set(key, 'neutral');
        }
        this.render();
        this.onFilterChange();
    }

    /**
     * Check if any filters are active
     * @returns {boolean}
     */
    hasActiveFilters() {
        for (const state of this.filterStates.values()) {
            if (state !== 'neutral') return true;
        }
        return false;
    }

    /**
     * Render the filters UI
     */
    render() {
        if (this.filterGroups.length === 0) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = `
            <div class="filters-wrapper">
                <div class="match-mode-toggle">
                    <span class="match-mode-label">Match:</span>
                    <button class="match-mode-btn ${this.matchMode === 'any' ? 'active' : ''}" data-mode="any">Any</button>
                    <button class="match-mode-btn ${this.matchMode === 'all' ? 'active' : ''}" data-mode="all">All</button>
                </div>
                ${this.filterGroups.map(group => `
                    <div class="filter-group">
                        <div class="filter-group-name">${group.name}</div>
                        <div class="filter-chips">
                            ${group.values.map(item => {
                                const key = `${group.key}:${item.value}`;
                                const state = this.filterStates.get(key) || 'neutral';
                                return `
                                    <button class="filter-chip filter-${state}"
                                            data-key="${key}"
                                            title="${item.value} (${item.count} items)">
                                        <span class="chip-label">${this.formatValue(item.value)}</span>
                                        <span class="chip-count">${item.count}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add chip click handlers
        this.container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.cycleState(chip.dataset.key);
            });
        });

        // Add match mode handlers
        this.container.querySelectorAll('.match-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMatchMode(btn.dataset.mode);
            });
        });
    }

    /**
     * Format a filter value for display
     * @param {string} value - Raw value
     * @returns {string} Formatted value
     */
    formatValue(value) {
        if (!value) return 'None';
        return String(value)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
}

window.Filters = Filters;
