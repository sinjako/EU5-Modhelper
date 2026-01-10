/**
 * International Organizations Handler for EU5 Inspector
 * Handles organization display with unique and parliament filtering
 */
class InternationalOrgsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'international_organizations';
    }

    getFilterConfig() {
        return CategoryRegistry.get('international_organizations').filters;
    }

    /**
     * Extract filter values with special handling for unique and parliament
     */
    extractFilterValues(item, key) {
        if (key === 'unique') {
            if (item.unique !== undefined) {
                return [item.unique ? 'Unique' : 'Generic'];
            }
        }
        if (key === 'has_parliament') {
            if (item.has_parliament !== undefined) {
                return [item.has_parliament ? 'Has Parliament' : 'No Parliament'];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.InternationalOrgsHandler = InternationalOrgsHandler;
