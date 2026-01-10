/**
 * Institutions Handler for EU5 Inspector
 * Handles institution display with age filtering
 */
class InstitutionsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'institutions';
    }

    getFilterConfig() {
        return CategoryRegistry.get('institutions').filters;
    }

    /**
     * Extract filter values with special handling for age
     */
    extractFilterValues(item, key) {
        if (key === 'age') {
            if (item.age) return [item.age];
            // Try to extract from source file
            if (item._sourceFile) {
                const match = item._sourceFile.match(/age_(\d+)/);
                if (match) return [`age_${match[1]}`];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.InstitutionsHandler = InstitutionsHandler;
