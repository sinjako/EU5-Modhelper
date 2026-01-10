/**
 * Events Handler for EU5 Inspector
 * Handles event display with type and source file filtering
 */
class EventsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'events';
    }

    getFilterConfig() {
        return CategoryRegistry.get('events').filters;
    }

    /**
     * Extract filter values with special handling for event type and source
     */
    extractFilterValues(item, key) {
        if (key === 'type') {
            // Event type - look for type field or infer from structure
            if (item.type) return [item.type];
            // Check for common event type indicators
            if (item.is_triggered_only) return ['triggered'];
            if (item.fire_only_once) return ['fire_once'];
            if (item.major) return ['major'];
            return ['standard'];
        }
        if (key === '_sourceFile') {
            // Source file for grouping by event category
            if (item._sourceFile) {
                // Extract the main category from the path
                const source = item._sourceFile;
                // Remove .txt extension and get the filename or folder
                const parts = source.replace('.txt', '').split('/');
                if (parts.length > 1) {
                    return [parts[0]]; // Return folder name
                }
                return [source.replace('.txt', '')];
            }
        }
        return super.extractFilterValues(item, key);
    }
}

// Export for use in other modules
window.EventsHandler = EventsHandler;
