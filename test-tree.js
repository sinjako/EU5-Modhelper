#!/usr/bin/env node
/**
 * EU5 Inspector - Tech Tree Test Script
 * Tests tree building and visualization logic
 * Filters out country-specific (potential) advances
 * Run: node test-tree.js "C:\Program Files (x86)\Steam\steamapps\common\Europa Universalis V"
 */

const fs = require('fs');
const path = require('path');

// === PARSER ===
class ParadoxParser {
    constructor() { this.pos = 0; this.text = ''; this.length = 0; }
    parse(text) {
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        this.text = text; this.pos = 0; this.length = text.length;
        return this.parseBlock(false);
    }
    skipWhitespaceAndComments() {
        while (this.pos < this.length) {
            const char = this.text[this.pos];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r') { this.pos++; continue; }
            if (char === '#') { while (this.pos < this.length && this.text[this.pos] !== '\n') this.pos++; continue; }
            break;
        }
    }
    readToken() {
        this.skipWhitespaceAndComments();
        if (this.pos >= this.length) return null;
        const char = this.text[this.pos];
        if (char === '"') return this.readQuotedString();
        if (char === '{' || char === '}' || char === '=') { this.pos++; return char; }
        if (char === '>' || char === '<' || char === '!') {
            let op = char; this.pos++;
            if (this.pos < this.length && this.text[this.pos] === '=') { op += '='; this.pos++; }
            return op;
        }
        let token = '';
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '=' || c === '{' || c === '}' || c === '#' || c === '>' || c === '<') break;
            token += c; this.pos++;
        }
        return token || null;
    }
    readQuotedString() { this.pos++; let str = ''; while (this.pos < this.length) { const char = this.text[this.pos]; if (char === '"') { this.pos++; return str; } if (char === '\\' && this.pos + 1 < this.length) { this.pos++; str += this.text[this.pos]; } else str += char; this.pos++; } return str; }
    peekToken() { const saved = this.pos; const t = this.readToken(); this.pos = saved; return t; }
    parseBlock(inBraces = true) {
        const result = {}; const arrayItems = []; let isArray = false; let hasKeyValue = false;
        while (true) {
            this.skipWhitespaceAndComments(); if (this.pos >= this.length) break;
            const token = this.readToken(); if (token === null) break;
            if (token === '}') { if (inBraces) break; continue; }
            if (token === '{') { arrayItems.push(this.parseBlock(true)); isArray = true; continue; }
            this.skipWhitespaceAndComments(); const next = this.peekToken();
            if (next === '=' || next === '>' || next === '<' || next === '>=' || next === '<=' || next === '!=') {
                const op = this.readToken(); const value = this.parseValue();
                if (result.hasOwnProperty(token)) { if (!Array.isArray(result[token])) { result[token] = [result[token]]; } result[token].push(value); }
                else if (op !== '=') { result[token] = { operator: op, value }; }
                else result[token] = value;
                hasKeyValue = true;
            } else if (next === '{') { this.readToken(); const nested = this.parseBlock(true);
                if (result.hasOwnProperty(token)) { if (!Array.isArray(result[token])) { result[token] = [result[token]]; } result[token].push(nested); }
                else result[token] = nested;
                hasKeyValue = true;
            } else { arrayItems.push(token); isArray = true; }
        }
        if (isArray && !hasKeyValue) return arrayItems;
        if (isArray && hasKeyValue) { if (arrayItems.length > 0) result._items = arrayItems; return result; }
        return result;
    }
    parseValue() { this.skipWhitespaceAndComments(); if (this.peekToken() === '{') { this.readToken(); return this.parseBlock(true); } const t = this.readToken(); if (t === 'yes') return true; if (t === 'no') return false; if (/^-?\d+\.?\d*$/.test(t)) return parseFloat(t); return t; }
}

// Extract requirements from advance
function extractRequirements(item) {
    const reqs = [];
    if (item.requires) {
        if (typeof item.requires === 'string') reqs.push(item.requires);
        else if (Array.isArray(item.requires)) reqs.push(...item.requires.filter(r => typeof r === 'string'));
    }
    return reqs;
}

