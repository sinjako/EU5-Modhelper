/**
 * Mod Changes Handler for EU5 ModHelper
 * Displays changes made by the currently selected mod
 */
class ModChangesHandler extends BaseHandler {
    getCategoryId() {
        return 'mod_changes';
    }

    getFilterConfig() {
        return [
            { key: '_changeType', name: 'Change Type' },
            { key: '_category', name: 'Category' }
        ];
    }

    /**
     * Build filter groups from mod changes data
     */
    buildFilterGroups(items) {
        const groups = [];
        const changeTypes = new Set();
        const categories = new Set();

        for (const [key, item] of Object.entries(items)) {
            if (key.startsWith('_')) continue;
            if (item._changeType) changeTypes.add(item._changeType);
            if (item._category) categories.add(item._category);
        }

        if (changeTypes.size > 0) {
            groups.push({
                key: '_changeType',
                name: 'Change Type',
                values: Array.from(changeTypes).sort().map(v => ({
                    value: v,
                    label: this.formatChangeType(v)
                }))
            });
        }

        if (categories.size > 0) {
            groups.push({
                key: '_category',
                name: 'Category',
                values: Array.from(categories).sort().map(v => ({
                    value: v,
                    label: this.formatName(v)
                }))
            });
        }

        return groups;
    }

    /**
     * Format change type for display
     */
    formatChangeType(type) {
        const types = {
            'add': 'Added',
            'modify': 'Modified',
            'replace': 'Replaced',
            'inject': 'Injected'
        };
        return types[type] || type;
    }

    /**
     * Render mod changes view
     */
    render(container, items, keys) {
        const currentMod = this.app.modLoader.getCurrentMod();

        if (!currentMod) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" width="64" height="64">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <h2>No Mod Selected</h2>
                    <p>Select a mod from the dropdown above to see its changes.</p>
                </div>
            `;
            return;
        }

        if (keys.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>No Changes Detected</h2>
                    <p>The selected mod doesn't appear to modify any loaded categories.</p>
                    <p class="hint">Try browsing other categories to detect mod changes.</p>
                </div>
            `;
            return;
        }

        // Group changes by category
        const byCategory = {};
        for (const key of keys) {
            const item = items[key];
            const cat = item._category || 'unknown';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push({ key, ...item });
        }

        let html = `
            <div class="mod-changes-summary">
                <div class="mod-info">
                    <span class="mod-name">${currentMod.name}</span>
                    <span class="mod-version">v${currentMod.version}</span>
                </div>
                <div class="change-stats">
                    <span class="stat stat-add">${this.countByType(items, 'add')} added</span>
                    <span class="stat stat-modify">${this.countByType(items, 'modify')} modified</span>
                    <span class="stat stat-replace">${this.countByType(items, 'replace')} replaced</span>
                </div>
            </div>
        `;

