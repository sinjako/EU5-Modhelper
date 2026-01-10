/**
 * Subject Types Handler for EU5 Inspector
 * Handles vassal/subject display with level filtering
 */
class SubjectTypesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'subject_types';
    }

    getFilterConfig() {
        return CategoryRegistry.get('subject_types').filters;
    }

    /**
     * Extract filter values with special handling for subject level
     */
    extractFilterValues(item, key) {
        if (key === 'level') {
            if (item.level) return [item.level];
            if (item.tier) return [item.tier];
            // Try to infer from autonomy or other properties
            if (item.min_autonomy !== undefined) {
                if (item.min_autonomy >= 75) return ['high_autonomy'];
                if (item.min_autonomy >= 50) return ['medium_autonomy'];
                return ['low_autonomy'];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.SubjectTypesHandler = SubjectTypesHandler;
