/**
 * Default Handler for EU5 Inspector
 * Provides standard grid rendering for categories without special handling
 */
class DefaultHandler extends BaseHandler {
    constructor(app, categoryId) {
        super(app);
        this.categoryId = categoryId;
    }

    getCategoryId() {
        return this.categoryId;
    }

    getFilterConfig() {
        const category = CategoryRegistry.get(this.categoryId);
        return category ? category.filters : [];
    }
}

// Export for use in other modules
window.DefaultHandler = DefaultHandler;
