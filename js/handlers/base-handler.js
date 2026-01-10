/**
 * Base Handler for EU5 Inspector categories
 * Provides common functionality for filtering and rendering
 */
class BaseHandler {
    constructor(app) {
        this.app = app;
    }

    /**
     * Get the category ID this handler manages
     * Override in subclasses
     */
    getCategoryId() {
        throw new Error('Subclass must implement getCategoryId()');
    }

    /**
     * Get filter configuration for this category
     * Override in subclasses to provide category-specific filters
     * @returns {Array} Filter config array
     */
    getFilterConfig() {
        return [];
    }

    /**
     * Extract filter values from an item
     * @param {object} item - The item to extract values from
     * @param {string} key - The field key to extract
     * @returns {Array} Array of values
     */
    extractFilterValues(item, key) {
        if (!(key in item)) return [];

        const value = item[key];

        // Handle tags array
        if (key === 'tags' && Array.isArray(value)) {
            return value.filter(v => typeof v === 'string');
        }

        // Handle objects with keys (like culture_groups)
        if (value && typeof value === 'object' && !Array.isArray(value) && !value._type) {
            return Object.keys(value).filter(k => !k.startsWith('_'));
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.filter(v => typeof v === 'string');
        }

        // Handle simple values
        if (typeof value === 'string' || typeof value === 'number') {
            return [value];
        }

        return [];
    }

    /**
     * Build filter groups for this category
     * @param {object} items - Items to analyze
     * @returns {Array} Filter groups
     */
    buildFilterGroups(items) {
        const filterConfig = this.getFilterConfig();
        const groups = [];

        for (const config of filterConfig) {
            const valueCounts = new Map();

            for (const [key, item] of Object.entries(items)) {
                if (key.startsWith('_')) continue;
                if (!item || typeof item !== 'object') continue;

                const values = this.extractFilterValues(item, config.key);

                for (const v of values) {
                    if (v !== null && v !== undefined && v !== '' && v !== '[object Object]') {
                        const strValue = String(v);
                        if (strValue && strValue !== 'undefined' && strValue !== 'null') {
                            valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
                        }
                    }
                }
            }

            if (valueCounts.size > 0) {
                const sortedValues = Array.from(valueCounts.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([value, count]) => ({ value, count }));

                groups.push({
                    key: config.key,
                    name: config.name,
                    values: sortedValues
                });
            }
        }

        return groups;
    }

    /**
     * Apply filters to items
     * @param {object} items - All items
     * @param {string} searchQuery - Search query string
     * @param {object} filters - Filter component instance
     * @returns {object} Filtered items
     */
    applyFilters(items, searchQuery, filters) {
        const filtered = {};
        const criteria = filters ? filters.getFilterCriteria() : {};
        const matchMode = filters ? filters.matchMode : 'any';

        for (const [key, item] of Object.entries(items)) {
            if (key.startsWith('_')) continue;

            // Search filter
            if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase())) {
                continue;
            }

            // Component filters - use handler's extractFilterValues for consistency
            if (filters && filters.hasActiveFilters()) {
                if (!this.itemPassesFilters(item, criteria, matchMode)) {
                    continue;
                }
            }

            filtered[key] = item;
        }

        return filtered;
    }

    /**
     * Check if an item passes the current filter criteria
     * Uses the handler's extractFilterValues for consistent value extraction
     * @param {object} item - Item to check
     * @param {object} criteria - Filter criteria from Filters component
     * @param {string} matchMode - 'any' or 'all'
     * @returns {boolean} Whether item passes filters
     */
    itemPassesFilters(item, criteria, matchMode) {
        if (matchMode === 'all') {
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
            const itemValues = this.extractFilterValues(item, key).map(String);

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
            const itemValues = this.extractFilterValues(item, key).map(String);

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
     * Render items to the container
     * Override in subclasses for custom rendering
     * @param {HTMLElement} container - Container element
     * @param {object} items - Items to render
     * @param {Array} keys - Keys of items to render
     */
    render(container, items, keys) {
        container.innerHTML = keys.map(key =>
            ItemCard.render(key, items[key], this.getCategoryId())
        ).join('');
    }

    /**
     * Append more items to the container (for pagination)
     * @param {HTMLElement} container - Container element
     * @param {object} items - Items to render
     * @param {Array} keys - Keys of items to append
     */
    appendItems(container, items, keys) {
        const html = keys.map(key =>
            ItemCard.render(key, items[key], this.getCategoryId())
        ).join('');
        container.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Called after rendering is complete
     * Override in subclasses for post-render setup (e.g., SVG connections)
     * @param {HTMLElement} container - Container element
     */
    afterRender(container) {
        // Default: no post-render actions
    }

    /**
     * Handle window resize
     * Override in subclasses if needed
     */
    onResize() {
        // Default: no resize handling
    }

    /**
     * Clean up handler resources
     * Override in subclasses if needed
     */
    dispose() {
        // Default: no cleanup needed
    }
}

// Export for use in other modules
window.BaseHandler = BaseHandler;
