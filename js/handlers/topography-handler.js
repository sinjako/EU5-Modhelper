/**
 * Topography Handler for EU5 Inspector
 * Handles terrain type display
 */
class TopographyHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'topography';
    }

    getFilterConfig() {
        return CategoryRegistry.get('topography').filters;
    }

    extractFilterValues(item, key) {
        if (key === 'type') {
            // Determine if land, water, or wasteland
            if (item.is_water) return ['water'];
            if (item.is_wasteland) return ['wasteland'];
            return ['land'];
        }
        return super.extractFilterValues(item, key);
    }
}

window.TopographyHandler = TopographyHandler;