        for (const [category, changes] of Object.entries(byCategory)) {
            html += `
                <div class="mod-changes-category">
                    <h3 class="category-title">${this.formatName(category)}</h3>
                    <div class="changes-list">
                        ${changes.map(change => this.renderChange(change)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Count changes by type
     */
    countByType(items, type) {
        return Object.values(items).filter(i => i._changeType === type).length;
    }

    /**
     * Render a single change item
     */
    renderChange(change) {
        const typeClass = `change-${change._changeType}`;
        const typeLabel = this.formatChangeType(change._changeType);

        return `
            <div class="change-item ${typeClass}" data-category="${change._category}" data-item-key="${change._itemKey}">
                <div class="change-header">
                    <span class="change-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="change-key">${this.formatName(change._itemKey)}</span>
                </div>
                ${change._changeType !== 'add' ?
                    this.renderPropertyDiff(change.original, change.modded) :
                    this.renderNewContent(change.modded)
                }
            </div>
        `;
    }

    /**
     * Render a property-by-property diff between original and modded
     */
    renderPropertyDiff(original, modded) {
        if (!original || typeof original !== 'object' || !modded || typeof modded !== 'object') {
            return `
                <div class="change-diff-simple">
                    <div class="diff-line diff-removed">- ${this.renderSimpleValue(original)}</div>
                    <div class="diff-line diff-added">+ ${this.renderSimpleValue(modded)}</div>
                </div>
            `;
        }

        const allKeys = new Set([
            ...Object.keys(original).filter(k => !k.startsWith('_')),
            ...Object.keys(modded).filter(k => !k.startsWith('_'))
        ]);

        let html = '<div class="change-diff-detailed">';

        for (const key of allKeys) {
            const origVal = original[key];
            const modVal = modded[key];
            const origExists = key in original;
            const modExists = key in modded;

            if (!origExists && modExists) {
                // Property added
                html += `
                    <div class="diff-line diff-added">
                        <span class="diff-marker">+</span>
                        <span class="diff-key">${key}</span>
                        <span class="diff-equals">=</span>
                        <span class="diff-value">${this.renderSimpleValue(modVal)}</span>
                    </div>
                `;
            } else if (origExists && !modExists) {
                // Property removed
                html += `
                    <div class="diff-line diff-removed">
                        <span class="diff-marker">-</span>
                        <span class="diff-key">${key}</span>
                        <span class="diff-equals">=</span>
                        <span class="diff-value">${this.renderSimpleValue(origVal)}</span>
                    </div>
                `;
            } else if (!this.valuesEqual(origVal, modVal)) {
                // Property changed
                html += `
                    <div class="diff-line diff-removed">
                        <span class="diff-marker">-</span>
                        <span class="diff-key">${key}</span>
                        <span class="diff-equals">=</span>
                        <span class="diff-value">${this.renderSimpleValue(origVal)}</span>
                    </div>
                    <div class="diff-line diff-added">
                        <span class="diff-marker">+</span>
                        <span class="diff-key">${key}</span>
                        <span class="diff-equals">=</span>
                        <span class="diff-value">${this.renderSimpleValue(modVal)}</span>
                    </div>
                `;
            }
            // If values are equal, don't show them (no change)
        }

        html += '</div>';
        return html;
    }

    /**
     * Render new content (for added items)
     */
    renderNewContent(modded) {
        if (!modded || typeof modded !== 'object') {
            return `<div class="diff-line diff-added">+ ${this.renderSimpleValue(modded)}</div>`;
        }

        let html = '<div class="change-diff-detailed">';
        const keys = Object.keys(modded).filter(k => !k.startsWith('_'));

        for (const key of keys) {
            html += `
                <div class="diff-line diff-added">
                    <span class="diff-marker">+</span>
                    <span class="diff-key">${key}</span>
                    <span class="diff-equals">=</span>
                    <span class="diff-value">${this.renderSimpleValue(modded[key])}</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    /**
     * Check if two values are equal (ignoring _ properties)
     */
    valuesEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (typeof a !== 'object' || a === null || b === null) return a === b;

        const keysA = Object.keys(a).filter(k => !k.startsWith('_'));
        const keysB = Object.keys(b).filter(k => !k.startsWith('_'));

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!this.valuesEqual(a[key], b[key])) return false;
        }
        return true;
    }

    /**
     * Render a simple value for diff display
     */
    renderSimpleValue(value) {
        if (value === null || value === undefined) {
            return '<span class="val-null">null</span>';
        }
        if (typeof value === 'boolean') {
            return `<span class="val-bool val-${value ? 'yes' : 'no'}">${value ? 'yes' : 'no'}</span>`;
        }
        if (typeof value === 'number') {
            return `<span class="val-num">${value}</span>`;
        }
        if (typeof value === 'string') {
            return `<span class="val-str">"${this.escapeHtml(value)}"</span>`;
        }
        if (Array.isArray(value)) {
            const items = value.slice(0, 5).map(v => this.renderSimpleValue(v)).join(', ');
            const more = value.length > 5 ? ', ...' : '';
            return `<span class="val-array">[${items}${more}]</span>`;
        }
        if (typeof value === 'object') {
            if (value._type === 'rgb') {
                return `<span class="val-color">rgb(${value.r}, ${value.g}, ${value.b})</span>`;
            }
            if (value._type === 'hsv') {
                return `<span class="val-color">hsv(${value.h}, ${value.s}, ${value.v})</span>`;
            }
            const keys = Object.keys(value).filter(k => !k.startsWith('_'));
            return `<span class="val-obj">{${keys.length} props}</span>`;
        }
        return this.escapeHtml(String(value));
    }

    /**
     * Escape HTML
     */
    escapeHtml(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;');
    }

    /**
     * Format a key/name for display
     */
    formatName(name) {
        if (!name) return '';
        return String(name)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Setup click handlers after render
     */
    afterRender(container) {
        // Add click handlers to change items
        container.querySelectorAll('.change-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const categoryId = item.dataset.category;
                const itemKey = item.dataset.itemKey;

                if (categoryId && itemKey) {
                    // Navigate to the category and select the item
                    this.app.selectCategory(categoryId);
                    setTimeout(() => {
                        // Try to find and click the item card
                        const card = document.querySelector(`.item-card[data-key="${itemKey}"]`);
                        if (card) {
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            card.click();
                        }
                    }, 300);
                }
            });
        });
    }

}

window.ModChangesHandler = ModChangesHandler;
