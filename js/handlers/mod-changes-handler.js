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
            <div class="change-item ${typeClass}">
                <div class="change-header">
                    <span class="change-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="change-key">${this.formatName(change._itemKey)}</span>
                </div>
                ${change._changeType !== 'add' ? `
                    <div class="change-diff">
                        <div class="diff-section diff-original">
                            <span class="diff-label">Original:</span>
                            <div class="diff-content">${this.renderValue(change.original)}</div>
                        </div>
                        <div class="diff-section diff-modded">
                            <span class="diff-label">Modded:</span>
                            <div class="diff-content">${this.renderValue(change.modded)}</div>
                        </div>
                    </div>
                ` : `
                    <div class="change-new">
                        <span class="diff-label">New Content:</span>
                        <div class="diff-content">${this.renderValue(change.modded)}</div>
                    </div>
                `}
            </div>
        `;
    }

    /**
     * Render a value for display
     */
    renderValue(value) {
        if (value === null || value === undefined) {
            return '<span class="val-null">null</span>';
        }

        if (typeof value === 'object') {
            // Simplified object display
            const keys = Object.keys(value).filter(k => !k.startsWith('_')).slice(0, 5);
            if (keys.length === 0) return '<span class="val-empty">{}</span>';

            const preview = keys.map(k => {
                const v = value[k];
                const vStr = typeof v === 'object' ? '{...}' : String(v).substring(0, 30);
                return `<span class="prop-key">${k}</span>: <span class="prop-val">${this.escapeHtml(vStr)}</span>`;
            }).join(', ');

            const more = Object.keys(value).filter(k => !k.startsWith('_')).length > 5 ? ', ...' : '';
            return `{ ${preview}${more} }`;
        }

        return `<span class="val-primitive">${this.escapeHtml(String(value))}</span>`;
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
}

window.ModChangesHandler = ModChangesHandler;
