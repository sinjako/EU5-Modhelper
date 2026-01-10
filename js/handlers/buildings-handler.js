/**
 * Buildings Handler for EU5 Inspector
 * Handles building display with category and worker type filtering
 */
class BuildingsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'buildings';
    }

    getFilterConfig() {
        return CategoryRegistry.get('buildings').filters;
    }

    /**
     * Extract filter values with special handling for building category and pop type
     */
    extractFilterValues(item, key) {
        if (key === 'category') {
            if (item.building_category) return [item.building_category];
            if (item.category) return [item.category];
        }
        if (key === 'pop_type') {
            // Extract worker types from production methods or employment
            const popTypes = [];
            if (item.employment && typeof item.employment === 'object') {
                for (const [popType, count] of Object.entries(item.employment)) {
                    if (!popType.startsWith('_')) {
                        popTypes.push(popType);
                    }
                }
            }
            if (item.pop_type) {
                popTypes.push(item.pop_type);
            }
            return popTypes;
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.BuildingsHandler = BuildingsHandler;
