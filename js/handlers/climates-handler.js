/**
 * Climates Handler for EU5 Inspector
 * Handles climate type display
 */
class ClimatesHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'climates';
    }

    getFilterConfig() {
        return CategoryRegistry.get('climates').filters;
    }

    extractFilterValues(item, key) {
        if (key === 'winter') {
            if (item.winter) return [item.winter];
            return ['none'];
        }
        return super.extractFilterValues(item, key);
    }
}

window.ClimatesHandler = ClimatesHandler;
