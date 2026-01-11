/**
 * Comprehensive Parser Tests for EU5 ModHelper
 * Tests all aspects of Paradox script parsing
 *
 * Usage: node tests/test-parser.js [EU5_PATH]
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js environment
if (typeof window === 'undefined') {
    global.window = { showDirectoryPicker: undefined };
}

// Load test utilities
const { TestRunner, assert, fixtures } = require('./test-utils.js');

// Load parser - use eval to extract the class before window assignment
const parserCode = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
// Remove the window assignment line to prevent errors
const cleanParserCode = parserCode.replace(/window\.ParadoxParser\s*=\s*ParadoxParser;?/, '');
const ParadoxParser = eval(`(function() { ${cleanParserCode}; return ParadoxParser; })()`);

async function runParserTests() {
    const runner = new TestRunner('Parser Tests');
    const parser = new ParadoxParser();

    // ==========================================
    // BASIC VALUE TYPES
    // ==========================================

    runner.test('Parse simple string value', () => {
        const result = parser.parse('name = test');
        assert.equal(result.name, 'test');
    });

    runner.test('Parse quoted string value', () => {
        const result = parser.parse('name = "Hello World"');
        assert.equal(result.name, 'Hello World');
    });

    runner.test('Parse empty quoted string', () => {
        const result = parser.parse('name = ""');
        assert.equal(result.name, '');
    });

    runner.test('Parse integer', () => {
        const result = parser.parse('count = 42');
        assert.equal(result.count, 42);
        assert.isType(result.count, 'number');
    });

    runner.test('Parse negative integer', () => {
        const result = parser.parse('offset = -17');
        assert.equal(result.offset, -17);
    });

    runner.test('Parse zero', () => {
        const result = parser.parse('value = 0');
        assert.equal(result.value, 0);
    });

    runner.test('Parse decimal number', () => {
        const result = parser.parse('rate = 3.14159');
        assert.approximately(result.rate, 3.14159, 0.00001);
    });

    runner.test('Parse small decimal', () => {
        const result = parser.parse('rate = 0.001');
        assert.approximately(result.rate, 0.001, 0.0001);
    });

    runner.test('Parse negative decimal', () => {
        const result = parser.parse('rate = -0.5');
        assert.approximately(result.rate, -0.5, 0.01);
    });

    runner.test('Parse boolean yes', () => {
        const result = parser.parse('enabled = yes');
        assert.equal(result.enabled, true);
    });

    runner.test('Parse boolean no', () => {
        const result = parser.parse('disabled = no');
        assert.equal(result.disabled, false);
    });

    // ==========================================
    // DATES
    // ==========================================

    runner.test('Parse standard date', () => {
        const result = parser.parse('start = 1444.11.11');
        assert.hasProperty(result.start, '_type');
        assert.equal(result.start._type, 'date');
        assert.equal(result.start.value, '1444.11.11');
    });

    runner.test('Parse date with single digit month/day', () => {
        const result = parser.parse('date = 1821.1.1');
        assert.equal(result.date._type, 'date');
        assert.equal(result.date.value, '1821.1.1');
    });

    // ==========================================
    // COLORS
    // ==========================================

    runner.test('Parse RGB color', () => {
        const result = parser.parse('color = rgb { 255 128 64 }');
        assert.equal(result.color._type, 'rgb');
        assert.equal(result.color.r, 255);
        assert.equal(result.color.g, 128);
        assert.equal(result.color.b, 64);
    });

    runner.test('Parse RGB with decimals', () => {
        const result = parser.parse('color = rgb { 0.5 0.3 0.1 }');
        assert.equal(result.color._type, 'rgb');
        assert.approximately(result.color.r, 0.5, 0.01);
    });

    runner.test('Parse HSV color', () => {
        const result = parser.parse('color = hsv { 0.5 0.8 0.9 }');
        assert.equal(result.color._type, 'hsv');
        assert.approximately(result.color.h, 0.5, 0.01);
        assert.approximately(result.color.s, 0.8, 0.01);
        assert.approximately(result.color.v, 0.9, 0.01);
    });

    // ==========================================
    // BLOCKS AND NESTING
    // ==========================================

    runner.test('Parse empty block', () => {
        const result = parser.parse('empty = { }');
        assert.deepEqual(result.empty, {});
    });

    runner.test('Parse simple block', () => {
        const result = parser.parse('block = { value = 1 }');
        assert.equal(result.block.value, 1);
    });

    runner.test('Parse nested blocks', () => {
        const result = parser.parse(`
            outer = {
                inner = {
                    deep = {
                        value = "found"
                    }
                }
            }
        `);
        assert.equal(result.outer.inner.deep.value, 'found');
    });

    runner.test('Parse multiple properties in block', () => {
        const result = parser.parse(`
            item = {
                name = "Test"
                value = 42
                enabled = yes
            }
        `);
        assert.equal(result.item.name, 'Test');
        assert.equal(result.item.value, 42);
        assert.equal(result.item.enabled, true);
    });

    runner.test('Parse sibling blocks', () => {
        const result = parser.parse(`
            first = { value = 1 }
            second = { value = 2 }
        `);
        assert.equal(result.first.value, 1);
        assert.equal(result.second.value, 2);
    });

    // ==========================================
    // ARRAYS
    // ==========================================

    runner.test('Parse simple string array', () => {
        const result = parser.parse('list = { a b c }');
        assert.isArray(result.list);
        assert.lengthOf(result.list, 3);
        assert.equal(result.list[0], 'a');
        assert.equal(result.list[2], 'c');
    });

    runner.test('Parse number array', () => {
        const result = parser.parse('numbers = { 1 2 3 4 5 }');
        assert.isArray(result.numbers);
        assert.lengthOf(result.numbers, 5);
        assert.equal(result.numbers[0], 1);
        assert.equal(result.numbers[4], 5);
    });

    runner.test('Parse array of objects', () => {
        const result = parser.parse(`
            items = {
                { name = "first" }
                { name = "second" }
            }
        `);
        assert.isArray(result.items);
        assert.lengthOf(result.items, 2);
        assert.equal(result.items[0].name, 'first');
    });

    // ==========================================
    // COMMENTS
    // ==========================================

    runner.test('Parse with line comment', () => {
        const result = parser.parse(`
            # This is a comment
            value = 42
        `);
        assert.equal(result.value, 42);
    });

    runner.test('Parse with inline comment', () => {
        const result = parser.parse('value = 42 # inline comment');
        assert.equal(result.value, 42);
    });

    runner.test('Parse with multiple comments', () => {
        const result = parser.parse(`
            # Comment 1
            a = 1
            # Comment 2
            b = 2
        `);
        assert.equal(result.a, 1);
        assert.equal(result.b, 2);
    });

    // ==========================================
    // OPERATORS
    // ==========================================

    runner.test('Parse comparison operators', () => {
        const result = parser.parse('trigger = { value > 10 }');
        assert.hasProperty(result.trigger, 'value');
    });

    // ==========================================
    // SPECIAL KEYS
    // ==========================================

    runner.test('Parse key with colons', () => {
        const result = parser.parse('scope:owner = { value = 1 }');
        assert.hasProperty(result, 'scope:owner');
    });

    runner.test('Parse @variable reference', () => {
        const result = parser.parse('value = @my_variable');
        assert.equal(result.value, '@my_variable');
    });

    runner.test('Parse REPLACE: prefix', () => {
        const result = parser.parse('REPLACE:sand = { value = 1 }');
        assert.hasProperty(result, 'REPLACE:sand');
    });

    // ==========================================
    // EDGE CASES
    // ==========================================

    runner.test('Parse empty input', () => {
        const result = parser.parse('');
        assert.deepEqual(result, {});
    });

    runner.test('Parse whitespace only', () => {
        const result = parser.parse('   \n\t\n   ');
        assert.deepEqual(result, {});
    });

    runner.test('Parse deeply nested (5 levels)', () => {
        const result = parser.parse(`
            a = { b = { c = { d = { e = { value = "deep" } } } } }
        `);
        assert.equal(result.a.b.c.d.e.value, 'deep');
    });

    runner.test('Parse large number', () => {
        const result = parser.parse('big = 999999999');
        assert.equal(result.big, 999999999);
    });

    // ==========================================
    // REAL-WORLD SAMPLES
    // ==========================================

    runner.test('Parse goods definition', () => {
        const result = parser.parse(`
            sand = {
                method = gathering
                category = raw_material
                color = goods_sand
                default_market_price = 0.5
                base_production = 0.2
            }
        `);
        assert.equal(result.sand.method, 'gathering');
        assert.equal(result.sand.category, 'raw_material');
        assert.approximately(result.sand.default_market_price, 0.5, 0.01);
    });

    runner.test('Parse religion with color and array', () => {
        const result = parser.parse(`
            catholic = {
                group = christian
                color = rgb { 200 180 100 }
                holy_sites = { rome jerusalem constantinople }
            }
        `);
        assert.equal(result.catholic.group, 'christian');
        assert.equal(result.catholic.color._type, 'rgb');
        assert.isArray(result.catholic.holy_sites);
    });

    runner.test('Parse trigger with nested logic', () => {
        const result = parser.parse(`
            potential = {
                OR = {
                    has_reform = monarchy
                    AND = {
                        government = republic
                        has_parliament = yes
                    }
                }
            }
        `);
        assert.hasProperty(result.potential, 'OR');
        assert.hasProperty(result.potential.OR, 'AND');
    });

    runner.test('Parse advance definition', () => {
        const result = parser.parse(`
            renaissance_advance = {
                age = age_2_renaissance
                depth = 0
                modifier = {
                    land_morale_modifier = 0.05
                }
            }
        `);
        assert.equal(result.renaissance_advance.age, 'age_2_renaissance');
        assert.equal(result.renaissance_advance.depth, 0);
        assert.approximately(result.renaissance_advance.modifier.land_morale_modifier, 0.05, 0.001);
    });

    // ==========================================
    // ERROR HANDLING
    // ==========================================

    runner.test('Handle unclosed block gracefully', () => {
        assert.doesNotThrow(() => {
            parser.parse('block = { value = 1');
        });
    });

    runner.test('Handle missing value gracefully', () => {
        assert.doesNotThrow(() => {
            parser.parse('key = ');
        });
    });

    return await runner.run();
}

async function runFileTests(eu5Path) {
    const runner = new TestRunner('File Tests');
    const parser = new ParadoxParser();

    const advancesPath = path.join(eu5Path, 'game/in_game/common/advances');
    const goodsPath = path.join(eu5Path, 'game/in_game/common/goods');
    const religionsPath = path.join(eu5Path, 'game/in_game/common/religions');

    runner.test('Advances folder exists', () => {
        assert.ok(fs.existsSync(advancesPath), 'Advances folder should exist');
    });

    runner.test('Parse all advance files', () => {
        const files = fs.readdirSync(advancesPath).filter(f => f.endsWith('.txt'));
        assert.ok(files.length > 0, 'Should find advance files');

        let totalAdvances = 0;
        for (const file of files) {
            const content = fs.readFileSync(path.join(advancesPath, file), 'utf8');
            const parsed = parser.parse(content);
            totalAdvances += Object.keys(parsed).filter(k => !k.startsWith('_')).length;
        }
        assert.ok(totalAdvances > 500, `Should parse 500+ advances, got ${totalAdvances}`);
    });

    runner.test('Parse all goods files', () => {
        if (!fs.existsSync(goodsPath)) return;
        const files = fs.readdirSync(goodsPath).filter(f => f.endsWith('.txt'));

        let totalGoods = 0;
        for (const file of files) {
            const content = fs.readFileSync(path.join(goodsPath, file), 'utf8');
            const parsed = parser.parse(content);
            totalGoods += Object.keys(parsed).filter(k => !k.startsWith('_')).length;
        }
        assert.ok(totalGoods > 10, `Should parse goods, got ${totalGoods}`);
    });

    runner.test('Parse all religion files', () => {
        if (!fs.existsSync(religionsPath)) return;
        const files = fs.readdirSync(religionsPath).filter(f => f.endsWith('.txt'));

        let totalReligions = 0;
        for (const file of files) {
            const content = fs.readFileSync(path.join(religionsPath, file), 'utf8');
            const parsed = parser.parse(content);
            totalReligions += Object.keys(parsed).filter(k => !k.startsWith('_')).length;
        }
        assert.ok(totalReligions > 5, `Should parse religions, got ${totalReligions}`);
    });

    return await runner.run();
}

// Main
async function main() {
    console.log('EU5 ModHelper - Parser Tests\n');

    const parserResults = await runParserTests();

    const eu5Path = process.argv[2];
    let fileResults = { passed: 0, failed: 0 };

    if (eu5Path) {
        if (fs.existsSync(eu5Path)) {
            fileResults = await runFileTests(eu5Path);
        } else {
            console.log(`\n⚠ EU5 path not found: ${eu5Path}`);
        }
    } else {
        console.log('\n💡 Tip: Pass EU5 path for file tests:');
        console.log('   node tests/test-parser.js "C:\\Path\\To\\EU5"');
    }

    // Summary
    const totalPassed = parserResults.passed + fileResults.passed;
    const totalFailed = parserResults.failed + fileResults.failed;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
    console.log('='.repeat(60));

    process.exit(totalFailed > 0 ? 1 : 0);
}

main();
