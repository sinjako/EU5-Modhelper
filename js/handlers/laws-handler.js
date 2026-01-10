/**
 * Laws Handler for EU5 Inspector
 * Handles law display with category and government type filtering
 */
class LawsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'laws';
    }

    getFilterConfig() {
        return CategoryRegistry.get('laws').filters;
    }

    /**
     * Extract filter values with special handling for law category and gov group
     */
    extractFilterValues(item, key) {
        if (key === 'law_category') {
            // Extract from the source file or explicit category field
            if (item._sourceFile) {
                const match = item._sourceFile.match(/(\w+)_laws/);
                if (match) return [match[1]];
            }
            if (item.category) return [item.category];
        }
        if (key === 'law_gov_group') {
            // Laws may specify which government types they apply to
            if (item.potential && item.potential.government_type) {
                return [item.potential.government_type];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.LawsHandler = LawsHandler;
