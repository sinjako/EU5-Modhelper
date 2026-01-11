/**
 * Map Definitions Handler for EU5 Inspector
 * Displays hierarchical tree view: Continent -> Subcontinent -> Region -> Area -> Province
 */
class MapDefinitionsHandler extends BaseHandler {
    constructor(app) {
        super(app);
        this.treeView = null;
        this.hierarchyData = null;
    }

    getCategoryId() {
        return 'map_definitions';
    }

    getFilterConfig() {
        return [];
    }

    /**
     * Build the hierarchy from raw definitions data
     */
    buildHierarchy(rawData) {
        const hierarchy = {};

        for (const [key, value] of Object.entries(rawData)) {
            if (key.startsWith('_')) continue;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                hierarchy[key] = this.processLevel(value, 1);
            }
        }

        return hierarchy;
    }

    /**
     * Process a level of the hierarchy
     */
    processLevel(data, depth) {
        if (!data || typeof data !== 'object') return data;
        if (Array.isArray(data)) return data;

        const processed = {};

        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                processed[key] = this.processLevel(value, depth + 1);
            } else {
                processed[key] = value;
            }
        }

        return processed;
    }

    /**
     * Override render to show tree view
     */
    render(container, items, keys) {
        this.hierarchyData = this.buildHierarchy(items);

        container.innerHTML = `
            <div class="tree-toolbar">
                <button class="tree-btn" data-action="expand-all">Expand All</button>
                <button class="tree-btn" data-action="collapse-all">Collapse All</button>
                <div class="tree-stats">
                    ${this.getHierarchyStats(items)}
                </div>
            </div>
            <div class="tree-container" id="region-tree"></div>
        `;

        const treeContainer = container.querySelector('#region-tree');
        this.treeView = new TreeView(treeContainer, {
            levelNames: ['Continent', 'Subcontinent', 'Region', 'Area', 'Province'],
            levelColors: ['#e94560', '#61afef', '#98c379', '#e5c07b', '#c678dd'],
            onSelect: (path, level) => this.onNodeSelect(path, level)
        });

        this.treeView.render(this.hierarchyData);

        container.querySelector('[data-action="expand-all"]').addEventListener('click', () => {
            this.treeView.expandAll();
        });

        container.querySelector('[data-action="collapse-all"]').addEventListener('click', () => {
            this.treeView.collapseAll();
        });
    }

    /**
     * Get hierarchy statistics
     */
    getHierarchyStats(items) {
        const stats = { continents: 0, subcontinents: 0, regions: 0, areas: 0, provinces: 0 };

        const countLevel = (obj, depth) => {
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('_')) continue;

                switch (depth) {
                    case 0: stats.continents++; break;
                    case 1: stats.subcontinents++; break;
                    case 2: stats.regions++; break;
                    case 3: stats.areas++; break;
                    case 4: stats.provinces++; break;
                }

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    countLevel(value, depth + 1);
                }
            }
        };

        countLevel(items, 0);

        return `
            <span class="stat-item"><span class="stat-label">Continents:</span> ${stats.continents}</span>
            <span class="stat-item"><span class="stat-label">Subcontinents:</span> ${stats.subcontinents}</span>
            <span class="stat-item"><span class="stat-label">Regions:</span> ${stats.regions}</span>
            <span class="stat-item"><span class="stat-label">Areas:</span> ${stats.areas}</span>
            <span class="stat-item"><span class="stat-label">Provinces:</span> ${stats.provinces}</span>
        `;
    }

    /**
     * Handle node selection
     */
    onNodeSelect(path, level) {
        // Node selection callback - can be extended for interactivity
    }

    /**
     * Override filter application - tree handles its own filtering via search
     */
    applyFilters(items, searchQuery, filters) {
        if (this.treeView && searchQuery) {
            this.treeView.filter(searchQuery);
        }
        return items;
    }

    /**
     * No filter groups for tree view
     */
    buildFilterGroups(items) {
        return [];
    }

    /**
     * No pagination for tree view
     */
    appendItems(container, items, keys) {
        // Tree view doesn't use pagination
    }
}

window.MapDefinitionsHandler = MapDefinitionsHandler;
