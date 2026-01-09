/**
 * EU5 Inspector - Main Application
 */

class EU5Inspector {
    constructor() {
        this.loader = new FileLoader();
        this.filters = null;
        this.search = null;
        this.isLoaded = false;
        this.filtersOpen = false;

        this.currentCategory = null;
        this.items = {};
        this.filteredItems = {};
        this.searchQuery = '';

        // Tech tree data cache
        this.techTreeData = null;
        this.currentEra = null;

        // Reference system for clickable values
        this.referenceIndex = new Map(); // categoryId -> Set of item names
        this.colorDefinitions = {};      // color name -> CSS color string
        this.referenceCategories = {};   // additional loaded reference data

        // Reference paths for loading
        this.referencePaths = {
            colors: 'game/in_game/common/colors',
            religion_groups: 'game/in_game/common/religion_groups',
            culture_groups: 'game/in_game/common/culture_groups',
            languages: 'game/in_game/common/languages',
            pop_types: 'game/in_game/common/pop_types'
        };

        // Filter configurations for each category
        this.filterConfigs = {
            religions: [
                { key: 'group', name: 'Religion Group' },
                { key: 'tags', name: 'Tags' }
            ],
            cultures: [
                { key: 'culture_groups', name: 'Culture Group' },
                { key: 'language', name: 'Language' },
                { key: 'tags', name: 'Tags' }
            ],
            buildings: [
                { key: 'category', name: 'Building Category' },
                { key: 'pop_type', name: 'Worker Type' }
            ],
            goods: [
                { key: 'category', name: 'Goods Category' }
            ],
            unit_types: [
                { key: 'category', name: 'Unit Category' },
                { key: 'type', name: 'Unit Type' }
            ],
            traits: [
                { key: 'type', name: 'Trait Type' }
            ],
            advances: [
                { key: 'category', name: 'Advance Category' },
                { key: 'era', name: 'Era' }
            ],
            laws: [
                { key: 'law_category', name: 'Category' },
                { key: 'law_gov_group', name: 'Government Type' }
            ],
            casus_belli: [
                { key: 'war_goal_type', name: 'War Goal Type' }
            ],
            subject_types: [
                { key: 'level', name: 'Level' }
            ],
            institutions: [
                { key: 'age', name: 'Age' }
            ],
            formable_countries: [
                { key: 'level', name: 'Level' },
                { key: 'rule', name: 'Rule Type' }
            ],
            heirs_selections: [
                { key: 'use_election', name: 'Election Type' }
            ],
            international_organizations: [
                { key: 'unique', name: 'Unique' },
                { key: 'has_parliament', name: 'Has Parliament' }
            ]
        };

        // Category definitions - organized by type
        this.categories = [
            // Core gameplay
            { id: 'religions', name: 'Religions', icon: '\u2721', path: 'game/in_game/common/religions' },
            { id: 'cultures', name: 'Cultures', icon: '\uD83C\uDFAD', path: 'game/in_game/common/cultures' },
            { id: 'languages', name: 'Languages', icon: '\uD83D\uDCAC', path: 'game/in_game/common/languages' },

            // Government & Politics
            { id: 'government_types', name: 'Govts', icon: '\uD83D\uDC51', path: 'game/in_game/common/government_types' },
            { id: 'laws', name: 'Laws', icon: '\u2696', path: 'game/in_game/common/laws' },
            { id: 'estates', name: 'Estates', icon: '\uD83C\uDFDB', path: 'game/in_game/common/estates' },
            { id: 'heirs_selections', name: 'Succession', icon: '\uD83D\uDC6A', path: 'game/in_game/common/heir_selections' },

            // Economy & Buildings
            { id: 'buildings', name: 'Buildings', icon: '\uD83C\uDFD7', path: 'game/in_game/common/building_types' },
            { id: 'goods', name: 'Goods', icon: '\uD83D\uDCE6', path: 'game/in_game/common/goods' },
            { id: 'pop_types', name: 'Pops', icon: '\uD83D\uDC65', path: 'game/in_game/common/pop_types' },
            { id: 'institutions', name: 'Institutions', icon: '\uD83C\uDF93', path: 'game/in_game/common/institution' },

            // Military & Diplomacy
            { id: 'unit_types', name: 'Units', icon: '\u2694', path: 'game/in_game/common/unit_types' },
            { id: 'casus_belli', name: 'CBs', icon: '\u2620', path: 'game/in_game/common/casus_belli' },
            { id: 'subject_types', name: 'Subjects', icon: '\uD83E\uDD1D', path: 'game/in_game/common/subject_types' },
            { id: 'international_organizations', name: 'Orgs', icon: '\uD83C\uDF10', path: 'game/in_game/common/international_organizations' },

            // Characters & Misc
            { id: 'traits', name: 'Traits', icon: '\u2B50', path: 'game/in_game/common/traits' },
            { id: 'advances', name: 'Advances', icon: '\uD83D\uDCDA', path: 'game/in_game/common/advances' },
            { id: 'disasters', name: 'Disasters', icon: '\u26A0', path: 'game/in_game/common/disasters' },
            { id: 'formable_countries', name: 'Formables', icon: '\uD83D\uDDFA', path: 'game/in_game/common/formable_countries' }
        ];
    }

