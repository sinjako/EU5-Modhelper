/**
 * Detail View Component for EU5 Inspector
 * Displays parsed game object data in a readable format
 */

class DetailView {
    constructor(container) {
        this.container = container;
        this.currentData = null;
        this.expandedPaths = new Set();
    }

    /**
     * Show object details
     * @param {string} category - Category name
     * @param {string} name - Object name
     * @param {Object} data - Object data
     */
    show(category, name, data) {
        this.currentData = { category, name, data };
        this.render();
    }

    /**
     * Show welcome/empty state
     */
    showEmpty() {
        this.container.innerHTML = `
            <div class="detail-empty">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" width="64" height="64">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </div>
                <h2>Select an item to view</h2>
                <p>Choose a category from the sidebar, then select an item to see its details.</p>
            </div>
        `;
    }

    /**
     * Render the detail view
     */
    render() {
        if (!this.currentData) {
            this.showEmpty();
            return;
        }

        const { category, name, data } = this.currentData;

        this.container.innerHTML = `
            <div class="detail-header">
                <span class="detail-category">${this.formatName(category)}</span>
                <h1 class="detail-title">${this.formatName(name)}</h1>
            </div>
            <div class="detail-content">
                ${this.renderObject(data, '')}
            </div>
        `;

        // Add expand/collapse handlers
        this.container.querySelectorAll('.prop-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const path = toggle.dataset.path;
                const content = toggle.closest('.prop-block').querySelector('.prop-content');

                if (this.expandedPaths.has(path)) {
                    this.expandedPaths.delete(path);
                    content.classList.add('collapsed');
                    toggle.textContent = '+';
                } else {
                    this.expandedPaths.add(path);
                    content.classList.remove('collapsed');
                    toggle.textContent = '-';
                }
            });
        });
    }

    /**
     * Render an object recursively
     * @param {*} obj - Object to render
     * @param {string} path - Current path for tracking expansion
     * @returns {string} HTML string
     */
    renderObject(obj, path) {
        if (obj === null || obj === undefined) {
            return '<span class="value-null">null</span>';
        }

        // Handle special types
        if (obj._type === 'rgb') {
            return this.renderColor(obj);
        }

        if (obj._type === 'hsv') {
            return this.renderHsvColor(obj);
        }

        if (obj._type === 'date') {
            return `<span class="value-date">${obj.value}</span>`;
        }

        // Handle comparison objects
        if (obj.operator && obj.value !== undefined) {
            return `<span class="value-comparison">${obj.operator} ${this.renderValue(obj.value)}</span>`;
        }

        // Handle arrays
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '<span class="value-empty">[]</span>';
            }

            // Check if simple array (primitives only)
            const isSimple = obj.every(item =>
                typeof item !== 'object' || item === null
            );

            if (isSimple && obj.length <= 10) {
                return `<span class="value-array">${obj.map(v => this.renderValue(v)).join(' ')}</span>`;
            }

            const isExpanded = this.expandedPaths.has(path);
            return `
                <div class="prop-block">
                    <span class="prop-toggle" data-path="${path}">${isExpanded ? '-' : '+'}</span>
                    <span class="prop-count">[${obj.length} items]</span>
                    <div class="prop-content ${isExpanded ? '' : 'collapsed'}">
                        ${obj.map((item, i) => `
                            <div class="prop-item">
                                <span class="prop-index">${i}:</span>
                                ${this.renderObject(item, `${path}[${i}]`)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Handle objects
        if (typeof obj === 'object') {
            const keys = Object.keys(obj).filter(k => !k.startsWith('_'));

            if (keys.length === 0) {
                return '<span class="value-empty">{}</span>';
            }

            const isExpanded = this.expandedPaths.has(path) || path === '';
            const toggleDisplay = path === '' ? 'none' : 'inline';

            return `
                <div class="prop-block">
                    <span class="prop-toggle" data-path="${path}" style="display: ${toggleDisplay}">${isExpanded ? '-' : '+'}</span>
                    ${path !== '' ? `<span class="prop-count">{${keys.length} properties}</span>` : ''}
                    <div class="prop-content ${isExpanded ? '' : 'collapsed'}">
                        ${keys.map(key => `
                            <div class="prop-row">
                                <span class="prop-key">${this.formatKey(key)}</span>
                                <span class="prop-equals">=</span>
                                <span class="prop-value">${this.renderObject(obj[key], `${path}.${key}`)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return this.renderValue(obj);
    }

    /**
     * Render a primitive value
     * @param {*} value - Value to render
     * @returns {string} HTML string
     */
    renderValue(value) {
        if (value === true) {
            return '<span class="value-bool value-yes">yes</span>';
        }
        if (value === false) {
            return '<span class="value-bool value-no">no</span>';
        }
        if (typeof value === 'number') {
            const className = value < 0 ? 'value-number value-negative' : 'value-number';
            return `<span class="${className}">${value}</span>`;
        }
        if (typeof value === 'string') {
            // Check if it's a color reference
            if (value.startsWith('color_') || value.startsWith('map_')) {
                return `<span class="value-color-ref">${value}</span>`;
            }
            return `<span class="value-string">${this.escapeHtml(value)}</span>`;
        }
        return `<span class="value-other">${String(value)}</span>`;
    }

    /**
     * Render RGB color with preview
     * @param {Object} color - RGB color object
     * @returns {string} HTML string
     */
    renderColor(color) {
        const r = Math.round(color.r);
        const g = Math.round(color.g);
        const b = Math.round(color.b);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        return `
            <span class="value-color">
                <span class="color-swatch" style="background-color: rgb(${r}, ${g}, ${b})"></span>
                <span class="color-values">rgb(${r}, ${g}, ${b})</span>
                <span class="color-hex">${hex}</span>
            </span>
        `;
    }

    /**
     * Render HSV color with preview
     * @param {Object} color - HSV color object
     * @returns {string} HTML string
     */
    renderHsvColor(color) {
        // Convert HSV to RGB for preview
        const h = color.h;
        const s = color.s;
        const v = color.v;

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

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `
            <span class="value-color">
                <span class="color-swatch" style="background-color: rgb(${r}, ${g}, ${b})"></span>
                <span class="color-values">hsv(${color.h.toFixed(1)}, ${color.s.toFixed(2)}, ${color.v.toFixed(2)})</span>
            </span>
        `;
    }

    /**
     * Format a property key for display
     * @param {string} key - Raw key name
     * @returns {string} Formatted key
     */
    formatKey(key) {
        return key;
    }

    /**
     * Format a name for display
     * @param {string} name - Raw name
     * @returns {string} Formatted name
     */
    formatName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
window.DetailView = DetailView;
