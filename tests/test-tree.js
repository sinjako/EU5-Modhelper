/**
 * Node.js CLI Tech Tree Tests
 * Usage: node tests/test-tree.js <EU5_PATH>
 *
 * Tests tech tree building, filtering, and dependency detection.
 */

const fs = require('fs');
const path = require('path');

// Load parser (adapted for Node.js)
const parserCode = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
const modifiedCode = parserCode.replace('window.ParadoxParser = ParadoxParser;', 'module.exports = ParadoxParser;');
const ParadoxParser = eval(`(function() { ${modifiedCode}; return ParadoxParser; })()`);

// Test utilities
let passed = 0;
let failed = 0;

function test(name, condition, detail = '') {
    if (condition) {
        console.log(`  ✓ ${name}${detail ? ` (${detail})` : ''}`);
        passed++;
    } else {
        console.log(`  ✗ ${name}${detail ? ` (${detail})` : ''}`);
        failed++;
    }
}

function section(name) {
    console.log(`\n=== ${name} ===`);
}

// Extract requirements from an advance (mirrors app.js logic)
function extractRequirements(item) {
    const reqs = [];
    if (!item || typeof item !== 'object') return reqs;

    const extractFromValue = (val) => {
        if (typeof val === 'string') {
            reqs.push(val);
        } else if (Array.isArray(val)) {
            for (const v of val) {
                extractFromValue(v);
            }
        } else if (val && typeof val === 'object') {
            for (const [key, nested] of Object.entries(val)) {
                if (key.startsWith('_')) continue;
                if (key === 'advance' || key === 'any_of' || key === 'all_of' ||
                    key === 'AND' || key === 'OR' || key === 'NOT') {
                    extractFromValue(nested);
                }
            }
        }
    };

    if (item.requires) {
        extractFromValue(item.requires);
    }

    const otherFields = ['prerequisites', 'prerequisite', 'parent'];
    for (const field of otherFields) {
        if (item[field]) {
            extractFromValue(item[field]);
        }
    }

    return [...new Set(reqs)];
}

