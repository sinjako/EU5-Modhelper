/**
 * Heir Selections Handler for EU5 Inspector
 * Handles succession method display
 */
class HeirSelectionsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'heirs_selections';
    }

    getFilterConfig() {
        return CategoryRegistry.get('heirs_selections').filters;
    }

    /**
     * Extract filter values with special handling for election type
     */
    extractFilterValues(item, key) {
        if (key === 'use_election') {
            // Boolean field - convert to string for filtering
            if (item.use_election !== undefined) {
                return [item.use_election ? 'Election' : 'Hereditary'];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.HeirSelectionsHandler = HeirSelectionsHandler;
