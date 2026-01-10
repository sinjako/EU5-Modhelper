/**
 * Religions Handler for EU5 Inspector
 * Handles religion display with color swatches
 */
class ReligionsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'religions';
    }

    getFilterConfig() {
        return CategoryRegistry.get('religions').filters;
    }

    /**
     * Extract filter values with special handling for religion group
     */
    extractFilterValues(item, key) {
        if (key === 'group' && item.group) {
            return [item.group];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.ReligionsHandler = ReligionsHandler;
