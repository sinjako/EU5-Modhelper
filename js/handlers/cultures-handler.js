/**
 * Cultures Handler for EU5 Inspector
 * Handles culture display with grouping by culture group
 */
class CulturesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'cultures';
    }

    getFilterConfig() {
        return CategoryRegistry.get('cultures').filters;
    }

    /**
     * Extract filter values with special handling for culture groups
     */
    extractFilterValues(item, key) {
        if (key === 'culture_groups' && item.culture_groups) {
            // Culture groups is an object with group names as keys
            if (typeof item.culture_groups === 'object') {
                return Object.keys(item.culture_groups).filter(k => !k.startsWith('_'));
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.CulturesHandler = CulturesHandler;
