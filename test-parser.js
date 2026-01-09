#!/usr/bin/env node
/**
 * CLI test script for EU5 Parser
 * Usage: node test-parser.js [path-to-eu5-folder] [category] [options]
 */

const fs = require('fs');
const path = require('path');

// Copy of ParadoxParser for Node.js
class ParadoxParser {
    constructor() {
        this.pos = 0;
        this.text = '';
        this.length = 0;
    }

    parse(text) {
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }
        this.text = text;
        this.pos = 0;
        this.length = text.length;
        return this.parseBlock(false);
    }

    skipWhitespaceAndComments() {
        while (this.pos < this.length) {
            const char = this.text[this.pos];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                this.pos++;
                continue;
            }
            if (char === '#') {
                while (this.pos < this.length && this.text[this.pos] !== '\n') {
                    this.pos++;
                }
                continue;
            }
            break;
        }
    }

    readToken() {
        this.skipWhitespaceAndComments();
        if (this.pos >= this.length) return null;

        const char = this.text[this.pos];

        if (char === '"') return this.readQuotedString();
        if (char === '{' || char === '}' || char === '=') {
            this.pos++;
            return char;
        }
        if (char === '>' || char === '<' || char === '!') {
            let op = char;
            this.pos++;
            if (this.pos < this.length && this.text[this.pos] === '=') {
                op += '=';
                this.pos++;
            }
            return op;
        }

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

    readQuotedString() {
        this.pos++;
        let str = '';
        while (this.pos < this.length) {
            const char = this.text[this.pos];
            if (char === '"') {
                this.pos++;
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

    peekToken() {
        const savedPos = this.pos;
        const token = this.readToken();
        this.pos = savedPos;
        return token;
    }

    parseBlock(inBraces = true) {
        const result = {};
        const arrayItems = [];
        let isArray = false;
        let hasKeyValue = false;

        while (true) {
            this.skipWhitespaceAndComments();
            if (this.pos >= this.length) break;

            const token = this.readToken();
            if (token === null) break;
            if (token === '}') {
                if (inBraces) break;
                continue;
            }
            if (token === '{') {
                const nested = this.parseBlock(true);
                arrayItems.push(nested);
                isArray = true;
                continue;
            }

            this.skipWhitespaceAndComments();
            const next = this.peekToken();

            if (next === '=' || next === '>' || next === '<' || next === '>=' || next === '<=' || next === '!=') {
                const operator = this.readToken();
                const value = this.parseValue();

                if (result.hasOwnProperty(token)) {
                    if (!Array.isArray(result[token]) || !result[token]._isMultiple) {
                        result[token] = [result[token]];
                        result[token]._isMultiple = true;
                    }
                    result[token].push({ operator, value });
                } else if (operator !== '=') {
                    result[token] = { operator, value };
                } else {
                    result[token] = value;
                }
                hasKeyValue = true;
            } else if (next === '{') {
                this.readToken();
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
                arrayItems.push(this.convertValue(token));
                isArray = true;
            }
        }

        if (isArray && !hasKeyValue) {
            return arrayItems;
        } else if (isArray && hasKeyValue) {
            if (arrayItems.length > 0) {
                result._items = arrayItems;
            }
            return result;
        }
        return result;
    }

    parseValue() {
        this.skipWhitespaceAndComments();
        const token = this.peekToken();
        if (token === '{') {
            this.readToken();
            return this.parseBlock(true);
        }
        return this.convertValue(this.readToken());
    }

    convertValue(token) {
        if (token === null || token === undefined) return null;
        if (token === 'yes') return true;
        if (token === 'no') return false;
        if (/^-?\d+\.?\d*$/.test(token)) return parseFloat(token);
        if (/^\d+\.\d+\.\d+$/.test(token)) return { _type: 'date', value: token };
        if (token === 'rgb') return this.parseRgb();
        if (token === 'hsv') return this.parseHsv();
        return token;
    }

    parseRgb() {
        this.skipWhitespaceAndComments();
        if (this.peekToken() === '{') {
            this.readToken();
            const values = [];
            while (true) {
                this.skipWhitespaceAndComments();
                if (this.peekToken() === '}') { this.readToken(); break; }
                const val = this.readToken();
                if (val !== null) values.push(parseFloat(val));
            }
            return { _type: 'rgb', r: values[0] || 0, g: values[1] || 0, b: values[2] || 0 };
        }
        return { _type: 'rgb', r: 0, g: 0, b: 0 };
    }

    parseHsv() {
        this.skipWhitespaceAndComments();
        if (this.peekToken() === '{') {
            this.readToken();
            const values = [];
            while (true) {
                this.skipWhitespaceAndComments();
                if (this.peekToken() === '}') { this.readToken(); break; }
                const val = this.readToken();
                if (val !== null) values.push(parseFloat(val));
            }
            return { _type: 'hsv', h: values[0] || 0, s: values[1] || 0, v: values[2] || 0 };
        }
        return { _type: 'hsv', h: 0, s: 0, v: 0 };
    }
}

// Category paths
const CATEGORIES = {
    advances: 'game/in_game/common/advances',
    religions: 'game/in_game/common/religions',
    cultures: 'game/in_game/common/cultures',
    buildings: 'game/in_game/common/building_types',
    goods: 'game/in_game/common/goods',
    traits: 'game/in_game/common/traits',
    laws: 'game/in_game/common/laws',
    governments: 'game/in_game/common/government_types',
    units: 'game/in_game/common/unit_types',
    institutions: 'game/in_game/common/institution',
};

// Read all .txt files from a directory
function readDirectory(basePath, relPath) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`Directory not found: ${fullPath}`);
        return {};
    }

    const parser = new ParadoxParser();
    const combined = {};
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.txt'));

    for (const file of files) {
        try {
            const text = fs.readFileSync(path.join(fullPath, file), 'utf-8');
            const parsed = parser.parse(text);

            for (const [key, value] of Object.entries(parsed)) {
                if (key.startsWith('_')) continue;
                if (typeof value === 'object' && value !== null) {
                    value._sourceFile = file;
                }
                combined[key] = value;
            }
        } catch (err) {
            console.error(`Error reading ${file}:`, err.message);
        }
    }

    return combined;
}