// Build tech tree (FILTERS OUT potential advances)
function buildTechTreeData(items) {
    const keys = Object.keys(items).filter(k => !k.startsWith('_'));
    const advances = {};

    // First pass: create nodes, FILTER OUT potential advances
    for (const key of keys) {
        const item = items[key];
        if (item.potential) continue; // Skip country-specific

        const era = item.age || 'other';
        const isRoot = item.depth === 0 || item.depth === '0';

        advances[key] = {
            name: key,
            data: item,
            requires: extractRequirements(item),
            unlockedBy: [],
            treeDepth: 0,
            era: era,
            isRoot: isRoot
        };
    }

    // Second pass: build reverse dependencies
    for (const [key, advance] of Object.entries(advances)) {
        for (const req of advance.requires) {
            if (advances[req]) advances[req].unlockedBy.push(key);
        }
    }

    // Find roots
    const roots = [];
    for (const [key, advance] of Object.entries(advances)) {
        const internalReqs = advance.requires.filter(r => advances[r]);
        if (advance.isRoot || internalReqs.length === 0) {
            roots.push(key);
            advances[key].treeDepth = 0;
        }
    }

    // BFS for depths
    const queue = [...roots];
    const visited = new Set(roots);
    while (queue.length > 0) {
        const current = queue.shift();
        const currentDepth = advances[current].treeDepth;
        for (const child of advances[current].unlockedBy) {
            if (!visited.has(child)) {
                visited.add(child);
                advances[child].treeDepth = currentDepth + 1;
                queue.push(child);
            }
        }
    }

    return advances;
}

// Render tree as ASCII
function renderTreeAscii(node, advances, currentKeys, prefix = '', isLast = true, isRoot = false) {
    const connector = isRoot ? '' : (isLast ? '└── ' : '├── ');
    const name = node.name.replace(/_/g, ' ');
    let output = prefix + connector + name + '\n';

    const children = (node.unlockedBy || [])
        .filter(k => currentKeys.has(k))
        .map(k => advances[k])
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    const newPrefix = isRoot ? '' : (prefix + (isLast ? '    ' : '│   '));

    for (let i = 0; i < children.length; i++) {
        output += renderTreeAscii(children[i], advances, currentKeys, newPrefix, i === children.length - 1);
    }

    return output;
}

// Get tree statistics
function getTreeStats(node, advances, currentKeys) {
    let nodes = 1;
    let maxDepth = 0;

    const children = (node.unlockedBy || [])
        .filter(k => currentKeys.has(k))
        .map(k => advances[k])
        .filter(Boolean);

    for (const child of children) {
        const childStats = getTreeStats(child, advances, currentKeys);
        nodes += childStats.nodes;
        maxDepth = Math.max(maxDepth, 1 + childStats.maxDepth);
    }

    return { nodes, maxDepth };
}

// === MAIN ===
const eu5Path = process.argv[2] || 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Europa Universalis V';
const advPath = path.join(eu5Path, 'game/in_game/common/advances');

console.log('═══════════════════════════════════════════════════════════');
console.log('         EU5 TECH TREE STRUCTURE TEST');
console.log('═══════════════════════════════════════════════════════════\n');

const parser = new ParadoxParser();
const data = {};

fs.readdirSync(advPath).filter(f => f.endsWith('.txt')).forEach(file => {
    const text = fs.readFileSync(path.join(advPath, file), 'utf-8');
    Object.assign(data, parser.parse(text));
});

const allKeys = Object.keys(data).filter(k => !k.startsWith('_'));
const withPotential = allKeys.filter(k => data[k].potential).length;

console.log('1. DATA LOADING');
console.log('───────────────────────────────────────────────────────────');
console.log(`   Total advances parsed: ${allKeys.length}`);
console.log(`   With potential (country-specific): ${withPotential}`);
console.log(`   Universal (showing in tree): ${allKeys.length - withPotential}`);
console.log('');

const advances = buildTechTreeData(data);
const universalKeys = Object.keys(advances);

// Group by era
const eras = {};
for (const [key, adv] of Object.entries(advances)) {
    const era = adv.era;
    if (!eras[era]) eras[era] = [];
    eras[era].push(adv);
}

