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

        // Add click handler for reference links and edit buttons
        document.getElementById('items-grid').addEventListener('click', (e) => {
            // Handle edit button clicks
            const editBtn = e.target.closest('.card-edit-btn');
            if (editBtn) {
                e.preventDefault();
                const name = editBtn.dataset.name;
                const category = editBtn.dataset.category;
                if (name && category) {
                    this.showEditModal(name, category);
                }
                return;
            }

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
        const loadModsBtn = document.getElementById('load-mods-btn');
        const debugBtn = document.getElementById('debug-btn');
        const modSelector = document.getElementById('mod-selector');
        const modSelect = document.getElementById('mod-select');

        loadBtn.addEventListener('click', async () => {
            await this.selectFolder();

            if (this.isLoaded) {
                folderInfo.textContent = this.loader.getFolderName();
                folderInfo.classList.add('loaded');
                loadBtn.style.display = 'none';

                // Show New Mod button and mod selector
                document.getElementById('new-mod-btn').style.display = 'inline-block';
                modSelector.style.display = 'flex';

                // Auto-detect mods from the EU5 folder
                const autoMods = await this.modLoader.scanFromFiles(this.loader.files);
                this.populateModSelector(autoMods);

                // Update folder info with mod count if any found
                if (autoMods.length > 0) {
                    folderInfo.textContent = `${this.loader.getFolderName()} - ${autoMods.length} mod(s) detected`;
                }

                // Show "Load External Mods" button for loading from other locations
                loadModsBtn.textContent = 'Load External Mods';
                loadModsBtn.title = 'Load mods from a different folder (e.g., Steam Workshop)';
                loadModsBtn.style.display = 'inline-block';

                // Load reference data in background
                this.referenceManager.loadAll();

                const categories = CategoryRegistry.getAll();
                if (categories.length > 0) {
                    this.selectCategory(categories[0].id);
                }
            }
        });

        // Load Mods button handler
        loadModsBtn.addEventListener('click', async () => {
            await this.loadMods();
        });

        // New Mod button handler
        const newModBtn = document.getElementById('new-mod-btn');
        newModBtn.addEventListener('click', () => {
            this.showNewModModal();
        });

        // Save Mod button handler
        const saveModBtn = document.getElementById('save-mod-btn');
        saveModBtn.addEventListener('click', () => {
            this.saveMod();
        });

        // Mod selection change handler
        modSelect.addEventListener('change', () => {
            this.selectMod(modSelect.value);
        });

        // Modal handlers
        this.setupModalHandlers();

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
     * Populate the mod selector dropdown
     * @param {Array} mods - Array of mod info objects
     */
    populateModSelector(mods) {
        const modSelect = document.getElementById('mod-select');
        modSelect.innerHTML = '<option value="">No Mod (Base Game)</option>';

        for (const mod of mods) {
            const option = document.createElement('option');
            option.value = mod.id;
            const suffix = mod.isNew ? ' (new)' : '';
            option.textContent = `${mod.name} (v${mod.version})${suffix}`;
            modSelect.appendChild(option);
        }
    }

    /**
     * Load mods from a selected external folder (adds to existing mods)
     */
    async loadMods() {
        const newMods = await this.modLoader.selectModFolder();
        if (newMods.length === 0) {
            alert('No new mods found in the selected folder.\n\nMods should have a .metadata/metadata.json file or descriptor.mod file.\n\nAlready loaded mods are skipped.');
            return;
        }

        // Get all mods (auto-detected + newly loaded)
        const allMods = this.modLoader.getAvailableMods();
        this.populateModSelector(allMods);

        // Show success message
        const folderInfo = document.getElementById('folder-info');
        folderInfo.textContent = `${this.loader.getFolderName()} - ${allMods.length} mod(s) loaded (+${newMods.length} new)`;
    }

    /**
     * Setup modal event handlers
     */
    setupModalHandlers() {
        const modal = document.getElementById('new-mod-modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const createBtn = document.getElementById('modal-create');
        const nameInput = document.getElementById('mod-name');
        const idInput = document.getElementById('mod-id');

        // Close modal handlers
        closeBtn.addEventListener('click', () => this.hideNewModModal());
        cancelBtn.addEventListener('click', () => this.hideNewModModal());

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideNewModModal();
        });

        // Auto-generate ID from name
        nameInput.addEventListener('input', () => {
            const creator = new ModCreator();
            idInput.value = creator.generateId(nameInput.value);
        });

        // Create mod handler
        createBtn.addEventListener('click', () => this.createNewMod());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal.style.display !== 'none') {
                    this.hideNewModModal();
                }
                const editModal = document.getElementById('edit-item-modal');
                if (editModal && editModal.style.display !== 'none') {
                    this.hideEditModal();
                }
            }
        });

        // Edit modal handlers
        this.setupEditModalHandlers();
    }

    /**
     * Setup edit modal event handlers
     */
    setupEditModalHandlers() {
        const editModal = document.getElementById('edit-item-modal');
        const editCloseBtn = document.getElementById('edit-modal-close');
        const editCancelBtn = document.getElementById('edit-modal-cancel');
        const editSaveBtn = document.getElementById('edit-modal-save');
        const addPropBtn = document.getElementById('editor-add-prop');

        editCloseBtn.addEventListener('click', () => this.hideEditModal());
        editCancelBtn.addEventListener('click', () => this.hideEditModal());

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) this.hideEditModal();
        });

        editSaveBtn.addEventListener('click', () => this.saveItemEdits());
        addPropBtn.addEventListener('click', () => this.addNewProperty());
    }

    /**
     * Show the new mod modal
     */
    showNewModModal() {
        const modal = document.getElementById('new-mod-modal');
        modal.style.display = 'flex';

        // Reset form
        document.getElementById('mod-name').value = '';
        document.getElementById('mod-id').value = '';
        document.getElementById('mod-version').value = '1.0.0';
        document.getElementById('mod-game-version').value = '1.0.*';
        document.getElementById('mod-description').value = '';

        // Focus name input
        setTimeout(() => document.getElementById('mod-name').focus(), 100);
    }

    /**
     * Hide the new mod modal
     */
    hideNewModModal() {
        document.getElementById('new-mod-modal').style.display = 'none';
    }

    /**
     * Create a new mod from modal form
     */
    async createNewMod() {
        const name = document.getElementById('mod-name').value.trim();
        const id = document.getElementById('mod-id').value.trim();
        const version = document.getElementById('mod-version').value.trim() || '1.0.0';
        const gameVersion = document.getElementById('mod-game-version').value.trim() || '1.0.*';
        const description = document.getElementById('mod-description').value.trim();

        // Validate
        if (!name) {
            alert('Please enter a mod name.');
            return;
        }
        if (!id) {
            alert('Please enter a mod ID.');
            return;
        }

        // Check if mod ID already exists
        if (this.modLoader.mods.has(id)) {
            alert('A mod with this ID already exists. Please choose a different ID.');
            return;
        }

        // Collect selected tags
        const tags = [];
        if (document.getElementById('tag-gameplay').checked) tags.push('Gameplay');
        if (document.getElementById('tag-balance').checked) tags.push('Balance');
        if (document.getElementById('tag-events').checked) tags.push('Events');
        if (document.getElementById('tag-historical').checked) tags.push('Historical');
        if (document.getElementById('tag-graphics').checked) tags.push('Graphics');
        if (document.getElementById('tag-sound').checked) tags.push('Sound');
        if (document.getElementById('tag-translation').checked) tags.push('Translation');
        if (document.getElementById('tag-utilities').checked) tags.push('Utilities');

        // Collect selected folders
        const folders = [];
        if (document.getElementById('folder-common').checked) folders.push('common');
        if (document.getElementById('folder-events').checked) folders.push('events');
        if (document.getElementById('folder-localization').checked) folders.push('localization');
        if (document.getElementById('folder-gfx').checked) folders.push('gfx');
        if (document.getElementById('folder-gui').checked) folders.push('gui');

        const config = { name, id, version, gameVersion, description, tags, folders };

        // Create mod in memory immediately
        const modInfo = this.modLoader.createInMemory(config);

        // Update the mod selector dropdown
        const allMods = this.modLoader.getAvailableMods();
        this.populateModSelector(allMods);

        // Select the new mod
        const modSelect = document.getElementById('mod-select');
        modSelect.value = id;
        await this.selectMod(id);

        // Show save button since this is an unsaved mod
        document.getElementById('save-mod-btn').style.display = 'inline-block';

        // Update folder info
        const folderInfo = document.getElementById('folder-info');
        folderInfo.textContent = `${this.loader.getFolderName()} - Editing: ${name} (unsaved)`;

        this.hideNewModModal();

        alert(`Mod "${name}" created!\n\nYou can now browse categories and edit items.\nClick "Save Mod" when ready to save to disk.`);
    }

    // ============================================================
    // ITEM EDITING
    // ============================================================

    /**
     * Current item being edited
     */
    editingItem = null;
    editingCategory = null;
    editedValues = {};
    pendingEdits = {}; // { category: { itemName: { prop: value } } }

    /**
     * Show the edit modal for an item
     */
    showEditModal(itemName, category) {
        const items = this.getItemsForCategory(category);
        const itemData = items[itemName];

        if (!itemData) {
            alert('Item not found');
            return;
        }

        this.editingItem = itemName;
        this.editingCategory = category;
        this.editedValues = JSON.parse(JSON.stringify(itemData)); // Deep clone

        const modal = document.getElementById('edit-item-modal');
        const nameEl = document.getElementById('edit-item-name');
        const categoryEl = document.getElementById('editor-category');

        nameEl.textContent = itemName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        categoryEl.textContent = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        this.renderEditor(itemData);
        modal.style.display = 'flex';
    }

    /**
     * Hide the edit modal
     */
    hideEditModal() {
        document.getElementById('edit-item-modal').style.display = 'none';
        this.editingItem = null;
        this.editingCategory = null;
        this.editedValues = {};
    }

    /**
     * Render the editor content
     */
    renderEditor(data) {
        const container = document.getElementById('editor-content');
        container.innerHTML = '';

        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue; // Skip internal properties
            container.appendChild(this.renderEditorProperty(key, value, ''));
        }

        // Add event delegation for boolean buttons
        container.addEventListener('click', (e) => {
            const boolBtn = e.target.closest('.editor-bool-btn');
            if (boolBtn) {
                e.preventDefault();
                const toggle = boolBtn.closest('.editor-bool-toggle');
                const path = toggle.dataset.path;
                const newValue = boolBtn.dataset.boolValue === 'true';

                // Update the value
                this.updateValue(path, newValue);

                // Update button states
                toggle.querySelectorAll('.editor-bool-btn').forEach(btn => {
                    btn.classList.remove('active-yes', 'active-no');
                });
                if (newValue) {
                    boolBtn.classList.add('active-yes');
                } else {
                    boolBtn.classList.add('active-no');
                }
            }
        });
    }

    /**
     * Render a single editor property
     */
    renderEditorProperty(key, value, path) {
        const fullPath = path ? `${path}.${key}` : key;
        const div = document.createElement('div');
        div.className = 'editor-property';
        div.dataset.path = fullPath;

        // Key label
        const keyEl = document.createElement('span');
        keyEl.className = 'editor-prop-key';
        keyEl.textContent = key;
        div.appendChild(keyEl);

        // Value input
        const valueContainer = document.createElement('div');
        valueContainer.className = 'editor-prop-value';

        if (value === null || value === undefined) {
            valueContainer.innerHTML = this.createTextInput(fullPath, '');
        } else if (typeof value === 'boolean') {
            valueContainer.innerHTML = this.createBoolInput(fullPath, value);
        } else if (typeof value === 'number') {
            valueContainer.innerHTML = this.createNumberInput(fullPath, value);
        } else if (typeof value === 'string') {
            valueContainer.innerHTML = this.createTextInput(fullPath, value);
        } else if (value._type === 'rgb') {
            valueContainer.innerHTML = this.createColorInput(fullPath, value, 'rgb');
        } else if (value._type === 'hsv') {
            valueContainer.innerHTML = this.createColorInput(fullPath, value, 'hsv');
        } else if (Array.isArray(value)) {
            valueContainer.innerHTML = this.createArrayInput(fullPath, value);
        } else if (typeof value === 'object') {
            valueContainer.innerHTML = this.createNestedInput(fullPath, value);
        } else {
            valueContainer.innerHTML = this.createTextInput(fullPath, String(value));
        }

        div.appendChild(valueContainer);

        // Delete button
        const actionsEl = document.createElement('div');
        actionsEl.className = 'editor-prop-actions';
        actionsEl.innerHTML = `
            <button class="editor-prop-delete" data-path="${fullPath}" title="Delete property">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
            </button>
        `;
        div.appendChild(actionsEl);

        // Add event listener for delete
        actionsEl.querySelector('.editor-prop-delete').addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteProperty(fullPath);
        });

        return div;
    }

    createTextInput(path, value) {
        return `<input type="text" data-path="${path}" value="${this.escapeHtml(String(value))}" onchange="eu5App.updateValue('${path}', this.value)">`;
    }

    createNumberInput(path, value) {
        return `<input type="number" step="any" data-path="${path}" value="${value}" onchange="eu5App.updateValue('${path}', parseFloat(this.value))">`;
    }

    createBoolInput(path, value) {
        return `
            <div class="editor-bool-toggle" data-path="${path}">
                <button type="button" class="editor-bool-btn ${value ? 'active-yes' : ''}" data-bool-value="true">yes</button>
                <button type="button" class="editor-bool-btn ${!value ? 'active-no' : ''}" data-bool-value="false">no</button>
            </div>
        `;
    }

    createColorInput(path, value, type) {
        if (type === 'rgb') {
            const r = Math.round(value.r || 0);
            const g = Math.round(value.g || 0);
            const b = Math.round(value.b || 0);
            const color = `rgb(${r}, ${g}, ${b})`;
            return `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="editor-color-preview" style="background: ${color}"></span>
                    <div class="editor-color-inputs">
                        <input type="number" min="0" max="255" value="${r}" data-path="${path}.r" onchange="eu5App.updateColorValue('${path}', 'r', this.value)">
                        <input type="number" min="0" max="255" value="${g}" data-path="${path}.g" onchange="eu5App.updateColorValue('${path}', 'g', this.value)">
                        <input type="number" min="0" max="255" value="${b}" data-path="${path}.b" onchange="eu5App.updateColorValue('${path}', 'b', this.value)">
                    </div>
                </div>
            `;
        } else {
            const h = (value.h || 0).toFixed(1);
            const s = (value.s || 0).toFixed(2);
            const v = (value.v || 0).toFixed(2);
            return `
                <div class="editor-color-inputs">
                    <input type="number" step="0.1" min="0" max="360" value="${h}" data-path="${path}.h" onchange="eu5App.updateColorValue('${path}', 'h', this.value)">
                    <input type="number" step="0.01" min="0" max="1" value="${s}" data-path="${path}.s" onchange="eu5App.updateColorValue('${path}', 's', this.value)">
                    <input type="number" step="0.01" min="0" max="1" value="${v}" data-path="${path}.v" onchange="eu5App.updateColorValue('${path}', 'v', this.value)">
                </div>
            `;
        }
    }

    createArrayInput(path, value) {
        const displayVal = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
        return `<input type="text" data-path="${path}" value="${this.escapeHtml(displayVal)}" placeholder="comma-separated values" onchange="eu5App.updateArrayValue('${path}', this.value)">`;
    }

    createNestedInput(path, value) {
        const keys = Object.keys(value).filter(k => !k.startsWith('_'));
        if (keys.length === 0) {
            return `<span style="color: var(--text-muted); font-size: 0.8rem;">{empty object}</span>`;
        }

        let html = `<div class="editor-nested" data-path="${path}">
            <div class="editor-nested-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="editor-nested-toggle">▶</span>
                <span>{${keys.length} properties} - click to expand</span>
            </div>
            <div class="editor-nested-content">`;

        for (const key of keys) {
            const childPath = `${path}.${key}`;
            const childValue = value[key];
            html += `<div class="editor-nested-prop" data-path="${childPath}">
                <span class="editor-nested-key">${key}</span>
                <div class="editor-nested-value">${this.createValueInput(childPath, childValue)}</div>
            </div>`;
        }

        html += `</div></div>`;
        return html;
    }

    /**
     * Create appropriate input for a value based on its type
     */
    createValueInput(path, value) {
        if (value === null || value === undefined) {
            return this.createTextInput(path, '');
        } else if (typeof value === 'boolean') {
            return this.createBoolInput(path, value);
        } else if (typeof value === 'number') {
            return this.createNumberInput(path, value);
        } else if (typeof value === 'string') {
            return this.createTextInput(path, value);
        } else if (value._type === 'rgb') {
            return this.createColorInput(path, value, 'rgb');
        } else if (value._type === 'hsv') {
            return this.createColorInput(path, value, 'hsv');
        } else if (Array.isArray(value)) {
            return this.createArrayInput(path, value);
        } else if (typeof value === 'object') {
            return this.createNestedInput(path, value);
        }
        return this.createTextInput(path, String(value));
    }

    /**
     * Update a value in the edited item
     */
    updateValue(path, value) {
        this.setNestedValue(this.editedValues, path, value);

        // Mark input as modified
        const input = document.querySelector(`[data-path="${path}"]`);
        if (input) input.classList.add('modified');
    }

    /**
     * Update a color value component
     */
    updateColorValue(path, component, value) {
        const current = this.getNestedValue(this.editedValues, path) || {};
        current[component] = parseFloat(value);
        this.setNestedValue(this.editedValues, path, current);

        // Update preview
        this.updateColorPreview(path);
    }

    updateColorPreview(path) {
        const color = this.getNestedValue(this.editedValues, path);
        if (!color) return;

        const preview = document.querySelector(`[data-path="${path}"]`)?.closest('.editor-property')?.querySelector('.editor-color-preview');
        if (preview && color._type === 'rgb') {
            preview.style.background = `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
        }
    }

    /**
     * Update an array value
     */
    updateArrayValue(path, stringValue) {
        const values = stringValue.split(',').map(v => {
            const trimmed = v.trim();
            // Try to parse as number
            const num = parseFloat(trimmed);
            if (!isNaN(num) && String(num) === trimmed) return num;
            // Try to parse as boolean
            if (trimmed === 'yes' || trimmed === 'true') return true;
            if (trimmed === 'no' || trimmed === 'false') return false;
            return trimmed;
        });
        this.setNestedValue(this.editedValues, path, values);
    }

    /**
     * Delete a property
     */
    deleteProperty(path) {
        if (!confirm(`Delete property "${path}"?`)) return;

        const parts = path.split('.');
        const key = parts.pop();
        const parent = parts.length > 0 ? this.getNestedValue(this.editedValues, parts.join('.')) : this.editedValues;

        if (parent && key in parent) {
            delete parent[key];
            this.renderEditor(this.editedValues);
        }
    }

    /**
     * Add a new property - shows property selector
     */
    addNewProperty() {
        const suggestions = this.getPropertySuggestions();
        this.showPropertySelector(suggestions);
    }

    /**
     * Get property suggestions from other items in the same category
     */
    getPropertySuggestions() {
        const items = this.getItemsForCategory(this.editingCategory);
        const propCounts = new Map(); // property name -> { count, types: Set }
        const currentProps = new Set(Object.keys(this.editedValues).filter(k => !k.startsWith('_')));

        for (const [key, item] of Object.entries(items)) {
            if (key.startsWith('_') || !item || typeof item !== 'object') continue;

            for (const [prop, value] of Object.entries(item)) {
                if (prop.startsWith('_')) continue;
                if (currentProps.has(prop)) continue; // Skip props already in current item

                if (!propCounts.has(prop)) {
                    propCounts.set(prop, { count: 0, types: new Set(), sampleValue: value });
                }
                const info = propCounts.get(prop);
                info.count++;
                info.types.add(this.detectValueType(value));
            }
        }

        // Sort by frequency
        return Array.from(propCounts.entries())
            .map(([name, info]) => ({
                name,
                count: info.count,
                type: this.getMostCommonType(info.types),
                sampleValue: info.sampleValue
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Detect value type for property suggestions
     */
    detectValueType(value) {
        if (value === null || value === undefined) return 'text';
        if (typeof value === 'boolean') return 'bool';
        if (typeof value === 'number') return 'number';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') {
            if (value._type === 'rgb' || value._type === 'hsv') return 'color';
            return 'object';
        }
        return 'text';
    }

    /**
     * Get most common type from a set
     */
    getMostCommonType(types) {
        if (types.size === 1) return types.values().next().value;
        // Prefer more specific types
        if (types.has('bool')) return 'bool';
        if (types.has('number')) return 'number';
        if (types.has('array')) return 'array';
        return 'text';
    }

    /**
     * Show property selector modal
     */
    showPropertySelector(suggestions) {
        // Remove existing selector if any
        let selector = document.getElementById('property-selector');
        if (selector) selector.remove();

        selector = document.createElement('div');
        selector.id = 'property-selector';
        selector.className = 'property-selector-modal';
        selector.innerHTML = `
            <div class="property-selector-content">
                <div class="property-selector-header">
                    <h3>Add Property</h3>
                    <button class="property-selector-close">&times;</button>
                </div>
                <div class="property-selector-custom">
                    <input type="text" id="custom-prop-name" placeholder="Custom property name...">
                    <select id="custom-prop-type">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="bool">Boolean</option>
                        <option value="array">Array</option>
                    </select>
                    <button id="add-custom-prop">Add</button>
                </div>
                ${suggestions.length > 0 ? `
                    <div class="property-selector-divider">Or choose from existing properties:</div>
                    <div class="property-selector-list">
                        ${suggestions.slice(0, 30).map(s => `
                            <button class="property-suggestion" data-name="${s.name}" data-type="${s.type}">
                                <span class="prop-name">${s.name}</span>
                                <span class="prop-meta">${s.type} · ${s.count} items</span>
                            </button>
                        `).join('')}
                    </div>
                ` : '<div class="property-selector-empty">No suggestions available</div>'}
            </div>
        `;

        document.body.appendChild(selector);

        // Event handlers
        selector.querySelector('.property-selector-close').addEventListener('click', () => selector.remove());
        selector.addEventListener('click', (e) => {
            if (e.target === selector) selector.remove();
        });

        // Custom property
        const addCustom = () => {
            const name = document.getElementById('custom-prop-name').value.trim();
            const type = document.getElementById('custom-prop-type').value;
            if (name) {
                this.addPropertyWithType(name, type);
                selector.remove();
            }
        };
        document.getElementById('add-custom-prop').addEventListener('click', addCustom);
        document.getElementById('custom-prop-name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addCustom();
        });

        // Suggestion clicks
        selector.querySelectorAll('.property-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addPropertyWithType(btn.dataset.name, btn.dataset.type);
                selector.remove();
            });
        });

        // Focus input
        setTimeout(() => document.getElementById('custom-prop-name').focus(), 100);
    }

    /**
     * Add property with specific type
     */
    addPropertyWithType(name, type) {
        let defaultValue;
        switch (type) {
            case 'number': defaultValue = 0; break;
            case 'bool': defaultValue = true; break;
            case 'array': defaultValue = []; break;
            case 'object': defaultValue = {}; break;
            default: defaultValue = '';
        }

        this.editedValues[name] = defaultValue;
        this.renderEditor(this.editedValues);
    }

    /**
     * Get nested value from path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((o, k) => o?.[k], obj);
    }

    /**
     * Set nested value from path
     */
    setNestedValue(obj, path, value) {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((o, k) => {
            if (!(k in o)) o[k] = {};
            return o[k];
        }, obj);
        target[last] = value;
    }

    /**
     * Save the edited item
     */
    saveItemEdits() {
        if (!this.editingItem || !this.editingCategory) return;

        // Get original data for comparison
        const originalData = this.items[this.editingCategory]?.[this.editingItem] || {};

        // Track the edit
        if (!this.pendingEdits[this.editingCategory]) {
            this.pendingEdits[this.editingCategory] = {};
        }
        this.pendingEdits[this.editingCategory][this.editingItem] = JSON.parse(JSON.stringify(this.editedValues));

        // Mark item as edited in the current data
        this.editedValues._edited = true;

        // Track change in modLoader for Mod Changes view
        if (this.modLoader.getCurrentMod()) {
            this.modLoader.trackManualEdit(
                this.editingCategory,
                this.editingItem,
                originalData,
                this.editedValues
            );
        }

        // Update the items data
        const items = this.getItemsForCategory(this.editingCategory);
        items[this.editingItem] = this.editedValues;

        // If we have a mod active, also update modItems
        if (this.modLoader.getCurrentMod()) {
            if (!this.modItems[this.editingCategory]) {
                this.modItems[this.editingCategory] = { ...this.items[this.editingCategory] };
            }
            this.modItems[this.editingCategory][this.editingItem] = this.editedValues;
        } else {
            this.items[this.editingCategory][this.editingItem] = this.editedValues;
        }

        // Show save mod button
        document.getElementById('save-mod-btn').style.display = 'inline-block';

        // Refresh display
        this.applyFilters();
        this.renderItems();

        this.hideEditModal();

        // Always update mod changes data (even if not currently viewing)
        this.items['mod_changes'] = this.buildModChangesData();

        // If viewing mod_changes, refresh the display
        if (this.currentCategory === 'mod_changes') {
            this.applyFilters();
            this.renderItems();
        }
    }

    /**
     * Save all pending edits to mod folder
     */
    async saveMod() {
        const pendingCount = Object.values(this.pendingEdits).reduce((sum, cat) => sum + Object.keys(cat).length, 0);

        // Check if a mod is selected
        let currentMod = this.modLoader.getCurrentMod();
        if (!currentMod) {
            // Offer to create a new mod first
            if (confirm('No mod selected. Would you like to create a new mod first?')) {
                this.showNewModModal();
            }
            return;
        }

        // For new in-memory mods, we need to create the folder structure first
        if (currentMod.isNew) {
            if (pendingCount === 0) {
                alert('No changes to save. Edit some items first, then save.');
                return;
            }

            const confirmed = confirm(
                `Save new mod "${currentMod.name}" to disk?\n\n` +
                `IMPORTANT: Select your USER mods folder:\n` +
                `Documents/Paradox Interactive/Europa Universalis V/mod/\n\n` +
                `NOT the game installation folder!\n` +
                `The mod folder will be created inside the location you select.`
            );
            if (!confirmed) return;

            try {
                // Create the mod folder structure
                const creator = new ModCreator();
                const config = {
                    name: currentMod.name,
                    id: currentMod.id,
                    version: currentMod.version,
                    gameVersion: currentMod.supportedVersion,
                    description: currentMod.description,
                    tags: currentMod.tags,
                    folders: ['common'] // Default folders
                };

                const createResult = await creator.createModWithFSA(config);
                if (createResult.cancelled) return;

                // Use the handle returned from mod creation
                if (!createResult.handle) {
                    alert('Could not get write access to mod folder.');
                    return;
                }

                // Store the handle for writing changes
                this.modLoader.setModDirectoryHandle(currentMod.id, createResult.handle);

                // Mark mod as no longer new
                currentMod.isNew = false;
                currentMod.type = 'saved';

                // Update dropdown to remove "(new)" suffix
                const allMods = this.modLoader.getAvailableMods();
                this.populateModSelector(allMods);
                document.getElementById('mod-select').value = currentMod.id;

                // Update folder info
                const folderInfo = document.getElementById('folder-info');
                folderInfo.textContent = `${this.loader.getFolderName()} - Editing: ${currentMod.name}`;

                // Refresh mod info
                currentMod = this.modLoader.getCurrentMod();
            } catch (err) {
                console.error('Failed to create mod folder:', err);
                alert('Failed to create mod folder: ' + err.message);
                return;
            }
        }

        if (pendingCount === 0) {
            alert('No changes to save.');
            return;
        }

        // Ensure we have write access to the mod folder
        if (!currentMod.directoryHandle) {
            alert(`Please select the mod folder "${currentMod.name}" to grant write access.`);
            const handle = await this.modLoader.getModDirectoryHandle();
            if (!handle) {
                alert('Could not get write access to mod folder.');
                return;
            }
            // Refresh mod info with handle
            currentMod = this.modLoader.getCurrentMod();
        }

        try {
            const writer = new ModWriter();
            const result = await writer.writeChanges(currentMod, this.pendingEdits, this.items);

            if (result.success) {
                // Mark edited items as saved (not pending) before clearing
                for (const [category, items] of Object.entries(this.pendingEdits)) {
                    for (const itemKey of Object.keys(items)) {
                        const data = this.getItemsForCategory(category)[itemKey];
                        if (data) {
                            data._modded = true;
                            data._edited = false;
                        }
                    }
                }

                alert(`Saved ${result.filesWritten} file(s) to mod "${currentMod.name}".`);

                // Clear pending edits
                this.pendingEdits = {};
                document.getElementById('save-mod-btn').style.display = 'none';

                // Refresh display
                this.applyFilters();
                this.renderItems();
            } else {
                alert('Failed to save: ' + result.error);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save mod: ' + err.message);
        }
    }

    // ============================================================
    // MOD SELECTION
    // ============================================================

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
            // Scan all categories for mod changes first
            if (this.modLoader.getCurrentMod()) {
                document.getElementById('items-grid').innerHTML = '<div class="loading-state">Scanning for mod changes...</div>';
                await this.scanAllCategoriesForModChanges();
            }
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
                    // Use category-specific extensions or default to .txt
                    const extensions = category.extensions || '.txt';
                    data = await this.loader.readDirectory(category.path, extensions);
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

        // Include changes from loaded mod
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

        // Include pending edits (unsaved changes)
        for (const [category, items] of Object.entries(this.pendingEdits)) {
            for (const [itemKey, editedData] of Object.entries(items)) {
                const key = `${category}:${itemKey}`;
                // Check if this already exists from mod changes
                if (data[key]) {
                    data[key]._edited = true;
                    data[key].modded = editedData;
                } else {
                    const originalData = this.items[category]?.[itemKey] || {};
                    data[key] = {
                        _changeType: 'edit',
                        _category: category,
                        _itemKey: itemKey,
                        _modName: 'Pending Edit',
                        _edited: true,
                        original: originalData,
                        modded: editedData
                    };
                }
            }
        }

        return data;
    }

    /**
     * Scan all categories that have mod files to detect changes
     */
    async scanAllCategoriesForModChanges() {
        // Clear previous scan results (but keep manual edits)
        this.modLoader.clearFileBasedChanges();

        const categories = CategoryRegistry.getAll();

        for (const category of categories) {
            if (!category.path || category.id === 'mod_changes') continue;

            // Check if mod has files for this category
            const modFiles = this.modLoader.getModFilesInDirectory(category.path);
            if (modFiles.length === 0) continue;

            // Load base game data if not already loaded
            if (!this.items[category.id]) {
                try {
                    let data;
                    if (category.specialFile) {
                        data = await this.loader.readFile(category.path + '/' + category.specialFile);
                    } else {
                        data = await this.loader.readDirectory(category.path);
                    }
                    this.items[category.id] = data || {};
                } catch (err) {
                    console.error(`Error loading category ${category.id}:`, err);
                    continue;
                }
            }

            // Load and merge mod data to detect changes
            const modData = await this.loadModDataForCategory(category.id, category);
            if (modData && Object.keys(modData).length > 0) {
                this.modItems[category.id] = this.modLoader.mergeData(
                    this.items[category.id],
                    modData,
                    category.id
                );
            }
        }
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