// Extract requirements from an advance
function extractRequirements(item) {
    const reqs = [];
    if (!item || typeof item !== 'object') return reqs;

    if (item.requires) {
        if (typeof item.requires === 'string') {
            reqs.push(item.requires);
        } else if (Array.isArray(item.requires)) {
            reqs.push(...item.requires.filter(r => typeof r === 'string'));
        }
    }
    return [...new Set(reqs)];
}

// Main
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
EU5 Parser Test Script

Usage: node test-parser.js <eu5-folder> [category] [options]

Categories: ${Object.keys(CATEGORIES).join(', ')}

Options:
  --sample N     Show N sample items (default: 10)
  --json         Output as JSON
  --deps         Show dependency analysis (for advances)
  --find NAME    Find specific item by name
  --raw          Show raw parsed data

Examples:
  node test-parser.js "C:\\Games\\EU5" advances --deps
  node test-parser.js "C:\\Games\\EU5" advances --find written_alphabet
  node test-parser.js "C:\\Games\\EU5" religions --sample 5
`);
        return;
    }

    const eu5Path = args[0];
    const category = args[1] || 'advances';
    const sampleCount = args.includes('--sample') ? parseInt(args[args.indexOf('--sample') + 1]) || 10 : 10;
    const asJson = args.includes('--json');
    const showDeps = args.includes('--deps');
    const showRaw = args.includes('--raw');
    const findName = args.includes('--find') ? args[args.indexOf('--find') + 1] : null;

    if (!CATEGORIES[category]) {
        console.error(`Unknown category: ${category}`);
        console.log(`Available: ${Object.keys(CATEGORIES).join(', ')}`);
        return;
    }

    console.log(`\nLoading ${category} from: ${eu5Path}`);
    console.log(`Path: ${CATEGORIES[category]}\n`);

    const data = readDirectory(eu5Path, CATEGORIES[category]);
    const keys = Object.keys(data).filter(k => !k.startsWith('_'));

    console.log(`Loaded ${keys.length} items\n`);

    // Find specific item
    if (findName) {
        const item = data[findName];
        if (item) {
            console.log(`=== ${findName} ===`);
            console.log(JSON.stringify(item, null, 2));
        } else {
            console.log(`Item not found: ${findName}`);
            const matches = keys.filter(k => k.includes(findName));
            if (matches.length > 0) {
                console.log(`\nDid you mean: ${matches.slice(0, 10).join(', ')}`);
            }
        }
        return;
    }

    // Raw JSON output
    if (asJson) {
        console.log(JSON.stringify(data, null, 2));
        return;
    }

    // Dependency analysis for advances
    if (showDeps && category === 'advances') {
        console.log('=== DEPENDENCY ANALYSIS ===\n');

        const advances = {};
        for (const key of keys) {
            const item = data[key];
            advances[key] = {
                age: item.age || 'unknown',
                depth: item.depth,
                requires: extractRequirements(item),
                icon: item.icon,
            };
        }

        // Count by age
        const byAge = {};
        for (const [key, adv] of Object.entries(advances)) {
            const age = adv.age;
            if (!byAge[age]) byAge[age] = { total: 0, roots: 0, withDeps: 0 };
            byAge[age].total++;
            if (adv.depth === 0) byAge[age].roots++;
            if (adv.requires.length > 0) byAge[age].withDeps++;
        }

        console.log('By Age:');
        for (const [age, stats] of Object.entries(byAge).sort()) {
            console.log(`  ${age}: ${stats.total} total, ${stats.roots} roots (depth=0), ${stats.withDeps} with requires`);
        }

        // Show some dependency chains
        console.log('\nSample dependency chains:');
        const roots = Object.entries(advances).filter(([k, v]) => v.depth === 0).slice(0, 3);
        for (const [rootKey, rootAdv] of roots) {
            console.log(`\n  ${rootKey} (${rootAdv.age})`);
            const children = Object.entries(advances)
                .filter(([k, v]) => v.requires.includes(rootKey))
                .slice(0, 3);
            for (const [childKey, childAdv] of children) {
                console.log(`    └── ${childKey}`);
                const grandchildren = Object.entries(advances)
                    .filter(([k, v]) => v.requires.includes(childKey))
                    .slice(0, 2);
                for (const [gcKey] of grandchildren) {
                    console.log(`        └── ${gcKey}`);
                }
            }
        }
        return;
    }

    // Show sample items
    console.log(`=== SAMPLE (first ${sampleCount}) ===\n`);
    const sample = keys.slice(0, sampleCount);

    for (const key of sample) {
        const item = data[key];
        console.log(`--- ${key} ---`);

        if (showRaw) {
            console.log(JSON.stringify(item, null, 2));
        } else {
            // Show key fields
            const fields = ['age', 'depth', 'requires', 'icon', 'group', 'category', 'type', 'color'];
            for (const field of fields) {
                if (item[field] !== undefined) {
                    const val = typeof item[field] === 'object'
                        ? JSON.stringify(item[field])
                        : item[field];
                    console.log(`  ${field}: ${val}`);
                }
            }
        }
        console.log();
    }
}

main();
