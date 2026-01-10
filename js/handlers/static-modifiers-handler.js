/**
 * Static Modifiers Handler for EU5 Inspector
 * Handles base game modifiers (bankruptcy, ruler stats, etc.)
 */
class StaticModifiersHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'static_modifiers';
    }

    getFilterConfig() {
        return CategoryRegistry.get('static_modifiers').filters;
    }

    /**
     * Extract filter values with special handling for static modifier properties
     */
    extractFilterValues(item, key) {
        if (key === 'category') {
            // Extract category from game_data block
            if (item.game_data && item.game_data.category) {
                return [item.game_data.category];
            }
            return [];
        }
        if (key === '_sourceFile') {
            // Group by source file (country.txt, character.txt, etc.)
            if (item._sourceFile) {
                return [item._sourceFile.replace('.txt', '')];
            }
            return [];
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.StaticModifiersHandler = StaticModifiersHandler;
