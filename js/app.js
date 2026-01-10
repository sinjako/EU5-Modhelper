/**
 * EU5 Inspector - Main Application
 * Core orchestration for loading, navigation, and handler coordination
 */

class EU5Inspector {
    constructor() {
        this.loader = new FileLoader();
        this.referenceManager = new ReferenceManager(this.loader);
        this.filters = null;
        this.search = null;
        this.isLoaded = false;
        this.filtersOpen = false;

        this.currentCategory = null;
        this.currentHandler = null;
        this.items = {};
        this.filteredItems = {};
        this.searchQuery = '';

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

                // Load reference data in background
                this.referenceManager.loadAll();

                const categories = CategoryRegistry.getAll();
                if (categories.length > 0) {
                    this.selectCategory(categories[0].id);
                }
            }
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
        const category = CategoryRegistry.get(categoryId);
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
        const handler = this.getHandler(categoryId);
        const data = this.items[categoryId];

        if (handler && data) {
            const filterGroups = handler.buildFilterGroups(data);
            this.filters.setFilterGroups(filterGroups);
        } else {
            this.filters.clear();
        }
    }

    applyFilters() {
        const categoryId = this.currentCategory;
        if (!categoryId || !this.items[categoryId]) return;

        const handler = this.getHandler(categoryId);
        if (handler) {
            this.filteredItems[categoryId] = handler.applyFilters(
                this.items[categoryId],
                this.searchQuery,
                this.filters
            );
        }
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

        // Delegate rendering to the handler
        const handler = this.getHandler(this.currentCategory);
        if (handler) {
            handler.render(grid, items, keys);
            handler.afterRender(grid);
        }
    }

    /**
     * Dump comprehensive debug info to console
     */
    dumpDebugInfo() {
        console.clear();
        console.log('%c=== EU5 INSPECTOR DEBUG DUMP ===', 'font-size:20px;color:#e94560;font-weight:bold');
        console.log('Timestamp:', new Date().toISOString());
        console.log('');

        console.log('%c[1] CURRENT STATE', 'font-size:16px;color:#61afef;font-weight:bold');
        console.log('  Current category:', this.currentCategory);
        console.log('  Current handler:', this.currentHandler?.constructor.name);
        console.log('  Is loaded:', this.isLoaded);
        console.log('  Search query:', this.searchQuery || '(none)');
        console.log('');

        console.log('%c[2] RAW DATA', 'font-size:16px;color:#61afef;font-weight:bold');
        const rawItems = this.items[this.currentCategory] || {};
        const rawKeys = Object.keys(rawItems).filter(k => !k.startsWith('_'));
        console.log('  Total raw items:', rawKeys.length);
        console.log('  First 5 raw items:');
        rawKeys.slice(0, 5).forEach(key => {
            console.log(`    ${key}:`, rawItems[key]);
        });
        console.log('');

        console.log('%c[3] FILTERED DATA', 'font-size:16px;color:#61afef;font-weight:bold');
        const filteredItems = this.filteredItems[this.currentCategory] || {};
        const filteredKeys = Object.keys(filteredItems).filter(k => !k.startsWith('_'));
        console.log('  Filtered items count:', filteredKeys.length);
        console.log('');

        // Handler-specific debug info
        if (this.currentHandler && this.currentCategory === 'advances') {
            const handler = this.currentHandler;
            const ttData = handler.getTechTreeData();
            if (ttData) {
                console.log('%c[4] TECH TREE DATA', 'font-size:16px;color:#61afef;font-weight:bold');
                const ttKeys = Object.keys(ttData);
                console.log('  Total advances in tree:', ttKeys.length);

                const byEra = {};
                ttKeys.forEach(key => {
                    const era = ttData[key].era;
                    if (!byEra[era]) byEra[era] = [];
                    byEra[era].push(key);
                });
                console.log('  By era:', Object.fromEntries(
                    Object.entries(byEra).map(([k, v]) => [k, v.length])
                ));
                console.log('  Current era:', handler.getCurrentEra());
            }
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
