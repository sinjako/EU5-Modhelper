/**
 * Goods Handler for EU5 Inspector
 * Handles trade goods display with category filtering
 */
class GoodsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'goods';
    }

    getFilterConfig() {
        return CategoryRegistry.get('goods').filters;
    }

    /**
     * Extract filter values with special handling for goods category
     */
    extractFilterValues(item, key) {
        if (key === 'category') {
            if (item.category) return [item.category];
            if (item.type) return [item.type];
            // Try to infer from properties
            if (item.is_military) return ['military'];
            if (item.is_luxury) return ['luxury'];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.GoodsHandler = GoodsHandler;
