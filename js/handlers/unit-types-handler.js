/**
 * Unit Types Handler for EU5 Inspector
 * Handles military unit display with category and type filtering
 */
class UnitTypesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'unit_types';
    }

    getFilterConfig() {
        return CategoryRegistry.get('unit_types').filters;
    }

    /**
     * Extract filter values with special handling for unit category and type
     */
    extractFilterValues(item, key) {
        if (key === 'category') {
            // Military vs Naval
            if (item.category) return [item.category];
            if (item.type === 'naval' || item.is_naval) return ['naval'];
            if (item.type === 'land' || item.is_land) return ['land'];
        }
        if (key === 'type') {
            // Infantry, Cavalry, Artillery, etc.
            if (item.unit_type) return [item.unit_type];
            if (item.type) return [item.type];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.UnitTypesHandler = UnitTypesHandler;
