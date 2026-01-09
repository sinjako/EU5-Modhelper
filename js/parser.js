/**
 * Paradox Script Parser for EU5
 * Parses .txt files in Paradox's proprietary script format
 */

class ParadoxParser {
    constructor() {
        this.pos = 0;
        this.text = '';
        this.length = 0;
    }

    /**
     * Parse a Paradox script string into a JavaScript object
     * @param {string} text - The script content to parse
     * @returns {Object} Parsed object representation
     */
    parse(text) {
        // Remove BOM if present
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        this.text = text;
        this.pos = 0;
        this.length = text.length;

        return this.parseBlock(false);
    }

    /**
     * Skip whitespace and comments
     */
    skipWhitespaceAndComments() {
        while (this.pos < this.length) {
            const char = this.text[this.pos];

            // Skip whitespace
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                this.pos++;
                continue;
            }

            // Skip comments
            if (char === '#') {
                while (this.pos < this.length && this.text[this.pos] !== '\n') {
                    this.pos++;
                }
                continue;
            }

            break;
        }
    }

    /**
     * Read an identifier or value token
     * @returns {string} The token
     */
    readToken() {
        this.skipWhitespaceAndComments();

        if (this.pos >= this.length) {
            return null;
        }

        const char = this.text[this.pos];

        // Handle quoted strings
        if (char === '"') {
            return this.readQuotedString();
        }

        // Handle special single characters
        if (char === '{' || char === '}' || char === '=') {
            this.pos++;
            return char;
        }

        // Handle comparison operators
        if (char === '>' || char === '<' || char === '!') {
            let op = char;
            this.pos++;
            if (this.pos < this.length && this.text[this.pos] === '=') {
                op += '=';
                this.pos++;
            }
            return op;
        }

        // Read regular token (identifier, number, etc.)
        let token = '';
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === ' ' || c === '\t' || c === '\n' || c === '\r' ||
                c === '=' || c === '{' || c === '}' || c === '#' ||
                c === '>' || c === '<') {
                break;
            }
            token += c;
            this.pos++;
        }

        return token || null;
    }

    /**
     * Read a quoted string
     * @returns {string} The string content (without quotes)
     */
    readQuotedString() {
        this.pos++; // Skip opening quote
        let str = '';

        while (this.pos < this.length) {
            const char = this.text[this.pos];

            if (char === '"') {
                this.pos++; // Skip closing quote
                return str;
            }

            if (char === '\\' && this.pos + 1 < this.length) {
                this.pos++;
                str += this.text[this.pos];
            } else {
                str += char;
            }
            this.pos++;
        }

        return str;
    }

    /**
     * Peek at the next token without consuming it
     * @returns {string} The next token
     */
    peekToken() {
        const savedPos = this.pos;
        const token = this.readToken();
        this.pos = savedPos;
        return token;
    }

    /**
     * Parse a block (content within braces or top-level)
     * @param {boolean} inBraces - Whether we're inside braces
     * @returns {Object|Array} Parsed content
     */
    parseBlock(inBraces = true) {
        const result = {};
        const arrayItems = [];
        let isArray = false;
        let hasKeyValue = false;

        while (true) {
            this.skipWhitespaceAndComments();

            if (this.pos >= this.length) {
                break;
            }

            const token = this.readToken();

            if (token === null) {
                break;
            }

            if (token === '}') {
                if (inBraces) {
                    break;
                }
                continue;
            }

            if (token === '{') {
                // Standalone block - treat as array item
                const nested = this.parseBlock(true);
                arrayItems.push(nested);
                isArray = true;
                continue;
            }

            // Check what comes next
            this.skipWhitespaceAndComments();
            const next = this.peekToken();

            if (next === '=' || next === '>' || next === '<' || next === '>=' || next === '<=' || next === '!=') {
                // Key-value pair or comparison
                const operator = this.readToken();
                const value = this.parseValue();

                // Handle duplicate keys by converting to array
                if (result.hasOwnProperty(token)) {
                    if (!Array.isArray(result[token]) || !result[token]._isMultiple) {
                        result[token] = [result[token]];
                        result[token]._isMultiple = true;
                    }
                    result[token].push({ operator, value });
                } else if (operator !== '=') {
                    // Store comparison with operator
                    result[token] = { operator, value };
                } else {
                    result[token] = value;
                }
                hasKeyValue = true;
            } else if (next === '{') {
                // Key followed by block (no =)
                this.readToken(); // consume '{'
                const nested = this.parseBlock(true);

                if (result.hasOwnProperty(token)) {
                    if (!Array.isArray(result[token]) || !result[token]._isMultiple) {
                        result[token] = [result[token]];
                        result[token]._isMultiple = true;
                    }
                    result[token].push(nested);
                } else {
                    result[token] = nested;
                }
                hasKeyValue = true;
            } else {
                // Standalone value - part of a list
                arrayItems.push(this.convertValue(token));
                isArray = true;
            }
        }

        // Determine return type
        if (isArray && !hasKeyValue) {
            return arrayItems;
        } else if (isArray && hasKeyValue) {
            // Mixed content - add array items to result
            if (arrayItems.length > 0) {
                result._items = arrayItems;
            }
            return result;
        }

        return result;
    }

    /**
     * Parse a single value
     * @returns {*} The parsed value
     */
    parseValue() {
        this.skipWhitespaceAndComments();

        const token = this.peekToken();

        if (token === '{') {
            this.readToken(); // consume '{'
            return this.parseBlock(true);
        }

        return this.convertValue(this.readToken());
    }

    /**
     * Convert a string token to appropriate type
     * @param {string} token - The token to convert
     * @returns {*} Converted value
     */
    convertValue(token) {
        if (token === null || token === undefined) {
            return null;
        }

        // Boolean
        if (token === 'yes') return true;
        if (token === 'no') return false;

        // Number (including negative and decimal)
        if (/^-?\d+\.?\d*$/.test(token)) {
            return parseFloat(token);
        }

        // Date format (e.g., 1444.11.11)
        if (/^\d+\.\d+\.\d+$/.test(token)) {
            return { _type: 'date', value: token };
        }

        // RGB color reference
        if (token === 'rgb') {
            return this.parseRgb();
        }

        // HSV color reference
        if (token === 'hsv') {
            return this.parseHsv();
        }

        return token;
    }

    /**
     * Parse RGB color value
     * @returns {Object} RGB color object
     */
    parseRgb() {
        this.skipWhitespaceAndComments();
        const next = this.peekToken();

        if (next === '{') {
            this.readToken(); // consume '{'
            const values = [];

            while (true) {
                this.skipWhitespaceAndComments();
                const token = this.peekToken();

                if (token === '}') {
                    this.readToken();
                    break;
                }

                const val = this.readToken();
                if (val !== null) {
                    values.push(parseFloat(val));
                }
            }

            return {
                _type: 'rgb',
                r: values[0] || 0,
                g: values[1] || 0,
                b: values[2] || 0
            };
        }

        return { _type: 'rgb', r: 0, g: 0, b: 0 };
    }

    /**
     * Parse HSV color value
     * @returns {Object} HSV color object
     */
    parseHsv() {
        this.skipWhitespaceAndComments();
        const next = this.peekToken();

        if (next === '{') {
            this.readToken(); // consume '{'
            const values = [];

            while (true) {
                this.skipWhitespaceAndComments();
                const token = this.peekToken();

                if (token === '}') {
                    this.readToken();
                    break;
                }

                const val = this.readToken();
                if (val !== null) {
                    values.push(parseFloat(val));
                }
            }

            return {
                _type: 'hsv',
                h: values[0] || 0,
                s: values[1] || 0,
                v: values[2] || 0
            };
        }

        return { _type: 'hsv', h: 0, s: 0, v: 0 };
    }
}

// Export for use in other modules
window.ParadoxParser = ParadoxParser;
