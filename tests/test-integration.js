/**
 * Integration Tests for EU5 ModHelper
 * Tests end-to-end workflows and round-trip parsing
 *
 * Usage: node tests/test-integration.js [EU5_PATH]
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js environment
if (typeof window === 'undefined') {
    global.window = { showDirectoryPicker: undefined };
}

// Load test utilities
const { TestRunner, assert, fixtures } = require('./test-utils.js');

// Load parser
const parserCode = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
const cleanParserCode = parserCode.replace(/window\.ParadoxParser\s*=\s*ParadoxParser;?/, '');
const ParadoxParser = eval(`(function() { ${cleanParserCode}; return ParadoxParser; })()`);

// Load CategoryRegistry
const categoryRegistryCode = fs.readFileSync(path.join(__dirname, '../js/category-registry.js'), 'utf8');
const cleanCategoryCode = categoryRegistryCode.replace(/window\.CategoryRegistry\s*=\s*CategoryRegistry;?/, '');
eval(`(function() { ${cleanCategoryCode}; global.CategoryRegistry = CategoryRegistry; })()`);

// Load ModWriter
const modWriterCode = fs.readFileSync(path.join(__dirname, '../js/mod-writer.js'), 'utf8');
const cleanWriterCode = modWriterCode.replace(/window\.ModWriter\s*=\s*ModWriter;?/, '');
eval(`(function() { ${cleanWriterCode}; global.ModWriter = ModWriter; })()`);

// Load ModCreator
const modCreatorCode = fs.readFileSync(path.join(__dirname, '../js/mod-creator.js'), 'utf8');
const cleanCreatorCode = modCreatorCode.replace(/window\.ModCreator\s*=\s*ModCreator;?/, '');
eval(`(function() { ${cleanCreatorCode}; global.ModCreator = ModCreator; })()`);

const ModWriter = global.ModWriter;
const ModCreator = global.ModCreator;
const CategoryRegistry = global.CategoryRegistry;

async function runRoundTripTests() {
    const runner = new TestRunner('Round-Trip Tests (Parse → Serialize → Parse)');
    const parser = new ParadoxParser();
    const writer = new ModWriter();

    // Helper to test round-trip
    function testRoundTrip(name, original, compareFunc = null) {
        runner.test(`Round-trip: ${name}`, () => {
            // Parse original
            const parsed1 = parser.parse(original);

            // Serialize (wrap in item block)
            const items = { test: parsed1.test || parsed1 };
            const serialized = writer.generateScript(items, {});

            // Parse serialized
            const parsed2 = parser.parse(serialized);

            // Compare (excluding internal properties)
            if (compareFunc) {
                compareFunc(parsed1, parsed2);
            } else {
                // Default comparison - check key values match
                const item1 = parsed1.test || Object.values(parsed1)[0];
                const item2 = parsed2.test || Object.values(parsed2)[0];

                for (const key of Object.keys(item1)) {
                    if (key.startsWith('_')) continue;
                    assert.ok(key in item2, `Key ${key} should exist after round-trip`);
                }
            }
        });
    }

    // ==========================================
    // BASIC ROUND-TRIPS
    // ==========================================

    testRoundTrip('Simple values', `
        test = {
            str = value
            num = 42
            bool = yes
        }
    `, (p1, p2) => {
        assert.equal(p2.test.str, 'value');
        assert.equal(p2.test.num, 42);
        assert.equal(p2.test.bool, true);
    });

    testRoundTrip('Decimal numbers', `
        test = {
            rate = 0.5
            modifier = -0.1
        }
    `, (p1, p2) => {
        assert.approximately(p2.test.rate, 0.5, 0.01);
        assert.approximately(p2.test.modifier, -0.1, 0.01);
    });

    testRoundTrip('RGB color', `
        test = {
            color = rgb { 200 150 100 }
        }
    `, (p1, p2) => {
        assert.equal(p2.test.color._type, 'rgb');
        assert.equal(p2.test.color.r, 200);
        assert.equal(p2.test.color.g, 150);
        assert.equal(p2.test.color.b, 100);
    });

    testRoundTrip('HSV color', `
        test = {
            color = hsv { 0.5 0.8 0.9 }
        }
    `, (p1, p2) => {
        assert.equal(p2.test.color._type, 'hsv');
        assert.approximately(p2.test.color.h, 0.5, 0.1);
    });

    testRoundTrip('Simple array', `
        test = {
            list = { a b c }
        }
    `, (p1, p2) => {
        assert.isArray(p2.test.list);
        assert.lengthOf(p2.test.list, 3);
    });

    testRoundTrip('Nested block', `
        test = {
            inner = {
                value = 123
            }
        }
    `, (p1, p2) => {
        assert.equal(p2.test.inner.value, 123);
    });

    testRoundTrip('Date value', `
        test = {
            start = 1444.11.11
        }
    `, (p1, p2) => {
        assert.equal(p2.test.start._type, 'date');
        assert.equal(p2.test.start.value, '1444.11.11');
    });

    // ==========================================
    // COMPLEX ROUND-TRIPS
    // ==========================================

    testRoundTrip('Goods definition', `
        sand = {
            method = gathering
            category = raw_material
            color = goods_sand
            default_market_price = 0.5
            base_production = 0.2
        }
    `, (p1, p2) => {
        // Original has 'sand' key, wrapped in 'test' for serialization
        // After serialize/parse, check nested structure
        assert.hasProperty(p2, 'test');
        const sand = p2.test.sand || p2.test;
        assert.equal(sand.method, 'gathering');
        assert.equal(sand.category, 'raw_material');
        assert.approximately(sand.default_market_price, 0.5, 0.01);
    });

    testRoundTrip('Religion with multiple properties', `
        test = {
            group = christian
            color = rgb { 200 180 100 }
            holy_sites = { rome jerusalem constantinople }
            fervor = yes
            hostility = {
                muslim = 2
                pagan = 1
            }
        }
    `, (p1, p2) => {
        assert.equal(p2.test.group, 'christian');
        assert.equal(p2.test.color._type, 'rgb');
        assert.isArray(p2.test.holy_sites);
        assert.equal(p2.test.fervor, true);
        assert.hasProperty(p2.test.hostility, 'muslim');
    });

    testRoundTrip('Modifier block', `
        test = {
            modifier = {
                discipline = 0.05
                morale = 0.1
                cost = -0.1
            }
        }
    `, (p1, p2) => {
        assert.hasProperty(p2.test, 'modifier');
        assert.approximately(p2.test.modifier.discipline, 0.05, 0.01);
        assert.approximately(p2.test.modifier.cost, -0.1, 0.01);
    });

    return await runner.run();
}

async function runCategoryTests() {
    const runner = new TestRunner('Category Registry Tests');

    runner.test('Get all categories returns array', () => {
        const all = CategoryRegistry.getAll();
        assert.isArray(all);
        assert.ok(all.length > 10);
    });

    runner.test('Get category by ID', () => {
        const goods = CategoryRegistry.get('goods');
        assert.ok(goods);
        assert.equal(goods.id, 'goods');
        assert.hasProperty(goods, 'path');
    });

    runner.test('Get nonexistent category returns null', () => {
        const result = CategoryRegistry.get('nonexistent');
        assert.equal(result, null);
    });

    runner.test('All categories have required properties', () => {
        const all = CategoryRegistry.getAll();
        for (const cat of all) {
            assert.hasProperty(cat, 'id');
            assert.hasProperty(cat, 'name');
            assert.hasProperty(cat, 'handler');
        }
    });

    runner.test('Category paths are valid format', () => {
        const all = CategoryRegistry.getAll();
        for (const cat of all) {
            if (cat.path) {
                assert.ok(cat.path.startsWith('game/'), `${cat.id} path should start with game/`);
            }
        }
    });

    runner.test('Get grouped categories', () => {
        const grouped = CategoryRegistry.getGrouped();
        assert.hasProperty(grouped, 'Core Gameplay');
        assert.hasProperty(grouped, 'Economy & Buildings');
        assert.hasProperty(grouped, 'Mod Tools');
    });

    runner.test('Grouped categories reference valid IDs', () => {
        const grouped = CategoryRegistry.getGrouped();
        const allIds = CategoryRegistry.getAll().map(c => c.id);

        for (const [group, ids] of Object.entries(grouped)) {
            for (const id of ids) {
                assert.ok(allIds.includes(id), `${id} in ${group} should be valid`);
            }
        }
    });

    return await runner.run();
}

async function runFileIntegrationTests(eu5Path) {
    const runner = new TestRunner('File Integration Tests');
    const parser = new ParadoxParser();
    const writer = new ModWriter();

    const goodsPath = path.join(eu5Path, 'game/in_game/common/goods');

    runner.test('Parse and re-serialize goods file', () => {
        if (!fs.existsSync(goodsPath)) return;

        const files = fs.readdirSync(goodsPath).filter(f => f.endsWith('.txt'));
        const file = files[0];
        const content = fs.readFileSync(path.join(goodsPath, file), 'utf8');

        // Parse
        const parsed = parser.parse(content);
        const keys = Object.keys(parsed).filter(k => !k.startsWith('_'));
        assert.ok(keys.length > 0, 'Should parse items from file');

        // Pick first item and serialize
        const firstKey = keys[0];
        const items = { [firstKey]: parsed[firstKey] };
        const serialized = writer.generateScript(items, parsed);

        // Re-parse
        const reparsed = parser.parse(serialized);
        const reparsedKey = Object.keys(reparsed).find(k => k.includes(firstKey));
        assert.ok(reparsedKey, 'Should find item after re-parsing');
    });

    runner.test('Verify REPLACE: prefix in re-serialized content', () => {
        if (!fs.existsSync(goodsPath)) return;

        const files = fs.readdirSync(goodsPath).filter(f => f.endsWith('.txt'));
        const file = files[0];
        const content = fs.readFileSync(path.join(goodsPath, file), 'utf8');

        const parsed = parser.parse(content);
        const keys = Object.keys(parsed).filter(k => !k.startsWith('_'));
        const firstKey = keys[0];

        // Serialize with base items (simulating mod)
        const items = { [firstKey]: { ...parsed[firstKey], modified: true } };
        const serialized = writer.generateScript(items, parsed);

        assert.contains(serialized, `REPLACE:${firstKey}`);
    });

    return await runner.run();
}

async function runWorkflowTests() {
    const runner = new TestRunner('Workflow Tests');
    const creator = new ModCreator();
    const writer = new ModWriter();
    const parser = new ParadoxParser();

    runner.test('Full mod creation workflow', () => {
        // 1. Create mod config
        const config = {
            name: 'Test Workflow Mod',
            id: 'test_workflow',
            version: '1.0.0',
            gameVersion: '1.0.*',
            description: 'Testing the workflow',
            tags: ['Gameplay', 'Balance'],
            folders: ['common', 'events']
        };

        // 2. Generate mod files
        const files = creator.getFileList(config);
        assert.ok(files.length >= 3, 'Should generate multiple files');

        // 3. Verify metadata is valid JSON
        const metadataFile = files.find(f => f.path.includes('metadata.json'));
        assert.ok(metadataFile);
        const metadata = JSON.parse(metadataFile.content);
        assert.equal(metadata.name, config.name);
        assert.equal(metadata.id, config.id);

        // 4. Verify descriptor format
        const descriptorFile = files.find(f => f.path === 'descriptor.mod');
        assert.ok(descriptorFile);
        assert.contains(descriptorFile.content, 'version=');
        assert.contains(descriptorFile.content, 'name=');
    });

    runner.test('Edit and serialize workflow', () => {
        // 1. Simulate parsed game data
        const baseItems = {
            sand: {
                method: 'gathering',
                category: 'raw_material',
                default_market_price: 0.5,
                base_production: 0.2
            }
        };

        // 2. Simulate user edit
        const editedItems = {
            sand: {
                method: 'gathering',
                category: 'raw_material',
                default_market_price: 200,  // Changed!
                base_production: 200        // Changed!
            }
        };

        // 3. Serialize
        const content = writer.generateScript(editedItems, baseItems);

        // 4. Verify output
        assert.contains(content, 'REPLACE:sand');
        assert.contains(content, 'default_market_price = 200');
        assert.contains(content, 'base_production = 200');

        // 5. Re-parse and verify
        const reparsed = parser.parse(content);
        const sandKey = Object.keys(reparsed).find(k => k.includes('sand'));
        assert.equal(reparsed[sandKey].default_market_price, 200);
    });

    runner.test('New item workflow (no REPLACE:)', () => {
        const baseItems = {
            sand: { value: 1 }
        };

        const newItems = {
            my_new_good: {
                method: 'crafting',
                category: 'manufactured',
                default_market_price: 100
            }
        };

        const content = writer.generateScript(newItems, baseItems);

        // New item should NOT have REPLACE:
        assert.ok(!content.includes('REPLACE:my_new_good'));
        assert.contains(content, 'my_new_good = {');
    });

    return await runner.run();
}

// Main
async function main() {
    console.log('EU5 ModHelper - Integration Tests\n');

    let totalPassed = 0;
    let totalFailed = 0;

    // Round-trip tests
    const rtResults = await runRoundTripTests();
    totalPassed += rtResults.passed;
    totalFailed += rtResults.failed;

    // Category tests
    const catResults = await runCategoryTests();
    totalPassed += catResults.passed;
    totalFailed += catResults.failed;

    // Workflow tests
    const wfResults = await runWorkflowTests();
    totalPassed += wfResults.passed;
    totalFailed += wfResults.failed;

    // File integration tests (if EU5 path provided)
    const eu5Path = process.argv[2];
    if (eu5Path && fs.existsSync(eu5Path)) {
        const fileResults = await runFileIntegrationTests(eu5Path);
        totalPassed += fileResults.passed;
        totalFailed += fileResults.failed;
    } else {
        console.log('\n💡 Tip: Pass EU5 path for file integration tests');
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
    console.log('='.repeat(60));

    process.exit(totalFailed > 0 ? 1 : 0);
}

main();
