/**
 * Locations Handler for EU5 Inspector
 * Handles location/settlement display from location_templates.txt
 */
class LocationsHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    getCategoryId() {
        return 'locations';
    }

    getFilterConfig() {
        return CategoryRegistry.get('locations').filters;
    }

    extractFilterValues(item, key) {
        if (key === 'topography' && item.topography) {
            return [item.topography];
        }
        if (key === 'vegetation' && item.vegetation) {
            return [item.vegetation];
        }
        if (key === 'climate' && item.climate) {
            return [item.climate];
        }
        if (key === 'raw_material' && item.raw_material) {
            return [item.raw_material];
        }
        return super.extractFilterValues(item, key);
    }
}

window.LocationsHandler = LocationsHandler;
