/**
 * Modifier Types Handler for EU5 Inspector
 * Handles the master list of all available modifier types
 */
class ModifierTypesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'modifier_types';
    }

    getFilterConfig() {
        return CategoryRegistry.get('modifier_types').filters;
    }

    /**
     * Extract filter values with special handling for modifier properties
     */
    extractFilterValues(item, key) {
        if (key === 'category') {
            // Extract category from game_data block
            if (item.game_data && item.game_data.category) {
                return [item.game_data.category];
            }
            return [];
        }
        if (key === 'color') {
            // Color indicates if modifier is good/bad/neutral
            if (item.color) return [item.color];
            return [];
        }
        if (key === 'value_type') {
            // Determine value type (boolean, percent, numeric)
            const types = [];
            if (item.boolean === 'yes' || item.boolean === true) types.push('boolean');
            if (item.percent === 'yes' || item.percent === true) types.push('percent');
            if (types.length === 0) types.push('numeric');
            return types;
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.ModifierTypesHandler = ModifierTypesHandler;