    /**
     * Initialize the application
     */
    async init() {
        const categoriesEl = document.getElementById('categories');
        const searchEl = document.getElementById('search');
        const filtersEl = document.getElementById('filters');
        const filterToggle = document.getElementById('filter-toggle');
        const filterClear = document.getElementById('filter-clear');
        const folderInfo = document.getElementById('folder-info');

        this.renderCategories(categoriesEl);

        this.search = new Search(searchEl, (query) => {
            this.searchQuery = query.toLowerCase().trim();
            this.applyFilters();
            this.renderItems();
        });

        this.filters = new Filters(filtersEl, () => {
            this.applyFilters();
            this.renderItems();
            this.updateFilterButton();
        });

        filterToggle.addEventListener('click', () => this.toggleFilters());
        filterClear.addEventListener('click', () => {
            if (this.filters) {
                this.filters.resetAll();
            }
        });

        // Add click handler for reference links
        document.getElementById('items-grid').addEventListener('click', (e) => {
            this.handleReferenceClick(e);
        });

        // Redraw tech tree connections on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentCategory === 'advances' && this.techTreeData) {
                    this.drawTechTreeConnections();
                }
            }, 100);
        });

        // Load folder button
        const loadBtn = document.getElementById('load-folder');
        const debugBtn = document.getElementById('debug-btn');

        loadBtn.addEventListener('click', async () => {
            await this.selectFolder();

            if (this.isLoaded) {
                folderInfo.textContent = this.loader.getFolderName();
                folderInfo.classList.add('loaded');
                loadBtn.style.display = 'none';
                debugBtn.style.display = 'inline-block';

                // Load reference data (colors, etc.) in background
                this.loadReferenceData();

                if (this.categories.length > 0) {
                    this.selectCategory(this.categories[0].id);
                }
            }
        });

        debugBtn.addEventListener('click', () => this.dumpDebugInfo());

        this.renderItems();
    }

    /**
     * Load reference data for clickable links (colors, groups, etc.)
     */
    async loadReferenceData() {
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
            if (refType === 'colors') continue; // Already loaded
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
            if (value && value._type === 'rgb') {
                this.colorDefinitions[key] = `rgb(${Math.round(value.r)}, ${Math.round(value.g)}, ${Math.round(value.b)})`;
            } else if (value && value._type === 'hsv') {
                this.colorDefinitions[key] = this.hsvToRgb(value.h, value.s, value.v);
            } else if (value && typeof value === 'object') {
                // Nested color definitions
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (subKey.startsWith('_')) continue;
                    if (subValue && subValue._type === 'rgb') {
                        this.colorDefinitions[subKey] = `rgb(${Math.round(subValue.r)}, ${Math.round(subValue.g)}, ${Math.round(subValue.b)})`;
                    } else if (subValue && subValue._type === 'hsv') {
                        this.colorDefinitions[subKey] = this.hsvToRgb(subValue.h, subValue.s, subValue.v);
                    }
                }
            }
        }
    }

    /**
     * Convert HSV to RGB CSS string
     */
    hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let r, g, b;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        return `rgb(${Math.round((r+m)*255)}, ${Math.round((g+m)*255)}, ${Math.round((b+m)*255)})`;
    }

    /**
     * Handle click on reference links
     */
    handleReferenceClick(e) {
        const refLink = e.target.closest('.ref-link');
        if (!refLink) return;

        e.preventDefault();
        const category = refLink.dataset.category;
        const item = refLink.dataset.item;

        if (category && item) {
            this.navigateToReference(category, item);
        }
    }

    /**
     * Navigate to a referenced item
     */
    navigateToReference(category, itemName) {
        // Check if it's a main category
        const mainCat = this.categories.find(c => c.id === category);
        if (mainCat) {
            // Load and select the category, then scroll to item
            this.selectCategory(category);
            // Clear search/filters to show item
            this.searchQuery = '';
            if (this.search) this.search.clear();
            if (this.filters) this.filters.resetAll();

            // After render, scroll to the item card
            setTimeout(() => {
                const card = document.querySelector(`.item-card[data-name="${itemName}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('highlight');
                    setTimeout(() => card.classList.remove('highlight'), 2000);
                }
            }, 100);
            return;
        }

        // Check reference categories
        if (this.referenceCategories[category] && this.referenceCategories[category][itemName]) {
            // Show a popup or expand with the reference data
            this.showReferencePopup(category, itemName, this.referenceCategories[category][itemName]);
        }
    }

    /**
     * Show a popup with reference details
     */
    showReferencePopup(category, itemName, data) {
        // Create or update popup
        let popup = document.getElementById('ref-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'ref-popup';
            popup.className = 'ref-popup';
            document.body.appendChild(popup);

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.ref-popup') && !e.target.closest('.ref-link')) {
                    popup.classList.remove('visible');
                }
            });
        }

        const displayName = itemName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        popup.innerHTML = `
            <div class="ref-popup-header">
                <span class="ref-popup-category">${categoryName}</span>
                <span class="ref-popup-title">${displayName}</span>
                <button class="ref-popup-close">&times;</button>
            </div>
            <div class="ref-popup-content">
                ${ItemCard.renderDetails(data)}
            </div>
        `;

        popup.querySelector('.ref-popup-close').addEventListener('click', () => {
            popup.classList.remove('visible');
        });

        popup.classList.add('visible');
    }

    /**
     * Look up a reference - returns { category, exists, color? }
     */
    lookupReference(value) {
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
        for (const [catId, items] of Object.entries(this.items)) {
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

    renderCategories(container) {
        container.innerHTML = this.categories.map(cat => `
            <button class="category-btn" data-category="${cat.id}">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </button>
        `).join('');

        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.category);
            });
        });
    }

    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.techTreeData = null;

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryId);
        });

        if (!this.items[categoryId]) {
            this.loadCategory(categoryId);
        } else {
            this.applyFilters();
            this.renderItems();
            this.setupFilters(categoryId);
        }
    }

    toggleFilters() {
        this.filtersOpen = !this.filtersOpen;
        document.getElementById('filters').classList.toggle('open', this.filtersOpen);
        this.updateFilterButton();
    }

    updateFilterButton() {
        const btn = document.getElementById('filter-toggle');
        const hasActive = this.filters && this.filters.hasActiveFilters();
        btn.classList.toggle('open', this.filtersOpen);
        btn.classList.toggle('has-filters', hasActive);
    }

    async selectFolder() {
        const selected = await this.loader.selectFolder();
        if (!selected) return;

        const isValid = this.loader.validateEU5Folder();
        if (!isValid) {
            alert('This does not appear to be a valid EU5 installation folder.\n\nPlease select the folder containing the "game" and "clausewitz" directories.');
            return;
        }

        this.isLoaded = true;
    }

    async loadCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        document.getElementById('items-grid').innerHTML = '<div class="loading-state">Loading...</div>';

        try {
            const data = await this.loader.readDirectory(category.path);
            this.items[categoryId] = data || {};
            this.applyFilters();
            this.renderItems();
            this.setupFilters(categoryId);
        } catch (err) {
            console.error(`Error loading category ${categoryId}:`, err);
            this.items[categoryId] = {};
            this.renderItems();
        }
    }

    setupFilters(categoryId) {
        const filterConfig = this.filterConfigs[categoryId];
        const data = this.items[categoryId];

        if (filterConfig && data) {
            const filterGroups = this.extractFilterGroups(data, filterConfig);
            this.filters.setFilterGroups(filterGroups);
        } else {
            this.filters.clear();
        }
    }

    extractFilterGroups(data, filterConfig) {
        const groups = [];

        for (const config of filterConfig) {
            const valueCounts = new Map();

            for (const [itemKey, item] of Object.entries(data)) {
                if (itemKey.startsWith('_')) continue;
                if (!item || typeof item !== 'object') continue;

                const values = this.extractFilterValues(item, config.key);

                for (const v of values) {
                    if (v !== null && v !== undefined && v !== '' && v !== '[object Object]') {
                        const strValue = String(v);
                        // Skip invalid values
                        if (strValue && strValue !== 'undefined' && strValue !== 'null') {
                            valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
                        }
                    }
                }
            }

            if (valueCounts.size > 1) {
                const sortedValues = Array.from(valueCounts.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([value, count]) => ({ value, count }));

                groups.push({
                    key: config.key,
                    name: config.name,
                    values: sortedValues
                });
            }
        }

        return groups;
    }

    extractFilterValues(item, key) {
        if (!(key in item)) return [];

        const value = item[key];

        // Handle tags array
        if (key === 'tags' && Array.isArray(value)) {
            return value.filter(v => typeof v === 'string');
        }

        // Handle culture_groups object (keys are the group names)
        if (key === 'culture_groups' && value && typeof value === 'object' && !Array.isArray(value)) {
            return Object.keys(value).filter(k => !k.startsWith('_') && typeof k === 'string');
        }

        // Handle other objects with keys
        if (value && typeof value === 'object' && !Array.isArray(value) && !value._type) {
            return Object.keys(value).filter(k => !k.startsWith('_'));
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.filter(v => typeof v === 'string');
        }

        // Handle simple values
        if (typeof value === 'string' || typeof value === 'number') {
            return [value];
        }

        return [];
    }

    applyFilters() {
        const categoryId = this.currentCategory;
        if (!categoryId || !this.items[categoryId]) return;

        const items = this.items[categoryId];
        const filtered = {};

        for (const [key, value] of Object.entries(items)) {
            if (key.startsWith('_')) continue;

            if (this.searchQuery && !key.toLowerCase().includes(this.searchQuery)) {
                continue;
            }

            if (this.filters && !this.filters.itemPassesFilters(value)) {
                continue;
            }

            filtered[key] = value;
        }

        this.filteredItems[categoryId] = filtered;
    }

    renderItems() {
        const grid = document.getElementById('items-grid');
        const countEl = document.getElementById('items-count');

        if (!this.currentCategory) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <h2>Select EU5 Folder</h2>
                    <p>Click "Select EU5 Folder" above to get started, then choose a category.</p>
                </div>
            `;
            countEl.textContent = '';
            return;
        }

        const allItems = this.items[this.currentCategory] || {};
        const items = this.filteredItems[this.currentCategory] || {};
        const keys = Object.keys(items).filter(k => !k.startsWith('_'));
        const totalKeys = Object.keys(allItems).filter(k => !k.startsWith('_')).length;

        countEl.textContent = keys.length === totalKeys
            ? `${keys.length} items`
            : `${keys.length} of ${totalKeys}`;

        if (keys.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h2>No matching items</h2><p>Try adjusting your filters or search query.</p></div>';
            return;
        }

        // Special view for advances
        if (this.currentCategory === 'advances') {
            this.renderAdvances(grid, items, keys);
            return;
        }

        // Regular grid view
        grid.innerHTML = keys.map(key =>
            ItemCard.render(key, items[key], this.currentCategory)
        ).join('');
    }

    renderAdvances(grid, items, keys) {
        // Build the tech tree data structure
        this.techTreeData = this.buildTechTreeData(items, keys);

        // Render the visual tech tree
        grid.innerHTML = this.renderTechTree();

        // Add era tab handlers
        grid.querySelectorAll('.era-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentEra = tab.dataset.era;
                this.renderItems();
            });
        });

        // Add node click handlers for expansion
        grid.querySelectorAll('.tech-node').forEach(node => {
            node.addEventListener('click', (e) => {
                // Don't toggle if clicking a link
                if (e.target.closest('.ref-link')) return;
                node.classList.toggle('expanded');
                // Redraw connections after expansion animation
                setTimeout(() => this.drawTechTreeConnections(), 250);
            });
        });

        // Draw SVG connections after DOM is rendered
        requestAnimationFrame(() => {
            this.drawTechTreeConnections();
        });
    }

    buildTechTreeData(items, keys) {
        const advances = {};

        // First pass: create all nodes, FILTER OUT advances with 'potential' block
        for (const key of keys) {
            const item = items[key];

            // Skip advances with 'potential' block (country-specific advances)
            if (item.potential) {
                continue;
            }

            // Get era - primarily from 'age' field (direct in EU5 advances)
            let era = item.age || item._fileAge || 'other';
            // Get icon name
            const icon = item.icon || null;
            // Check if this is a root node (depth = 0 in the data)
            const isRoot = item.depth === 0 || item.depth === '0';

            advances[key] = {
                name: key,
                data: item,
                requires: this.extractRequirements(item),
                unlockedBy: [],
                treeDepth: 0,
                era: era,
                icon: icon,
                isRoot: isRoot
            };
        }

        // Second pass: build reverse dependencies (children)
        for (const [key, advance] of Object.entries(advances)) {
            for (const req of advance.requires) {
                if (advances[req]) {
                    advances[req].unlockedBy.push(key);
                }
            }
        }

        // Calculate tree depths using BFS from roots
        // Roots are either: marked with depth=0 in data, OR have no internal requirements
        const roots = [];
        for (const [key, advance] of Object.entries(advances)) {
            const internalReqs = advance.requires.filter(r => advances[r]);
            if (advance.isRoot || internalReqs.length === 0) {
                roots.push(key);
                advances[key].treeDepth = 0;
            }
        }

        // BFS to calculate depths
        const queue = [...roots];
        const visited = new Set(roots);

        while (queue.length > 0) {
            const current = queue.shift();
            const currentDepth = advances[current].treeDepth;

            for (const child of advances[current].unlockedBy) {
                if (!visited.has(child)) {
                    visited.add(child);
                    advances[child].treeDepth = currentDepth + 1;
                    queue.push(child);
                }
            }
        }

        // Handle any unvisited nodes (circular deps or disconnected)
        for (const [key, advance] of Object.entries(advances)) {
            if (!visited.has(key)) {
                advances[key].treeDepth = 0;
            }
        }

        // Debug: Log dependency info
        console.log('=== TECH TREE DEBUG ===');
        console.log('Total advances:', Object.keys(advances).length);
        const withDeps = Object.values(advances).filter(a => a.requires.length > 0).length;
        console.log('Advances with dependencies:', withDeps);
        console.log('Root nodes:', roots.length);

        // Show a few examples of advances with their requires
        const examples = Object.entries(advances).slice(0, 10);
        console.log('First 10 advances:');
        examples.forEach(([key, adv]) => {
            console.log(`  ${key}: age=${adv.era}, requires=[${adv.requires.join(', ')}], unlockedBy=[${adv.unlockedBy.join(', ')}]`);
        });

        // Check raw data for 'requires' field
        const sampleKeys = Object.keys(items).slice(0, 5);
        console.log('Raw data check for requires field:');
        sampleKeys.forEach(key => {
            const item = items[key];
            console.log(`  ${key}: raw requires =`, item.requires, 'type:', typeof item.requires);
        });

        return advances;
    }

    renderTechTree() {
        const advances = this.techTreeData;
        if (!advances) return '';

        // Group by era
        const eras = {};
        for (const [key, advance] of Object.entries(advances)) {
            const era = advance.era;
            if (!eras[era]) eras[era] = [];
            eras[era].push({ key, ...advance });
        }

        // Sort eras by age number, filter out "other"
        const eraOrder = Object.keys(eras)
            .filter(e => e !== 'other' && e !== 'Other')
            .sort((a, b) => {
                const aNum = parseInt(a.match(/\d+/)?.[0] || '99');
                const bNum = parseInt(b.match(/\d+/)?.[0] || '99');
                return aNum - bNum;
            });

        // Set default era if not set
        if (!this.currentEra || !eras[this.currentEra] || this.currentEra === 'other') {
            this.currentEra = eraOrder[0];
        }

        // Pretty era names
        const eraLabels = {
            'age_1_traditions': 'I - Age of Traditions',
            'age_2_renaissance': 'II - Age of Renaissance',
            'age_3_discovery': 'III - Age of Discovery',
            'age_4_reformation': 'IV - Age of Reformation',
            'age_5_absolutism': 'V - Age of Absolutism',
            'age_6_revolutions': 'VI - Age of Revolutions'
        };

        let html = '<div class="tech-tree-container">';

        // Era tabs
        html += '<div class="era-tabs">';
        for (const era of eraOrder) {
            const eraName = eraLabels[era] || era.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const isActive = era === this.currentEra;
            const count = eras[era].length;
            html += `<button class="era-tab ${isActive ? 'active' : ''}" data-era="${era}">${eraName} <span class="era-count">(${count})</span></button>`;
        }
        html += '</div>';

        // Get advances for current era only
        const currentAdvances = eras[this.currentEra] || [];
        const advanceMap = {};
        currentAdvances.forEach(a => advanceMap[a.key] = a);
        const currentKeys = new Set(currentAdvances.map(a => a.key));

        // Find era roots (no same-era requirements)
        const eraRoots = currentAdvances.filter(adv => {
            const internalReqs = adv.requires.filter(r => currentKeys.has(r));
            return internalReqs.length === 0;
        });

        // Sort roots alphabetically
        eraRoots.sort((a, b) => a.key.localeCompare(b.key));

        // Debug log
        console.log(`Era ${this.currentEra}: ${currentAdvances.length} universal advances, ${eraRoots.length} root trees`);

        html += `<div class="tech-era" data-era="${this.currentEra}">`;
        html += `<div class="tech-forest">`;

        // Render each independent tree
        for (const root of eraRoots) {
            html += this.renderTree(root, advanceMap, currentKeys);
        }

        html += '</div></div>';
        html += '</div>';
        return html;
    }

    /**
     * Recursively render a tree from a root node
     */
    renderTree(node, advanceMap, currentKeys) {
        const displayName = node.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Get children that are in this era
        const children = (node.unlockedBy || [])
            .filter(childKey => currentKeys.has(childKey))
            .map(childKey => advanceMap[childKey])
            .filter(Boolean)
            .sort((a, b) => a.key.localeCompare(b.key));

        let html = `<div class="tree-node" data-key="${node.key}">`;

        // Node card (compact version)
        html += `<div class="tree-node-card">`;
        html += `<span class="tree-icon">${this.getTechIcon(node.key, node.data)}</span>`;
        html += `<span class="tree-name" title="${displayName}">${displayName}</span>`;
        html += `</div>`;

        // Children
        if (children.length > 0) {
            html += `<div class="tree-children">`;
            for (const child of children) {
                html += this.renderTree(child, advanceMap, currentKeys);
            }
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    getTechIcon(key, data) {
        // Try to determine icon based on tech name or category
        const name = key.toLowerCase();
        if (name.includes('military') || name.includes('army') || name.includes('infantry') || name.includes('cavalry')) return '⚔️';
        if (name.includes('naval') || name.includes('ship') || name.includes('fleet')) return '⚓';
        if (name.includes('trade') || name.includes('merchant') || name.includes('market')) return '💰';
        if (name.includes('diplomacy') || name.includes('diplomatic') || name.includes('envoy')) return '📜';
        if (name.includes('admin') || name.includes('government') || name.includes('reform')) return '🏛️';
        if (name.includes('religion') || name.includes('church') || name.includes('faith')) return '⛪';
        if (name.includes('culture') || name.includes('art') || name.includes('theater')) return '🎭';
        if (name.includes('science') || name.includes('university') || name.includes('school')) return '🔬';
        if (name.includes('exploration') || name.includes('colonial') || name.includes('new_world')) return '🧭';
        if (name.includes('manufactories') || name.includes('production') || name.includes('industry')) return '🏭';
        if (name.includes('renaissance')) return '🎨';
        if (name.includes('printing') || name.includes('press')) return '📰';
        if (name.includes('revolution')) return '🔥';
        return '📜';
    }

    drawTechTreeConnections() {
        const advances = this.techTreeData;
        if (!advances) return;

        const eraEl = document.querySelector('.tech-era');
        if (!eraEl) return;

        const svg = eraEl.querySelector('.tech-connections');
        const treeEl = eraEl.querySelector('.era-tree');
        if (!svg || !treeEl) return;

        // Get nodes currently displayed
        const nodes = eraEl.querySelectorAll('.tech-node');
        const displayedKeys = new Set();
        nodes.forEach(n => displayedKeys.add(n.dataset.key));

        // Set SVG size
        const treeRect = treeEl.getBoundingClientRect();
        svg.setAttribute('width', treeRect.width);
        svg.setAttribute('height', treeRect.height);
        svg.style.width = treeRect.width + 'px';
        svg.style.height = treeRect.height + 'px';

        // Get node positions
        const nodePositions = {};
        nodes.forEach(node => {
            const key = node.dataset.key;
            const rect = node.getBoundingClientRect();
            nodePositions[key] = {
                x: rect.left - treeRect.left + rect.width / 2,
                top: rect.top - treeRect.top,
                bottom: rect.top - treeRect.top + rect.height
            };
        });

        let paths = '';

        // Draw connections only for displayed nodes
        for (const [key, advance] of Object.entries(advances)) {
            if (!displayedKeys.has(key)) continue;
            const fromPos = nodePositions[key];
            if (!fromPos) continue;

            for (const childKey of advance.unlockedBy) {
                if (!displayedKeys.has(childKey)) continue;
                const toPos = nodePositions[childKey];
                if (!toPos) continue;

                const startX = fromPos.x;
                const startY = fromPos.bottom;
                const endX = toPos.x;
                const endY = toPos.top;
                const midY = (startY + endY) / 2;

                if (Math.abs(startX - endX) < 5) {
                    paths += `<path d="M ${startX} ${startY} L ${endX} ${endY}" class="tech-connection-line" />`;
                } else {
                    paths += `<path d="M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}" class="tech-connection-line" />`;
                }
            }
        }

        svg.innerHTML = paths;
    }

    extractRequirements(item) {
        const reqs = [];

        if (!item || typeof item !== 'object') return reqs;

        // PRIMARY: Check 'requires' field - this is the main dependency mechanism in EU5
        if (item.requires) {
            if (typeof item.requires === 'string') {
                reqs.push(item.requires);
            } else if (Array.isArray(item.requires)) {
                reqs.push(...item.requires.filter(r => typeof r === 'string'));
            }
        }

        // SECONDARY: Check other possible requirement fields
        const otherFields = ['prerequisites', 'prerequisite', 'parent'];
        for (const field of otherFields) {
            if (item[field]) {
                const val = item[field];
                if (typeof val === 'string') {
                    reqs.push(val);
                } else if (Array.isArray(val)) {
                    reqs.push(...val.filter(v => typeof v === 'string'));
                }
            }
        }

        return [...new Set(reqs)];
    }

    renderTechEffects(item) {
        const effects = [];

        // Look for modifier blocks
        if (item.modifier && typeof item.modifier === 'object') {
            for (const [key, val] of Object.entries(item.modifier)) {
                if (!key.startsWith('_')) {
                    const sign = typeof val === 'number' && val > 0 ? '+' : '';
                    effects.push(`${key.replace(/_/g, ' ')}: ${sign}${val}`);
                }
            }
        }

        if (effects.length === 0) return '';

        return `
            <div class="tech-section tech-effects">
                <span class="tech-label">Effects:</span>
                <ul class="effects-list">
                    ${effects.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
                    ${effects.length > 5 ? `<li class="more">+${effects.length - 5} more...</li>` : ''}
                </ul>
            </div>
        `;
    }

    /**
     * Dump comprehensive debug info to console
     */
    dumpDebugInfo() {
        console.clear();
        console.log('%c=== EU5 INSPECTOR DEBUG DUMP ===', 'font-size:20px;color:#e94560;font-weight:bold');
        console.log('Timestamp:', new Date().toISOString());
        console.log('');

        // 1. Current state
        console.log('%c[1] CURRENT STATE', 'font-size:16px;color:#61afef;font-weight:bold');
        console.log('  Current category:', this.currentCategory);
        console.log('  Current era:', this.currentEra);
        console.log('  Is loaded:', this.isLoaded);
        console.log('  Search query:', this.searchQuery || '(none)');
        console.log('');

        // 2. Raw items data
        console.log('%c[2] RAW DATA', 'font-size:16px;color:#61afef;font-weight:bold');
        const rawItems = this.items[this.currentCategory] || {};
        const rawKeys = Object.keys(rawItems).filter(k => !k.startsWith('_'));
        console.log('  Total raw items:', rawKeys.length);
        console.log('  First 5 raw items:');
        rawKeys.slice(0, 5).forEach(key => {
            const item = rawItems[key];
            console.log(`    ${key}:`, {
                age: item.age,
                depth: item.depth,
                requires: item.requires,
                icon: item.icon
            });
        });
        console.log('');

        // 3. Filtered items
        console.log('%c[3] FILTERED DATA', 'font-size:16px;color:#61afef;font-weight:bold');
        const filteredItems = this.filteredItems[this.currentCategory] || {};
        const filteredKeys = Object.keys(filteredItems).filter(k => !k.startsWith('_'));
        console.log('  Filtered items count:', filteredKeys.length);
        console.log('');

        // 4. Tech tree data (if advances)
        if (this.currentCategory === 'advances' && this.techTreeData) {
            console.log('%c[4] TECH TREE DATA', 'font-size:16px;color:#61afef;font-weight:bold');
            const ttData = this.techTreeData;
            const ttKeys = Object.keys(ttData);
            console.log('  Total advances in tree:', ttKeys.length);

            // Group by era
            const byEra = {};
            ttKeys.forEach(key => {
                const era = ttData[key].era;
                if (!byEra[era]) byEra[era] = [];
                byEra[era].push(key);
            });
            console.log('  By era:', Object.fromEntries(
                Object.entries(byEra).map(([k, v]) => [k, v.length])
            ));

            // Current era details
            console.log('');
            console.log('%c[5] CURRENT ERA DETAILS', 'font-size:16px;color:#61afef;font-weight:bold');
            const currentEraAdvances = ttKeys.filter(k => ttData[k].era === this.currentEra);
            console.log('  Current era:', this.currentEra);
            console.log('  Advances in current era:', currentEraAdvances.length);

            // Dependency analysis for current era
            const inEraKeys = new Set(currentEraAdvances);
            let rootCount = 0;
            let withDeps = 0;
            let withChildren = 0;
            const depthCounts = {};

            currentEraAdvances.forEach(key => {
                const adv = ttData[key];
                const internalReqs = adv.requires.filter(r => inEraKeys.has(r));
                const internalChildren = adv.unlockedBy.filter(u => inEraKeys.has(u));

                if (internalReqs.length === 0) rootCount++;
                if (internalReqs.length > 0) withDeps++;
                if (internalChildren.length > 0) withChildren++;

                const d = adv.treeDepth || 0;
                depthCounts[d] = (depthCounts[d] || 0) + 1;
            });

            console.log('  Roots (no in-era requirements):', rootCount);
            console.log('  With in-era requirements:', withDeps);
            console.log('  With in-era children:', withChildren);
            console.log('  By treeDepth:', depthCounts);

            // Sample advances with full details
            console.log('');
            console.log('%c[6] SAMPLE ADVANCES (first 10 in current era)', 'font-size:16px;color:#61afef;font-weight:bold');
            currentEraAdvances.slice(0, 10).forEach(key => {
                const adv = ttData[key];
                const internalReqs = adv.requires.filter(r => inEraKeys.has(r));
                const internalChildren = adv.unlockedBy.filter(u => inEraKeys.has(u));
                console.log(`  ${key}:`);
                console.log(`    era: ${adv.era}`);
                console.log(`    treeDepth: ${adv.treeDepth}`);
                console.log(`    isRoot: ${adv.isRoot}`);
                console.log(`    requires (all): [${adv.requires.join(', ')}]`);
                console.log(`    requires (in-era): [${internalReqs.join(', ')}]`);
                console.log(`    unlockedBy (all): [${adv.unlockedBy.join(', ')}]`);
                console.log(`    unlockedBy (in-era): [${internalChildren.join(', ')}]`);
            });

            // DOM analysis
            console.log('');
            console.log('%c[7] DOM ANALYSIS', 'font-size:16px;color:#61afef;font-weight:bold');
            const techRows = document.querySelectorAll('.tech-row');
            console.log('  Tech rows in DOM:', techRows.length);
            techRows.forEach((row, i) => {
                const nodes = row.querySelectorAll('.tech-node');
                console.log(`    Row ${i} (depth=${row.dataset.depth}): ${nodes.length} nodes`);
            });

            const allNodes = document.querySelectorAll('.tech-node');
            console.log('  Total tech-nodes in DOM:', allNodes.length);

            // Check CSS
            console.log('');
            console.log('%c[8] CSS CHECK', 'font-size:16px;color:#61afef;font-weight:bold');
            const firstRow = document.querySelector('.tech-row');
            if (firstRow) {
                const style = getComputedStyle(firstRow);
                console.log('  .tech-row display:', style.display);
                console.log('  .tech-row flexWrap:', style.flexWrap);
                console.log('  .tech-row width:', style.width);
                console.log('  .tech-row overflow:', style.overflow);
            }
            const firstNode = document.querySelector('.tech-node');
            if (firstNode) {
                const style = getComputedStyle(firstNode);
                console.log('  .tech-node display:', style.display);
                console.log('  .tech-node width:', style.width);
                console.log('  .tech-node visibility:', style.visibility);
            }
        }

        // 9. Raw advance data sample
        if (this.currentCategory === 'advances') {
            console.log('');
            console.log('%c[9] RAW PARSED DATA (3 samples)', 'font-size:16px;color:#61afef;font-weight:bold');
            rawKeys.slice(0, 3).forEach(key => {
                console.log(`  ${key}:`, JSON.stringify(rawItems[key], null, 2));
            });
        }

        console.log('');
        console.log('%c=== END DEBUG DUMP ===', 'font-size:20px;color:#e94560;font-weight:bold');
    }
}

// Global app instance for reference lookup
window.eu5App = null;

document.addEventListener('DOMContentLoaded', () => {
    window.eu5App = new EU5Inspector();
    window.eu5App.init();
});
