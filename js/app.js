/**
 * EU5 ModHelper - Main Application
 * Core orchestration for loading, navigation, mod support, and handler coordination
 */

class EU5ModHelper {
    constructor() {
        this.loader = new FileLoader();
        this.modLoader = new ModLoader();
        this.referenceManager = new ReferenceManager(this.loader);
        this.filters = null;
        this.search = null;
        this.isLoaded = false;
        this.filtersOpen = false;

        this.currentCategory = null;
        this.currentHandler = null;
        this.items = {};        // Base game items
        this.modItems = {};     // Merged items (base + mod)
        this.filteredItems = {};
        this.searchQuery = '';

        // Pagination state
        this.pageSize = 200;
        this.displayedCount = 0;
        this.allKeys = [];
        this.isLoadingMore = false;

        // Handler instances cache
        this.handlers = {};
    }

    /**
     * Get or create handler for a category
     */
    getHandler(categoryId) {
        if (this.handlers[categoryId]) {
            return this.handlers[categoryId];
        }

        const category = CategoryRegistry.get(categoryId);
        if (!category) return null;

        let handler;
        switch (category.handler) {
            case 'advances':
                handler = new AdvancesHandler(this);
                break;
            case 'religions':
                handler = new ReligionsHandler(this);
                break;
            case 'cultures':
                handler = new CulturesHandler(this);
                break;
            case 'laws':
                handler = new LawsHandler(this);
                break;
            case 'heir-selections':
                handler = new HeirSelectionsHandler(this);
                break;
            case 'buildings':
                handler = new BuildingsHandler(this);
                break;
            case 'goods':
                handler = new GoodsHandler(this);
                break;
            case 'institutions':
                handler = new InstitutionsHandler(this);
                break;
            case 'unit-types':
                handler = new UnitTypesHandler(this);
                break;
            case 'casus-belli':
                handler = new CasusBelliHandler(this);
                break;
            case 'subject-types':
                handler = new SubjectTypesHandler(this);
                break;
            case 'international-orgs':
                handler = new InternationalOrgsHandler(this);
                break;
            case 'modifier-types':
                handler = new ModifierTypesHandler(this);
                break;
            case 'static-modifiers':
                handler = new StaticModifiersHandler(this);
                break;
            case 'traits':
                handler = new TraitsHandler(this);
                break;
            case 'events':
                handler = new EventsHandler(this);
                break;
            case 'formable-countries':
                handler = new FormableCountriesHandler(this);
                break;
            case 'climates':
                handler = new ClimatesHandler(this);
                break;
            case 'vegetation':
                handler = new VegetationHandler(this);
                break;
            case 'topography':
                handler = new TopographyHandler(this);
                break;
            case 'locations':
                handler = new LocationsHandler(this);
                break;
            case 'map-definitions':
                handler = new MapDefinitionsHandler(this);
                break;
            case 'mod-changes':
                handler = new ModChangesHandler(this);
                break;
            default:
                handler = new DefaultHandler(this, categoryId);
        }

        this.handlers[categoryId] = handler;
        return handler;
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

        // Redraw handler connections on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentHandler) {
                    this.currentHandler.onResize();
                }
            }, 100);
        });

        // Infinite scroll for pagination
        const mainContent = document.querySelector('.main-content');
        mainContent.addEventListener('scroll', () => {
            this.handleScroll(mainContent);
        });

        // Load folder button
        const loadBtn = document.getElementById('load-folder');
        const debugBtn = document.getElementById('debug-btn');
        const modSelector = document.getElementById('mod-selector');
        const modSelect = document.getElementById('mod-select');

        loadBtn.addEventListener('click', async () => {
            await this.selectFolder();

            if (this.isLoaded) {
                folderInfo.textContent = this.loader.getFolderName();
                folderInfo.classList.add('loaded');
                loadBtn.textContent = 'Load Mods';

                // Show mod selector
                modSelector.style.display = 'flex';

                // Load reference data in background
                this.referenceManager.loadAll();

                const categories = CategoryRegistry.getAll();
                if (categories.length > 0) {
                    this.selectCategory(categories[0].id);
                }

                // Change button to load mods
                loadBtn.onclick = async () => {
                    await this.loadMods();
                };
            }
        });

        // Mod selection change handler
        modSelect.addEventListener('change', () => {
            this.selectMod(modSelect.value);
        });

        debugBtn.addEventListener('click', () => this.dumpDebugInfo());

        this.renderItems();
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
        const categories = CategoryRegistry.getAll();
        const mainCat = categories.find(c => c.id === category);

        if (mainCat) {
            this.selectCategory(category);
            this.searchQuery = '';
            if (this.search) this.search.clear();
            if (this.filters) this.filters.resetAll();

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
        const refData = this.referenceManager.getCategory(category);
        if (refData && refData[itemName]) {
            this.showReferencePopup(category, itemName, refData[itemName]);
        }
    }

    /**
     * Show a popup with reference details
     */
    showReferencePopup(category, itemName, data) {
        let popup = document.getElementById('ref-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'ref-popup';
            popup.className = 'ref-popup';
            document.body.appendChild(popup);

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
     * Look up a reference - delegates to ReferenceManager
     */
    lookupReference(value) {
        return this.referenceManager.lookup(value, this.items);
    }

    renderCategories(container) {
        const categories = CategoryRegistry.getAll();
        container.innerHTML = categories.map(cat => `
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
        this.currentHandler = this.getHandler(categoryId);

        // Reset scroll position and pagination
        document.querySelector('.main-content').scrollTop = 0;
        this.displayedCount = 0;

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

    /**
     * Load mods from a selected folder
     */
    async loadMods() {
        const mods = await this.modLoader.selectModFolder();
        if (mods.length === 0) {
            alert('No mods found in the selected folder.\n\nMods should have a .metadata/metadata.json file or descriptor.mod file.');
            return;
        }

        // Populate mod selector
        const modSelect = document.getElementById('mod-select');
        modSelect.innerHTML = '<option value="">No Mod (Base Game)</option>';

        for (const mod of mods) {
            const option = document.createElement('option');
            option.value = mod.id;
            option.textContent = `${mod.name} (v${mod.version})`;
            modSelect.appendChild(option);
        }

        // Show success message
        const folderInfo = document.getElementById('folder-info');
        folderInfo.textContent = `${this.loader.getFolderName()} - ${mods.length} mod(s) loaded`;
    }

    /**
     * Select and activate a mod
     */
    async selectMod(modId) {
        this.modLoader.selectMod(modId);

        // Clear merged items cache to force reload with mod
        this.modItems = {};

        // Update categories to show/hide mod changes
        this.updateCategoriesForMod(modId);

        // Reload current category with mod data
        if (this.currentCategory) {
            await this.loadCategory(this.currentCategory);
        }
    }

    /**
     * Update category visibility based on mod selection
     */
    updateCategoriesForMod(modId) {
        const modChangesBtn = document.querySelector('.category-btn[data-category="mod_changes"]');
        if (modChangesBtn) {
            modChangesBtn.style.display = modId ? '' : 'none';
        }
    }

    /**
     * Get items for current category (base or merged with mod)
     */
    getItemsForCategory(categoryId) {
        if (this.modLoader.getCurrentMod()) {
            return this.modItems[categoryId] || this.items[categoryId] || {};
        }
        return this.items[categoryId] || {};
    }

    async loadCategory(categoryId) {
        const category = CategoryRegistry.get(categoryId);
        if (!category) return;

        // Special handling for mod_changes category
        if (categoryId === 'mod_changes') {
            this.items[categoryId] = this.buildModChangesData();
            this.applyFilters();
            this.renderItems();
            this.setupFilters(categoryId);
            return;
        }

        document.getElementById('items-grid').innerHTML = '<div class="loading-state">Loading...</div>';

        try {
            // Load base game data if not already loaded
            if (!this.items[categoryId]) {
                let data;
                if (category.specialFile) {
                    data = await this.loader.readFile(category.path + '/' + category.specialFile);
                } else {
                    data = await this.loader.readDirectory(category.path);
                }
                this.items[categoryId] = data || {};
            }

            // If a mod is active, load and merge mod data
            if (this.modLoader.getCurrentMod()) {
                const modData = await this.loadModDataForCategory(categoryId, category);
                if (modData && Object.keys(modData).length > 0) {
                    this.modItems[categoryId] = this.modLoader.mergeData(
                        this.items[categoryId],
                        modData,
                        categoryId
                    );
                } else {
                    this.modItems[categoryId] = this.items[categoryId];
                }
            }

            this.applyFilters();
            this.renderItems();
            this.setupFilters(categoryId);
        } catch (err) {
            console.error(`Error loading category ${categoryId}:`, err);
            this.items[categoryId] = {};
            this.renderItems();
        }
    }

    /**
     * Load mod data for a specific category
     */
    async loadModDataForCategory(categoryId, category) {
        const modFiles = this.modLoader.getModFilesInDirectory(category.path);
        if (modFiles.length === 0) return null;

        const combined = {};
        const parser = new ParadoxParser();

        for (const { file } of modFiles) {
            try {
                const text = await file.text();
                const parsed = parser.parse(text);
                const filename = file.name.replace('.txt', '');

                for (const [key, value] of Object.entries(parsed)) {
                    if (key.startsWith('_')) continue;
                    if (typeof value === 'object' && value !== null) {
                        value._sourceFile = filename;
                        value._fromMod = true;
                    }
                    combined[key] = value;
                }
            } catch (err) {
                console.error(`Error reading mod file ${file.name}:`, err);
            }
        }

        return combined;
    }

    /**
     * Build data for mod changes category
     */
    buildModChangesData() {
        const changes = this.modLoader.getModChanges();
        const data = {};

        for (const change of changes) {
            const key = `${change.category}:${change.key}`;
            data[key] = {
                _changeType: change.type,
                _category: change.category,
                _itemKey: change.key,
                _modName: change.modName,
                original: change.original,
                modded: change.modded
            };
        }

        return data;
    }

    setupFilters(categoryId) {
        const handler = this.getHandler(categoryId);
        const data = this.getItemsForCategory(categoryId);

        if (handler && data) {
            const filterGroups = handler.buildFilterGroups(data);
            this.filters.setFilterGroups(filterGroups);
        } else {
            this.filters.clear();
        }
    }

    applyFilters() {
        const categoryId = this.currentCategory;
        const items = this.getItemsForCategory(categoryId);
        if (!categoryId || !items || Object.keys(items).length === 0) return;

        const handler = this.getHandler(categoryId);
        if (handler) {
            this.filteredItems[categoryId] = handler.applyFilters(
                items,
                this.searchQuery,
                this.filters
            );
        }
        // Reset pagination when filters change
        this.displayedCount = 0;
    }

    /**
     * Handle scroll for infinite loading
     */
    handleScroll(container) {
        if (this.isLoadingMore) return;
        if (this.displayedCount >= this.allKeys.length) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Load more when 200px from bottom
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            this.loadMoreItems();
        }
    }

    /**
     * Load more items for pagination
     */
    loadMoreItems() {
        if (this.isLoadingMore) return;
        if (this.displayedCount >= this.allKeys.length) return;

        this.isLoadingMore = true;
        const grid = document.getElementById('items-grid');
        const items = this.filteredItems[this.currentCategory] || {};

        const nextBatch = this.allKeys.slice(this.displayedCount, this.displayedCount + this.pageSize);
        this.displayedCount += nextBatch.length;

        // Append new items
        const handler = this.getHandler(this.currentCategory);
        if (handler) {
            handler.appendItems(grid, items, nextBatch);
        }

        this.updateItemCount();
        this.isLoadingMore = false;
    }

    /**
     * Update the displayed item count
     */
    updateItemCount() {
        const countEl = document.getElementById('items-count');
        const totalFiltered = this.allKeys.length;
        const allItems = this.getItemsForCategory(this.currentCategory);
        const totalItems = Object.keys(allItems).filter(k => !k.startsWith('_')).length;

        // Show mod indicator if mod is active
        const modSuffix = this.modLoader.getCurrentMod() ? ' (modded)' : '';

        if (this.displayedCount < totalFiltered) {
            countEl.textContent = `${this.displayedCount} of ${totalFiltered}${totalFiltered < totalItems ? ` (${totalItems} total)` : ''}${modSuffix}`;
        } else {
            countEl.textContent = totalFiltered === totalItems
                ? `${totalFiltered} items${modSuffix}`
                : `${totalFiltered} of ${totalItems}${modSuffix}`;
        }
    }

    renderItems() {
        const grid = document.getElementById('items-grid');
        const countEl = document.getElementById('items-count');
        const mainContent = document.querySelector('.main-content');

        // Reset scroll position on fresh render
        mainContent.scrollTop = 0;

        if (!this.currentCategory) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <h2>EU5 ModHelper</h2>
                    <p>Click "Load EU5 Folder" above to get started, then optionally load mods.</p>
                </div>
            `;
            countEl.textContent = '';
            return;
        }

        const allItems = this.getItemsForCategory(this.currentCategory);
        const items = this.filteredItems[this.currentCategory] || {};
        this.allKeys = Object.keys(items).filter(k => !k.startsWith('_'));

        if (this.allKeys.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h2>No matching items</h2><p>Try adjusting your filters or search query.</p></div>';
            countEl.textContent = '';
            return;
        }

        // Paginate: only render first batch
        const initialKeys = this.allKeys.slice(0, this.pageSize);
        this.displayedCount = initialKeys.length;

        // Delegate rendering to the handler
        const handler = this.getHandler(this.currentCategory);
        if (handler) {
            handler.render(grid, items, initialKeys);
            handler.afterRender(grid);
        }

        this.updateItemCount();
    }

    /**
     * Dump comprehensive debug info to a new window
     */
    dumpDebugInfo() {
        const rawItems = this.items[this.currentCategory] || {};
        const rawKeys = Object.keys(rawItems).filter(k => !k.startsWith('_'));
        const filteredItems = this.filteredItems[this.currentCategory] || {};
        const filteredKeys = Object.keys(filteredItems).filter(k => !k.startsWith('_'));

        let html = `<!DOCTYPE html>
<html>
<head>
    <title>EU5 Inspector - Debug</title>
    <style>
        body {
            background: #1a1a2e;
            color: #eee;
            font-family: 'Consolas', 'Monaco', monospace;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #e94560; border-bottom: 2px solid #e94560; padding-bottom: 10px; }
        h2 { color: #61afef; margin-top: 30px; }
        .section { background: #16213e; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .label { color: #98c379; }
        .value { color: #e5c07b; }
        .key { color: #c678dd; }
        pre {
            background: #0f0f1a;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            max-height: 400px;
            overflow-y: auto;
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #333; }
        th { color: #61afef; }
    </style>
</head>
<body>
    <h1>EU5 Inspector Debug Dump</h1>
    <p>Timestamp: ${new Date().toISOString()}</p>

    <h2>1. Current State</h2>
    <div class="section">
        <table>
            <tr><td class="label">Current category:</td><td class="value">${this.currentCategory || '(none)'}</td></tr>
            <tr><td class="label">Current handler:</td><td class="value">${this.currentHandler?.constructor.name || '(none)'}</td></tr>
            <tr><td class="label">Is loaded:</td><td class="value">${this.isLoaded}</td></tr>
            <tr><td class="label">Search query:</td><td class="value">${this.searchQuery || '(none)'}</td></tr>
        </table>
    </div>

    <h2>2. Data Summary</h2>
    <div class="section">
        <table>
            <tr><td class="label">Total raw items:</td><td class="value">${rawKeys.length}</td></tr>
            <tr><td class="label">Filtered items:</td><td class="value">${filteredKeys.length}</td></tr>
        </table>
    </div>

    <h2>3. Sample Items (First 10)</h2>
    <div class="section">
        <pre>${this.escapeHtml(JSON.stringify(
            Object.fromEntries(rawKeys.slice(0, 10).map(k => [k, rawItems[k]])),
            null, 2
        ))}</pre>
    </div>

    <h2>4. All Item Keys</h2>
    <div class="section">
        <pre>${rawKeys.join('\n')}</pre>
    </div>
</body>
</html>`;

        const debugWindow = window.open('', '_blank', 'width=900,height=700');
        debugWindow.document.write(html);
        debugWindow.document.close();
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;');
    }
}

// Global app instance for reference lookup
window.eu5App = null;

document.addEventListener('DOMContentLoaded', () => {
    window.eu5App = new EU5ModHelper();
    window.eu5App.init();
});
