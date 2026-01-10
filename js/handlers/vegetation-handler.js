/**
 * Vegetation Handler for EU5 Inspector
 * Handles vegetation type display
 */
class VegetationHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'vegetation';
    }

    getFilterConfig() {
        return CategoryRegistry.get('vegetation').filters;
    }
}

window.VegetationHandler = VegetationHandler;
