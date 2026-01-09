/**
 * Item Card Component for EU5 Inspector
 * Renders game objects as cards with full details
 */

class ItemCard {
    /**
     * Render a single item card
     * @param {string} name - Item name
     * @param {Object} data - Item data
     * @param {string} category - Category type
     * @returns {string} HTML string
     */
    static render(name, data, category) {
        const displayName = name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const color = this.extractColor(data);

        return `
            <div class="item-card" data-name="${name}">
                <div class="card-header">
                    ${color ? `<span class="card-color" style="background-color: ${color}"></span>` : ''}
                    <span class="card-title">${displayName}</span>
                </div>
                <div class="card-content">
                    ${this.renderDetails(data)}
                </div>
            </div>
        `;
    }

    /**
     * Extract color from item data
     * @param {Object} data - Item data
     * @returns {string|null} CSS color string
     */
    static extractColor(data) {
        if (!data || typeof data !== 'object') return null;

        const colorVal = data.color;
        if (!colorVal) return null;

        if (colorVal._type === 'rgb') {
            return `rgb(${Math.round(colorVal.r)}, ${Math.round(colorVal.g)}, ${Math.round(colorVal.b)})`;
        }

        if (colorVal._type === 'hsv') {
            const h = colorVal.h, s = colorVal.s, v = colorVal.v;
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

        return null;
    }

    /**
     * Render full details
     * @param {Object} data - Item data
     * @returns {string} HTML string
     */
    static renderDetails(data) {
        if (!data || typeof data !== 'object') return '';

        const lines = [];
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue;
            lines.push(this.renderProperty(key, value, 0));
        }
        return lines.join('');
    }

    /**
     * Render a single property
     * @param {string} key - Property key
     * @param {*} value - Property value
     * @param {number} depth - Nesting depth
     * @returns {string} HTML string
     */
    static renderProperty(key, value, depth) {
        const indent = depth * 16;
        const formattedKey = this.formatKey(key);

        if (value === null || value === undefined) {
            return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-null">null</span></div>`;
        }

        if (value._type === 'rgb') {
            const color = `rgb(${Math.round(value.r)}, ${Math.round(value.g)}, ${Math.round(value.b)})`;
            return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-color"><span class="color-dot" style="background:${color}"></span>${color}</span></div>`;
        }

        if (value._type === 'hsv') {
            return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-color">hsv(${value.h.toFixed(1)}, ${value.s.toFixed(2)}, ${value.v.toFixed(2)})</span></div>`;
        }

        if (value._type === 'date') {
            return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-date">${value.value}</span></div>`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-empty">[ ]</span></div>`;
            }
            const simple = value.every(v => typeof v !== 'object' || v === null);
            if (simple) {
                const displayVals = value.map(v => this.formatSimpleValue(v)).join(', ');
                return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-array">[ ${displayVals} ]</span></div>`;
            }
            let html = `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-muted">[${value.length} items]</span></div>`;
            value.forEach((item, i) => {
                html += this.renderProperty(`[${i}]`, item, depth + 1);
            });
            return html;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value).filter(k => !k.startsWith('_'));
            if (keys.length === 0) {
                return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-empty">{ }</span></div>`;
            }
            let html = `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = <span class="val-muted">{${keys.length}}</span></div>`;
            for (const k of keys) {
                html += this.renderProperty(k, value[k], depth + 1);
            }
            return html;
        }

        return `<div class="detail-row" style="margin-left: ${indent}px"><span class="detail-key">${formattedKey}</span> = ${this.formatSimpleValue(value)}</div>`;
    }

    /**
     * Format a simple value for display
     * @param {*} value - Value to format
     * @returns {string} HTML string
     */
    static formatSimpleValue(value) {
        if (value === true) return '<span class="val-bool val-yes">yes</span>';
        if (value === false) return '<span class="val-bool val-no">no</span>';
        if (typeof value === 'number') {
            const cls = value < 0 ? 'val-num val-neg' : 'val-num';
            return `<span class="${cls}">${value}</span>`;
        }
        if (typeof value === 'string') {
            // Check if this is a reference to another item
            const ref = this.lookupReference(value);
            if (ref) {
                if (ref.color) {
                    // Color reference with preview
                    return `<span class="ref-with-preview">
                        <span class="color-preview" style="background:${ref.color}"></span>
                        <a class="ref-link val-str" href="#" data-category="${ref.category}" data-item="${this.escapeHtml(value)}">${this.escapeHtml(value)}</a>
                    </span>`;
                } else {
                    // Regular reference
                    return `<a class="ref-link val-str" href="#" data-category="${ref.category}" data-item="${this.escapeHtml(value)}">${this.escapeHtml(value)}</a>`;
                }
            }
            return `<span class="val-str">${this.escapeHtml(value)}</span>`;
        }
        return `<span class="val-other">${String(value)}</span>`;
    }

    /**
     * Look up if a value is a reference to another item
     * @param {string} value - Value to check
     * @returns {Object|null} Reference info or null
     */
    static lookupReference(value) {
        if (!window.eu5App) return null;
        return window.eu5App.lookupReference(value);
    }

    /**
     * Format a key for display
     * @param {string} key - Raw key
     * @returns {string} Formatted key
     */
    static formatKey(key) {
        return key;
    }

    /**
     * Escape HTML
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.ItemCard = ItemCard;
