/**
 * Formable Countries Handler for EU5 Inspector
 * Handles formable nation display with level and rule filtering
 */
class FormableCountriesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'formable_countries';
    }

    getFilterConfig() {
        return CategoryRegistry.get('formable_countries').filters;
    }

    /**
     * Extract filter values with special handling for level and rule type
     */
    extractFilterValues(item, key) {
        if (key === 'level') {
            if (item.level) return [item.level];
            if (item.tier) return [item.tier];
            // Try to infer from type
            if (item.is_end_game_tag) return ['end_game'];
            if (item.is_regional) return ['regional'];
        }
        if (key === 'rule') {
            if (item.rule) return [item.rule];
            if (item.formation_type) return [item.formation_type];
            // Check for common rule patterns
            if (item.ai_will_do === 0 || item.ai_will_do === 'no') return ['player_only'];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.FormableCountriesHandler = FormableCountriesHandler;
