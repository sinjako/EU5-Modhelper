/**
 * Casus Belli Handler for EU5 Inspector
 * Handles CB display with war goal type filtering
 */
class CasusBelliHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'casus_belli';
    }

    getFilterConfig() {
        return CategoryRegistry.get('casus_belli').filters;
    }

    /**
     * Extract filter values with special handling for war goal type
     */
    extractFilterValues(item, key) {
        if (key === 'war_goal_type') {
            if (item.war_goal) return [item.war_goal];
            if (item.war_goal_type) return [item.war_goal_type];
            if (item.type) return [item.type];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.CasusBelliHandler = CasusBelliHandler;
