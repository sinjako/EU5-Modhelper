/**
 * ModWriter Tests for EU5 ModHelper
 * Tests serialization to Paradox script format
 *
 * Usage: node tests/test-mod-writer.js
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js environment
if (typeof window === 'undefined') {
    global.window = { showDirectoryPicker: undefined };
}

// Load test utilities
const { TestRunner, assert, fixtures } = require('./test-utils.js');

// Load CategoryRegistry
const categoryRegistryCode = fs.readFileSync(path.join(__dirname, '../js/category-registry.js'), 'utf8');
const cleanCategoryCode = categoryRegistryCode.replace(/window\.CategoryRegistry\s*=\s*CategoryRegistry;?/, '');
eval(`(function() { ${cleanCategoryCode}; global.CategoryRegistry = CategoryRegistry; })()`);

// Load ModWriter
const modWriterCode = fs.readFileSync(path.join(__dirname, '../js/mod-writer.js'), 'utf8');
const cleanWriterCode = modWriterCode.replace(/window\.ModWriter\s*=\s*ModWriter;?/, '');
eval(`(function() { ${cleanWriterCode}; global.ModWriter = ModWriter; })()`);

const ModWriter = global.ModWriter;
const CategoryRegistry = global.CategoryRegistry;

async function runModWriterTests() {
    const runner = new TestRunner('ModWriter Tests');
    const writer = new ModWriter();

    // ==========================================
    // UTF-8 BOM
    // ==========================================

    runner.test('UTF8_BOM constant is defined', () => {
        assert.equal(writer.UTF8_BOM, '\uFEFF');
    });

    // ==========================================
    // BASIC SERIALIZATION
    // ==========================================

    runner.test('Serialize boolean true as yes', () => {
        const items = { test: { enabled: true } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'enabled = yes');
    });

    runner.test('Serialize boolean false as no', () => {
        const items = { test: { disabled: false } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'disabled = no');
    });

    runner.test('Serialize integer', () => {
        const items = { test: { value: 42 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'value = 42');
    });

    runner.test('Serialize negative integer', () => {
        const items = { test: { value: -17 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'value = -17');
    });

    runner.test('Serialize decimal number', () => {
        const items = { test: { rate: 0.5 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'rate = 0.5');
    });

    runner.test('Serialize simple string', () => {
        const items = { test: { name: 'value' } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'name = value');
    });

    runner.test('Serialize quoted string with spaces', () => {
        const items = { test: { name: 'hello world' } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'name = "hello world"');
    });

    runner.test('Serialize empty string with quotes', () => {
        const items = { test: { name: '' } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'name = ""');
    });

    // ==========================================
    // COLORS
    // ==========================================

    runner.test('Serialize RGB color', () => {
        const items = { test: { color: { _type: 'rgb', r: 255, g: 128, b: 64 } } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'color = rgb { 255 128 64 }');
    });

    runner.test('Serialize HSV color', () => {
        const items = { test: { color: { _type: 'hsv', h: 0.5, s: 0.8, v: 0.9 } } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'color = hsv { 0.50 0.80 0.90 }');
    });

    // ==========================================
    // DATES
    // ==========================================

    runner.test('Serialize date', () => {
        const items = { test: { start: { _type: 'date', value: '1444.11.11' } } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'start = 1444.11.11');
    });

    // ==========================================
    // ARRAYS
    // ==========================================

    runner.test('Serialize empty array', () => {
        const items = { test: { list: [] } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'list = { }');
    });

    runner.test('Serialize simple array', () => {
        const items = { test: { list: ['a', 'b', 'c'] } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'list = { a b c }');
    });

    runner.test('Serialize number array', () => {
        const items = { test: { numbers: [1, 2, 3] } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'numbers = { 1 2 3 }');
    });

    runner.test('Serialize boolean array', () => {
        const items = { test: { flags: [true, false, true] } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'flags = { yes no yes }');
    });

    runner.test('Serialize array with quoted strings', () => {
        const items = { test: { list: ['hello world', 'foo bar'] } };
        const result = writer.generateScript(items, {});
        assert.contains(result, '"hello world"');
        assert.contains(result, '"foo bar"');
    });

    // ==========================================
    // NESTED OBJECTS
    // ==========================================

    runner.test('Serialize nested object', () => {
        const items = { test: { inner: { value: 1 } } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'inner = {');
        assert.contains(result, 'value = 1');
    });

    runner.test('Serialize deeply nested object', () => {
        const items = { test: { a: { b: { c: { value: 'deep' } } } } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'a = {');
        assert.contains(result, 'b = {');
        assert.contains(result, 'c = {');
        assert.contains(result, 'value = deep');
    });

    // ==========================================
    // INTERNAL PROPERTIES
    // ==========================================

    runner.test('Skip internal properties starting with _', () => {
        const items = { test: { _internal: 'skip', visible: 'show' } };
        const result = writer.generateScript(items, {});
        assert.ok(!result.includes('_internal'));
        assert.contains(result, 'visible = show');
    });

    runner.test('Skip _sourceFile property', () => {
        const items = { test: { _sourceFile: 'test.txt', name: 'value' } };
        const result = writer.generateScript(items, {});
        assert.ok(!result.includes('_sourceFile'));
        assert.contains(result, 'name = value');
    });

    runner.test('Skip _modded property', () => {
        const items = { test: { _modded: true, name: 'value' } };
        const result = writer.generateScript(items, {});
        assert.ok(!result.includes('_modded'));
    });

    // ==========================================
    // REPLACE: PREFIX
    // ==========================================

    runner.test('Add REPLACE: prefix for existing items', () => {
        const items = { sand: { value: 100 } };
        const baseItems = { sand: { value: 50 } }; // exists in base
        const result = writer.generateScript(items, baseItems);
        assert.contains(result, 'REPLACE:sand = {');
    });

    runner.test('No prefix for new items', () => {
        const items = { new_item: { value: 100 } };
        const baseItems = { sand: { value: 50 } }; // new_item not in base
        const result = writer.generateScript(items, baseItems);
        assert.contains(result, 'new_item = {');
        assert.ok(!result.includes('REPLACE:new_item'));
    });

    runner.test('Mixed new and existing items', () => {
        const items = {
            sand: { value: 100 },    // existing
            new_good: { value: 50 }  // new
        };
        const baseItems = { sand: { value: 50 } };
        const result = writer.generateScript(items, baseItems);
        assert.contains(result, 'REPLACE:sand = {');
        assert.contains(result, 'new_good = {');
        assert.ok(!result.includes('REPLACE:new_good'));
    });

    // ==========================================
    // HEADER
    // ==========================================

    runner.test('Include header comment', () => {
        const items = { test: { value: 1 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, '# Generated by EU5 ModHelper');
    });

    runner.test('Include date in header', () => {
        const items = { test: { value: 1 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, '# Date:');
    });

    // ==========================================
    // CATEGORY PATHS
    // ==========================================

    runner.test('Get category path for goods', () => {
        const path = writer.getCategoryPath('goods');
        assert.equal(path, 'in_game/common/goods');
    });

    runner.test('Get category path for religions', () => {
        const path = writer.getCategoryPath('religions');
        assert.equal(path, 'in_game/common/religions');
    });

    runner.test('Get category path for unknown category', () => {
        const path = writer.getCategoryPath('nonexistent');
        assert.equal(path, null);
    });

    runner.test('Strip game/ prefix from path', () => {
        // CategoryRegistry paths start with 'game/'
        const path = writer.getCategoryPath('religions');
        assert.ok(!path.startsWith('game/'));
    });

    // ==========================================
    // CATEGORY FILENAMES
    // ==========================================

    runner.test('Get filename for regular category (goods)', () => {
        const filename = writer.getCategoryFileName('goods');
        assert.equal(filename, 'goods_modhelper.txt');
    });

    runner.test('Get filename for specialFile category (locations)', () => {
        const filename = writer.getCategoryFileName('locations');
        assert.equal(filename, 'location_templates.txt');
    });

    runner.test('Get filename for specialFile category (map_definitions)', () => {
        const filename = writer.getCategoryFileName('map_definitions');
        assert.equal(filename, 'definitions.txt');
    });

    runner.test('Get filename for GUI category uses .gui extension', () => {
        const filename = writer.getCategoryFileName('gui_files');
        assert.equal(filename, 'gui_files_modhelper.gui');
    });

    runner.test('Get filename for unknown category', () => {
        const filename = writer.getCategoryFileName('nonexistent');
        assert.equal(filename, 'nonexistent_modhelper.txt');
    });

    // ==========================================
    // MAIN_MENU CATEGORY PATHS
    // ==========================================

    runner.test('Get category path for modifier_types (main_menu)', () => {
        const path = writer.getCategoryPath('modifier_types');
        assert.equal(path, 'main_menu/common/modifier_type_definitions');
    });

    runner.test('Get category path for static_modifiers (main_menu)', () => {
        const path = writer.getCategoryPath('static_modifiers');
        assert.equal(path, 'main_menu/common/static_modifiers');
    });

    runner.test('Get category path for events (in_game, not common)', () => {
        const path = writer.getCategoryPath('events');
        assert.equal(path, 'in_game/events');
    });

    // ==========================================
    // FULL FILE CATEGORIES (map_data)
    // ==========================================

    runner.test('Locations category has requiresFullFile flag', () => {
        const config = CategoryRegistry.get('locations');
        assert.equal(config.requiresFullFile, true);
    });

    runner.test('Map definitions category has requiresFullFile flag', () => {
        const config = CategoryRegistry.get('map_definitions');
        assert.equal(config.requiresFullFile, true);
    });

    runner.test('Regular categories do not have requiresFullFile flag', () => {
        const goods = CategoryRegistry.get('goods');
        const religions = CategoryRegistry.get('religions');
        assert.ok(!goods.requiresFullFile);
        assert.ok(!religions.requiresFullFile);
    });

    runner.test('mergeIntoBase combines base and edited items', () => {
        const base = { a: { value: 1 }, b: { value: 2 }, c: { value: 3 } };
        const edits = { b: { value: 99 } };
        const merged = writer.mergeIntoBase(base, edits);
        assert.equal(Object.keys(merged).length, 3);
        assert.equal(merged.a.value, 1);
        assert.equal(merged.b.value, 99); // edited
        assert.equal(merged.c.value, 3);
    });

    runner.test('mergeIntoBase adds new items from edits', () => {
        const base = { a: { value: 1 } };
        const edits = { b: { value: 2 } };
        const merged = writer.mergeIntoBase(base, edits);
        assert.equal(Object.keys(merged).length, 2);
        assert.ok(merged.a);
        assert.ok(merged.b);
    });

    runner.test('mergeIntoBase skips internal properties from base', () => {
        const base = { a: { value: 1 }, _internal: 'skip' };
        const edits = {};
        const merged = writer.mergeIntoBase(base, edits);
        assert.ok(!merged._internal);
        assert.ok(merged.a);
    });

    runner.test('generateFullFileScript has no REPLACE: prefix', () => {
        const items = { location_a: { climate: 'arctic' }, location_b: { climate: 'tropical' } };
        const result = writer.generateFullFileScript(items, 'locations');
        assert.ok(!result.includes('REPLACE:'));
        assert.contains(result, 'location_a = {');
        assert.contains(result, 'location_b = {');
    });

    runner.test('generateFullFileScript includes category in header', () => {
        const items = { test: { value: 1 } };
        const result = writer.generateFullFileScript(items, 'locations');
        assert.contains(result, '# Full file replacement for locations');
    });

    // ==========================================
    // COMPLEX REAL-WORLD ITEMS
    // ==========================================

    runner.test('Serialize goods definition', () => {
        const items = {
            sand: {
                method: 'gathering',
                category: 'raw_material',
                color: 'goods_sand',
                default_market_price: 0.5,
                base_production: 0.2
            }
        };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'method = gathering');
        assert.contains(result, 'category = raw_material');
        assert.contains(result, 'default_market_price = 0.5');
    });

    runner.test('Serialize religion with color and array', () => {
        const items = {
            catholic: {
                group: 'christian',
                color: { _type: 'rgb', r: 200, g: 180, b: 100 },
                holy_sites: ['rome', 'jerusalem', 'constantinople'],
                fervor: true
            }
        };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'group = christian');
        assert.contains(result, 'color = rgb { 200 180 100 }');
        assert.contains(result, 'holy_sites = { rome jerusalem constantinople }');
        assert.contains(result, 'fervor = yes');
    });

    runner.test('Serialize modifier block', () => {
        const items = {
            advance: {
                modifier: {
                    discipline: 0.05,
                    morale_of_armies: 0.1,
                    land_maintenance_modifier: -0.1
                }
            }
        };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'modifier = {');
        assert.contains(result, 'discipline = 0.05');
        assert.contains(result, 'land_maintenance_modifier = -0.1');
    });

    // ==========================================
    // EDGE CASES
    // ==========================================

    runner.test('Handle null values', () => {
        const items = { test: { value: null, other: 'keep' } };
        const result = writer.generateScript(items, {});
        assert.ok(!result.includes('value = null'));
        assert.contains(result, 'other = keep');
    });

    runner.test('Handle undefined values', () => {
        const items = { test: { value: undefined, other: 'keep' } };
        const result = writer.generateScript(items, {});
        assert.ok(!result.includes('value'));
        assert.contains(result, 'other = keep');
    });

    runner.test('Handle zero value', () => {
        const items = { test: { value: 0 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'value = 0');
    });

    runner.test('Handle empty object', () => {
        const items = { test: { inner: {} } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'inner = {');
        assert.contains(result, '}');
    });

    runner.test('Preserve integer precision', () => {
        const items = { test: { big: 999999999 } };
        const result = writer.generateScript(items, {});
        assert.contains(result, 'big = 999999999');
    });

    runner.test('Limit decimal precision', () => {
        const items = { test: { rate: 0.123456789 } };
        const result = writer.generateScript(items, {});
        // Should not have more than 6 decimal places
        assert.ok(!result.includes('0.123456789'));
    });

    return await runner.run();
}

// Main
async function main() {
    console.log('EU5 ModHelper - ModWriter Tests\n');

    const results = await runModWriterTests();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TOTAL: ${results.passed} passed, ${results.failed} failed`);
    console.log('='.repeat(60));

    process.exit(results.failed > 0 ? 1 : 0);
}

main();