console.log('2. ERA BREAKDOWN');
console.log('───────────────────────────────────────────────────────────');

const eraOrder = Object.keys(eras).filter(e => e !== 'other').sort();

for (const era of eraOrder) {
    const eraAdvances = eras[era];
    const eraKeys = new Set(eraAdvances.map(a => a.name));

    const eraRoots = eraAdvances.filter(adv => {
        const internalReqs = adv.requires.filter(r => eraKeys.has(r));
        return internalReqs.length === 0;
    });

    console.log(`   ${era}:`);
    console.log(`      Advances: ${eraAdvances.length}`);
    console.log(`      Root trees: ${eraRoots.length}`);
}
console.log('');

// Detailed test for Age 2
console.log('3. TREE STRUCTURE TEST (Age 2 - Renaissance)');
console.log('───────────────────────────────────────────────────────────');

const age2 = eras['age_2_renaissance'] || [];
const age2Keys = new Set(age2.map(a => a.name));
const age2Roots = age2.filter(adv => {
    const internalReqs = adv.requires.filter(r => age2Keys.has(r));
    return internalReqs.length === 0;
}).sort((a, b) => a.name.localeCompare(b.name));

console.log(`   Total universal advances: ${age2.length}`);
console.log(`   Independent trees (roots): ${age2Roots.length}`);
console.log('');

// Show first 5 trees with stats
console.log('   First 5 trees:\n');

for (let i = 0; i < Math.min(5, age2Roots.length); i++) {
    const root = age2Roots[i];
    const stats = getTreeStats(root, advances, age2Keys);

    console.log(`   ┌─ Tree ${i + 1}: ${root.name.replace(/_/g, ' ')}`);
    console.log(`   │  Nodes: ${stats.nodes}, Depth: ${stats.maxDepth}`);
    console.log(`   │`);

    // Render tree
    const treeAscii = renderTreeAscii(root, advances, age2Keys, '   │  ', true, true);
    console.log(treeAscii.split('\n').filter(l => l.trim()).slice(0, 10).join('\n'));
    if (stats.nodes > 10) console.log(`   │  ... (${stats.nodes - 10} more nodes)`);
    console.log('');
}

// Verify dependency chains
console.log('4. DEPENDENCY CHAIN VERIFICATION');
console.log('───────────────────────────────────────────────────────────');

const chains = [
    ['renaissance_advance', 'patron_of_art', 'renaissance_sculptures'],
    ['renaissance_advance', 'renaissance_thought', 'government_size_renaissance'],
    ['banking_advance', 'merchants_and_trade'],
    ['professional_armies_advance', 'gunpowder_advance']
];

for (const chain of chains) {
    let valid = true;
    let error = '';

    for (let i = 1; i < chain.length; i++) {
        const parent = chain[i - 1];
        const child = chain[i];

        if (!advances[child]) {
            error = `${child} not found (may have potential)`;
            valid = false;
            break;
        }
        if (!advances[child].requires.includes(parent)) {
            error = `${child} doesn't require ${parent}`;
            valid = false;
            break;
        }
    }

    const status = valid ? '✓' : '✗';
    const chainStr = chain.join(' → ');
    console.log(`   ${status} ${chainStr}`);
    if (!valid) console.log(`     └─ ${error}`);
}
console.log('');

// Summary
console.log('5. SUMMARY');
console.log('───────────────────────────────────────────────────────────');

const withChildren = Object.values(advances).filter(a => a.unlockedBy.length > 0).length;
const withParents = Object.values(advances).filter(a => a.requires.length > 0).length;

console.log(`   Universal advances: ${universalKeys.length}`);
console.log(`   Advances with children: ${withChildren}`);
console.log(`   Advances with parents: ${withParents}`);
console.log('');

// Test outcome
const treesFormCorrectly = age2Roots.every(root => {
    const stats = getTreeStats(root, advances, age2Keys);
    return stats.nodes >= 1;
});

if (treesFormCorrectly && withChildren > 0 && withParents > 0) {
    console.log('   ✓ PASS: Tree structure appears correct');
} else {
    console.log('   ✗ FAIL: Tree structure has issues');
}

console.log('\n═══════════════════════════════════════════════════════════');
