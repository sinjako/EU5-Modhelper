/**
 * Reference Manager for EU5 Inspector
 * Handles loading and looking up reference data (colors, religion groups, etc.)
 */
class ReferenceManager {
    constructor(loader) {
        this.loader = loader;
        this.colorDefinitions = {};
        this.referenceCategories = {};
        this.referenceIndex = new Map();

        // Paths for reference data
        this.referencePaths = {
            colors: 'game/in_game/common/colors',
            religion_groups: 'game/in_game/common/religion_groups',
            culture_groups: 'game/in_game/common/culture_groups',
            languages: 'game/in_game/common/languages',
            pop_types: 'game/in_game/common/pop_types'
        };
    }

    /**
     * Load all reference data
     */
    async loadAll() {
        // Load colors first as they're most commonly referenced
        try {
            const colorData = await this.loader.readDirectory(this.referencePaths.colors);
            if (colorData) {
                this.processColorDefinitions(colorData);
            }
        } catch (err) {
            console.log('Could not load color definitions:', err);
        }

        // Load other reference categories
        for (const [refType, path] of Object.entries(this.referencePaths)) {
            if (refType === 'colors') continue;
            try {
                const data = await this.loader.readDirectory(path);
                if (data) {
                    this.referenceCategories[refType] = data;
                    this.referenceIndex.set(refType, new Set(
                        Object.keys(data).filter(k => !k.startsWith('_'))
                    ));
                }
            } catch (err) {
                console.log(`Could not load ${refType}:`, err);
            }
        }
    }

    /**
     * Process color definitions into CSS color strings
     */
    processColorDefinitions(data) {
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue;

            // Direct color value
            const color = ColorUtils.processColor(value);
            if (color) {
                this.colorDefinitions[key] = color;
            } else if (value && typeof value === 'object') {
                // Nested color definitions
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subKey.startsWith('_')) continue;
                    const subColor = ColorUtils.processColor(subValue);
                    if (subColor) {
                        this.colorDefinitions[subKey] = subColor;
                    }
                }
            }
        }
    }

    /**
     * Look up a reference value
     * @param {string} value - The value to look up
     * @param {object} mainItems - The main items object from the app (for cross-category lookup)
     * @returns {object|null} Reference info { category, exists, color? }
     */
    lookup(value, mainItems = {}) {
        if (typeof value !== 'string') return null;

        // Check color definitions first
        if (this.colorDefinitions[value]) {
            return {
                category: 'colors',
                exists: true,
                color: this.colorDefinitions[value]
            };
        }

        // Check main categories
        for (const [catId, items] of Object.entries(mainItems)) {
            if (items && items[value] && !value.startsWith('_')) {
                return { category: catId, exists: true };
            }
        }

        // Check reference categories
        for (const [refType, data] of Object.entries(this.referenceCategories)) {
            if (data && data[value] && !value.startsWith('_')) {
                return { category: refType, exists: true };
            }
        }

        return null;
    }

    /**
     * Get color CSS string for a color name
     * @param {string} name - Color name
     * @returns {string|null} CSS color string
     */
    getColor(name) {
        return this.colorDefinitions[name] || null;
    }

    /**
     * Get reference category data
     * @param {string} category - Category name
     * @returns {object|null} Category data
     */
    getCategory(category) {
        return this.referenceCategories[category] || null;
    }

    /**
     * Check if an item exists in a reference category
     * @param {string} category - Category name
     * @param {string} item - Item name
     * @returns {boolean}
     */
    hasItem(category, item) {
        const index = this.referenceIndex.get(category);
        return index ? index.has(item) : false;
    }
}

// Export for use in other modules
window.ReferenceManager = ReferenceManager;