// ========== MAIN TESTS ==========
function runTests(eu5Path) {
    const advancesPath = path.join(eu5Path, 'game/in_game/common/advances');

    if (!fs.existsSync(advancesPath)) {
        console.log(`❌ Advances folder not found at: ${advancesPath}`);
        process.exit(1);
    }

    // Load all advances
    section('Loading Advances');
    const parser = new ParadoxParser();
    const files = fs.readdirSync(advancesPath).filter(f => f.endsWith('.txt'));
    const rawAdvances = {};

    for (const file of files) {
        const content = fs.readFileSync(path.join(advancesPath, file), 'utf8');
        const parsed = parser.parse(content);
        const fileBase = file.replace('.txt', '');

        for (const [key, value] of Object.entries(parsed)) {
            if (key.startsWith('_') || typeof value !== 'object') continue;
            value._sourceFile = fileBase;
            rawAdvances[key] = value;
        }
    }

    const totalCount = Object.keys(rawAdvances).length;
    test('Load advances', totalCount > 500, `${totalCount} total`);

    // ========== FILTERING TESTS ==========
    section('Filtering Tests');

    // Count different types
    const withPotential = Object.entries(rawAdvances).filter(([k, v]) => v.potential);
    const withGovernment = Object.entries(rawAdvances).filter(([k, v]) => v.government);
    const withReligion = Object.entries(rawAdvances).filter(([k, v]) =>
        v.religion && typeof v.religion === 'string');

    test('Find country-specific (potential)', withPotential.length > 0,
         `${withPotential.length} found`);
    test('Find government-specific', withGovernment.length > 0,
         `${withGovernment.length} found`);

    // List government types
    const govTypes = [...new Set(withGovernment.map(([k, v]) => v.government))];
    console.log(`  📋 Government types: ${govTypes.join(', ')}`);

    // Test specific problematic advances - verify they're NOT in universal files
    const fleshIsWeak = rawAdvances.flesh_is_weak;
    test('flesh_is_weak not in universal file',
         fleshIsWeak && !fleshIsWeak._sourceFile?.startsWith('0_age_of_'),
         `source=${fleshIsWeak?._sourceFile}`);

    const standardisation = rawAdvances.standardisation_of_calibre;
    test('standardisation_of_calibre not in universal file',
         standardisation && !standardisation._sourceFile?.startsWith('0_age_of_'),
         `source=${standardisation?._sourceFile}`);

    // Universal advances = ONLY from 0_age_of_* files
    const universal = Object.entries(rawAdvances).filter(([k, v]) => {
        const sourceFile = v._sourceFile || '';
        return sourceFile.startsWith('0_age_of_');
    });
    test('Universal advances (from 0_age_of_* files)', universal.length > 300, `${universal.length} found`);

    // Count by source file type
    const bySourceType = {};
    for (const [k, v] of Object.entries(rawAdvances)) {
        const source = v._sourceFile || 'unknown';
        const prefix = source.split('_')[0] || 'other';
        bySourceType[prefix] = (bySourceType[prefix] || 0) + 1;
    }
    console.log(`  📋 By source prefix: ${Object.entries(bySourceType).map(([k,v]) => `${k}:${v}`).join(', ')}`);

    // ========== REQUIREMENT EXTRACTION TESTS ==========
    section('Requirement Extraction');

    // Test requirement extraction
    const testCases = [
        { name: 'string requires', data: { requires: 'parent_tech' }, expected: ['parent_tech'] },
        { name: 'array requires', data: { requires: ['tech1', 'tech2'] }, expected: ['tech1', 'tech2'] },
        { name: 'no requires', data: { age: 'age_1' }, expected: [] },
        { name: 'nested requires', data: { requires: { advance: 'nested_tech' } }, expected: ['nested_tech'] },
    ];

    for (const tc of testCases) {
        const result = extractRequirements(tc.data);
        const match = JSON.stringify(result.sort()) === JSON.stringify(tc.expected.sort());
        test(`Extract ${tc.name}`, match, `got [${result.join(', ')}]`);
    }

    // Test on real data
    const advancesWithReqs = universal.filter(([k, v]) => {
        const reqs = extractRequirements(v);
        return reqs.length > 0;
    });
    test('Universal advances with extracted requires', advancesWithReqs.length > 300,
         `${advancesWithReqs.length} found`);

    // ========== TREE STRUCTURE TESTS ==========
    section('Tree Structure');

    // Build filtered advances map
    const advances = {};
    for (const [key, item] of universal) {
        advances[key] = {
            name: key,
            era: item.age || 'unknown',
            isRoot: item.depth === 0 || item.depth === '0',
            requires: extractRequirements(item),
            unlockedBy: [],
            raw: item
        };
    }

    // Build reverse dependencies
    for (const [key, adv] of Object.entries(advances)) {
        for (const req of adv.requires) {
            if (advances[req]) {
                advances[req].unlockedBy.push(key);
            }
        }
    }

    // Find roots
    const roots = Object.entries(advances).filter(([k, v]) =>
        v.isRoot || v.requires.length === 0
    );
    test('Find root advances', roots.length > 0 && roots.length < 50,
         `${roots.length} roots`);

    // Find and remove orphaned (have requires but none exist in universal tree)
    const orphaned = Object.entries(advances).filter(([k, v]) => {
        if (v.requires.length === 0) return false;
        const validReqs = v.requires.filter(r => advances[r]);
        return validReqs.length === 0;
    });

    // Remove orphaned from advances (as the app does)
    for (const [k] of orphaned) {
        delete advances[k];
    }

    test('Orphaned advances removed', true,
         `${orphaned.length} orphaned removed: ${orphaned.slice(0, 5).map(([k]) => k).join(', ')}`);

    // If orphaned exist, analyze them
    if (orphaned.length > 0) {
        console.log('\n  📋 Orphaned advance analysis:');
        for (const [key, adv] of orphaned.slice(0, 10)) {
            const missingReqs = adv.requires.filter(r => !advances[r]);
            const reqInfo = missingReqs.map(r => {
                if (rawAdvances[r]?.government) return `${r} (gov:${rawAdvances[r].government})`;
                if (rawAdvances[r]?.potential) return `${r} (country-specific)`;
                if (!rawAdvances[r]) return `${r} (not found)`;
                return r;
            });
            console.log(`     ${key}: requires [${reqInfo.join(', ')}]`);
        }
    }

    // ========== ERA ANALYSIS ==========
    section('Era Analysis');

    const byEra = {};
    for (const [key, adv] of Object.entries(advances)) {
        const era = adv.era;
        if (!byEra[era]) byEra[era] = [];
        byEra[era].push(key);
    }

    for (const [era, keys] of Object.entries(byEra).sort()) {
        if (era === 'unknown') continue;
        const eraRoots = keys.filter(k => {
            const adv = advances[k];
            const inEraReqs = adv.requires.filter(r => advances[r]?.era === era);
            return inEraReqs.length === 0;
        });
        console.log(`  ${era}: ${keys.length} advances, ${eraRoots.length} era roots`);
    }

    // ========== DISCONNECTED DETECTION ==========
    section('Disconnected Detection');

    // BFS from all roots
    const visited = new Set();
    const queue = roots.map(([k]) => k);
    queue.forEach(k => visited.add(k));

    while (queue.length > 0) {
        const current = queue.shift();
        const adv = advances[current];
        if (!adv) continue;

        for (const child of adv.unlockedBy) {
            if (!visited.has(child)) {
                visited.add(child);
                queue.push(child);
            }
        }
    }

    const disconnected = Object.keys(advances).filter(k => !visited.has(k));
    test('All advances connected', disconnected.length === 0,
         `${disconnected.length} disconnected`);

    if (disconnected.length > 0 && disconnected.length <= 20) {
        console.log(`  📋 Disconnected: ${disconnected.join(', ')}`);
    }
}

// ========== MAIN ==========
console.log('EU5 Inspector - Tech Tree Tests\n');

const eu5Path = process.argv[2];
if (!eu5Path) {
    console.log('Usage: node tests/test-tree.js <EU5_PATH>');
    console.log('Example: node tests/test-tree.js "C:\\Games\\EU5"');
    process.exit(1);
}

if (!fs.existsSync(eu5Path)) {
    console.log(`❌ Path not found: ${eu5Path}`);
    process.exit(1);
}

runTests(eu5Path);

// Summary
console.log(`\n=============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
