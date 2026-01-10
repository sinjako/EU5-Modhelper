/**
 * Traits Handler for EU5 Inspector
 * Handles character trait display with type filtering
 */
class TraitsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'traits';
    }

    getFilterConfig() {
        return CategoryRegistry.get('traits').filters;
    }

    /**
     * Extract filter values with special handling for trait type
     */
    extractFilterValues(item, key) {
        if (key === 'type') {
            if (item.type) return [item.type];
            if (item.trait_type) return [item.trait_type];
            // Try to infer from source file or properties
            if (item._sourceFile) {
                if (item._sourceFile.includes('personality')) return ['personality'];
                if (item._sourceFile.includes('ruler')) return ['ruler'];
                if (item._sourceFile.includes('general')) return ['general'];
                if (item._sourceFile.includes('admiral')) return ['admiral'];
            }
            // Check for category indicators
            if (item.is_personality) return ['personality'];
            if (item.is_ruler_trait) return ['ruler'];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.TraitsHandler = TraitsHandler;
