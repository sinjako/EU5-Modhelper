/**
 * Node.js CLI Parser Tests
 * Usage: node tests/test-parser.js [EU5_PATH]
 *
 * Runs parser unit tests and optionally tests against real EU5 files.
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

// ========== UNIT TESTS ==========
function runUnitTests() {
    section('Parser Unit Tests');
    const parser = new ParadoxParser();

    // Basic key-value
    let result = parser.parse('key = value');
    test('Parse basic key-value', result.key === 'value', `key="${result.key}"`);

    // Nested blocks
    result = parser.parse('outer = { inner = 123 }');
    test('Parse nested blocks', result.outer?.inner === 123, `inner=${result.outer?.inner}`);

    // Boolean yes/no
    result = parser.parse('enabled = yes\ndisabled = no');
    test('Parse boolean yes', result.enabled === true);
    test('Parse boolean no', result.disabled === false);

    // Numbers
    result = parser.parse('positive = 100\nnegative = -50\ndecimal = 0.75');
    test('Parse positive number', result.positive === 100);
    test('Parse negative number', result.negative === -50);
    test('Parse decimal', result.decimal === 0.75);

    // Arrays
    result = parser.parse('list = { a b c }');
    test('Parse array', Array.isArray(result.list) && result.list.length === 3);

    // RGB colors
    result = parser.parse('color = rgb { 255 128 64 }');
    test('Parse RGB color', result.color?._type === 'rgb' && result.color?.r === 255);

    // HSV colors
    result = parser.parse('color = hsv { 0.5 0.8 0.9 }');
    test('Parse HSV color', result.color?._type === 'hsv' && result.color?.h === 0.5);

    // Comments
    result = parser.parse('# comment\nkey = value # inline');
    test('Skip comments', result.key === 'value');

    // Quoted strings
    result = parser.parse('name = "Hello World"');
    test('Parse quoted string', result.name === 'Hello World');

    // Comparison operators
    result = parser.parse('check = { value > 10 }');
    test('Parse comparison operator', result.check?.value?.operator === '>');

    // Date format
    result = parser.parse('start = 1444.11.11');
    test('Parse date', result.start?._type === 'date' && result.start?.value === '1444.11.11');

    // Complex nested structure
    result = parser.parse(`
        advance = {
            age = age_2_renaissance
            depth = 0
            requires = parent_advance
            modifier = {
                land_morale_modifier = 0.05
                tax_modifier = -0.10
            }
        }
    `);
    test('Parse complex structure - age', result.advance?.age === 'age_2_renaissance');
    test('Parse complex structure - depth', result.advance?.depth === 0);
    test('Parse complex structure - requires', result.advance?.requires === 'parent_advance');
    test('Parse complex structure - modifier', result.advance?.modifier?.land_morale_modifier === 0.05);

    // Multiple top-level objects
    result = parser.parse(`
        obj1 = { val = 1 }
        obj2 = { val = 2 }
    `);
    test('Parse multiple objects', result.obj1?.val === 1 && result.obj2?.val === 2);

    // Array of blocks
    result = parser.parse('items = { { name = a } { name = b } }');
    test('Parse array of blocks', Array.isArray(result.items) && result.items.length === 2);
}

// ========== FILE TESTS ==========
function runFileTests(eu5Path) {
    section('Real File Tests');

    const advancesPath = path.join(eu5Path, 'game/in_game/common/advances');

    if (!fs.existsSync(advancesPath)) {
        console.log(`  ⚠ Advances folder not found at: ${advancesPath}`);
        return;
    }

    const parser = new ParadoxParser();
    const files = fs.readdirSync(advancesPath).filter(f => f.endsWith('.txt'));

    test('Find advance files', files.length > 0, `${files.length} files`);

    let totalAdvances = 0;
    let withAge = 0;
    let withRequires = 0;
    let withGovernment = 0;
    let withPotential = 0;
    const allAdvances = {};

    for (const file of files) {
        const content = fs.readFileSync(path.join(advancesPath, file), 'utf8');
        const parsed = parser.parse(content);

        for (const [key, value] of Object.entries(parsed)) {
            if (key.startsWith('_') || typeof value !== 'object') continue;

            totalAdvances++;
            allAdvances[key] = value;

            if (value.age) withAge++;
            if (value.requires) withRequires++;
            if (value.government) withGovernment++;
            if (value.potential) withPotential++;
        }
    }

    test('Parse advances', totalAdvances > 500, `${totalAdvances} advances`);
    test('Advances have age field', withAge > 500, `${withAge} with age`);
    test('Advances have requires field', withRequires > 400, `${withRequires} with requires`);
    test('Find government-specific advances', withGovernment > 0, `${withGovernment} found`);
    test('Find country-specific advances', withPotential > 0, `${withPotential} found`);

    // Check specific advances
    test('renaissance_advance exists', !!allAdvances.renaissance_advance);
    test('renaissance_advance.depth = 0', allAdvances.renaissance_advance?.depth === 0);

    test('flesh_is_weak exists', !!allAdvances.flesh_is_weak);
    test('flesh_is_weak has government field', !!allAdvances.flesh_is_weak?.government,
         `government=${allAdvances.flesh_is_weak?.government}`);

    // Filtering analysis
    const universal = Object.entries(allAdvances).filter(([k, v]) =>
        !v.potential && !v.government
    );
    test('Universal advances count', universal.length > 400, `${universal.length} universal`);

    // Advances with no requires (potential roots)
    const noRequires = universal.filter(([k, v]) => !v.requires);
    test('Universal advances without requires', noRequires.length < 100,
         `${noRequires.length} (should be root nodes)`);
}

// ========== MAIN ==========
console.log('EU5 Inspector - Parser Tests\n');

runUnitTests();

const eu5Path = process.argv[2];
if (eu5Path) {
    if (fs.existsSync(eu5Path)) {
        runFileTests(eu5Path);
    } else {
        console.log(`\n⚠ EU5 path not found: ${eu5Path}`);
    }
} else {
    console.log('\n💡 Tip: Pass EU5 path as argument for file tests:');
    console.log('   node tests/test-parser.js "C:\\Path\\To\\EU5"');
}

// Summary
console.log(`\n=============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
