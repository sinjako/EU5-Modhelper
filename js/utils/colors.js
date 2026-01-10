/**
 * Color utility functions for EU5 Inspector
 */
const ColorUtils = {
    /**
     * Convert HSV to RGB CSS string
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1)
     * @param {number} v - Value (0-1)
     * @returns {string} RGB CSS string
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
        return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
    },

    /**
     * Convert RGB object to CSS string
     * @param {object} rgb - Object with r, g, b properties (0-255)
     * @returns {string} RGB CSS string
     */
    rgbToCss(rgb) {
        return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
    },

    /**
     * Process a Paradox color value to CSS string
     * @param {object} value - Color object with _type property
     * @returns {string|null} RGB CSS string or null if not a color
     */
    processColor(value) {
        if (!value || typeof value !== 'object') return null;

        if (value._type === 'rgb') {
            return this.rgbToCss(value);
        } else if (value._type === 'hsv') {
            return this.hsvToRgb(value.h, value.s, value.v);
        }
        return null;
    }
};

// Export for use in other modules
window.ColorUtils = ColorUtils;
