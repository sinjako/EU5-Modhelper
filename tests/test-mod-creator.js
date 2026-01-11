/**
 * ModCreator Tests for EU5 ModHelper
 * Tests mod folder structure generation
 *
 * Usage: node tests/test-mod-creator.js
 */

const fs = require('fs');
const path = require('path');

// Mock window for Node.js environment
if (typeof window === 'undefined') {
    global.window = { showDirectoryPicker: undefined };
}

// Load test utilities
const { TestRunner, assert, fixtures } = require('./test-utils.js');

// Load ModCreator
const modCreatorCode = fs.readFileSync(path.join(__dirname, '../js/mod-creator.js'), 'utf8');
const cleanCreatorCode = modCreatorCode.replace(/window\.ModCreator\s*=\s*ModCreator;?/, '');
eval(`(function() { ${cleanCreatorCode}; global.ModCreator = ModCreator; })()`);

const ModCreator = global.ModCreator;

async function runModCreatorTests() {
    const runner = new TestRunner('ModCreator Tests');
    const creator = new ModCreator();

    // ==========================================
    // ID GENERATION
    // ==========================================

    runner.test('Generate ID from simple name', () => {
        const id = creator.generateId('My Mod');
        assert.equal(id, 'my_mod');
    });

    runner.test('Generate ID removes special characters', () => {
        const id = creator.generateId('My Mod! @#$%');
        assert.equal(id, 'my_mod_');
    });

    runner.test('Generate ID from uppercase name', () => {
        const id = creator.generateId('TEST MOD');
        assert.equal(id, 'test_mod');
    });

    runner.test('Generate ID handles multiple spaces', () => {
        const id = creator.generateId('My   Big   Mod');
        assert.equal(id, 'my_big_mod');
    });

    runner.test('Generate ID truncates long names', () => {
        const longName = 'A'.repeat(100);
        const id = creator.generateId(longName);
        assert.ok(id.length <= 50);
    });

    runner.test('Generate ID from numbers', () => {
        const id = creator.generateId('Mod 123');
        assert.contains(id, 'mod');
        assert.contains(id, '123');
    });

    // ==========================================
    // METADATA CREATION
    // ==========================================

    runner.test('Create metadata with required fields', () => {
        const config = {
            name: 'Test Mod',
            id: 'test_mod',
            version: '1.0.0',
            gameVersion: '1.0.*',
            description: 'A test mod',
            tags: ['Gameplay']
        };
        const metadata = creator.createMetadata(config);
        const parsed = JSON.parse(metadata);

        assert.equal(parsed.name, 'Test Mod');
        assert.equal(parsed.id, 'test_mod');
        assert.equal(parsed.version, '1.0.0');
        assert.equal(parsed.supported_game_version, '1.0.*');
    });

    runner.test('Create metadata with tags', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: ['Gameplay', 'Balance']
        };
        const metadata = creator.createMetadata(config);
        const parsed = JSON.parse(metadata);

        assert.isArray(parsed.tags);
        assert.lengthOf(parsed.tags, 2);
        assert.equal(parsed.tags[0], 'Gameplay');
    });

    runner.test('Create metadata with empty tags', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const metadata = creator.createMetadata(config);
        const parsed = JSON.parse(metadata);

        assert.isArray(parsed.tags);
        assert.lengthOf(parsed.tags, 0);
    });

    runner.test('Create metadata includes game_custom_data', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const metadata = creator.createMetadata(config);
        const parsed = JSON.parse(metadata);

        assert.hasProperty(parsed, 'game_custom_data');
        assert.equal(parsed.game_custom_data.multiplayer_synchronized, true);
    });

    runner.test('Create metadata includes relationships', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const metadata = creator.createMetadata(config);
        const parsed = JSON.parse(metadata);

        assert.hasProperty(parsed, 'relationships');
        assert.isArray(parsed.relationships);
    });

    runner.test('Create metadata is valid JSON', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const metadata = creator.createMetadata(config);

        assert.doesNotThrow(() => JSON.parse(metadata));
    });

    // ==========================================
    // DESCRIPTOR CREATION
    // ==========================================

    runner.test('Create descriptor with basic fields', () => {
        const config = {
            name: 'Test Mod',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: ['Gameplay']
        };
        const descriptor = creator.createDescriptor(config);

        assert.contains(descriptor, 'version="1.0.0"');
        assert.contains(descriptor, 'name="Test Mod"');
        assert.contains(descriptor, 'supported_version="1.0.*"');
    });

    runner.test('Create descriptor with tags block', () => {
        const config = {
            name: 'Test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: ['Gameplay', 'Balance']
        };
        const descriptor = creator.createDescriptor(config);

        assert.contains(descriptor, 'tags={');
        assert.contains(descriptor, '"Gameplay"');
        assert.contains(descriptor, '"Balance"');
    });

    runner.test('Create descriptor with default tag when empty', () => {
        const config = {
            name: 'Test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const descriptor = creator.createDescriptor(config);

        assert.contains(descriptor, 'tags={');
        assert.contains(descriptor, '"Gameplay"');
    });

    runner.test('Create descriptor with path when provided', () => {
        const config = {
            name: 'Test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const descriptor = creator.createDescriptor(config, 'C:/path/to/mod');

        assert.contains(descriptor, 'path="C:/path/to/mod"');
    });

    runner.test('Create descriptor converts backslashes in path', () => {
        const config = {
            name: 'Test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: []
        };
        const descriptor = creator.createDescriptor(config, 'C:\\path\\to\\mod');

        assert.contains(descriptor, 'path="C:/path/to/mod"');
        assert.ok(!descriptor.includes('\\'));
    });

    // ==========================================
    // README CREATION
    // ==========================================

    runner.test('Create README with mod name', () => {
        const config = {
            name: 'Test Mod',
            id: 'test_mod',
            version: '1.0.0',
            gameVersion: '1.0.*',
            description: 'A test mod',
            folders: []
        };
        const readme = creator.createReadme(config);

        assert.contains(readme, '# Test Mod');
    });

    runner.test('Create README with description', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            description: 'My custom description',
            folders: []
        };
        const readme = creator.createReadme(config);

        assert.contains(readme, 'My custom description');
    });

    runner.test('Create README with default description when empty', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            description: '',
            folders: []
        };
        const readme = creator.createReadme(config);

        assert.contains(readme, 'A mod for Europa Universalis V');
    });

    runner.test('Create README includes version info', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '2.5.0',
            gameVersion: '1.1.*',
            folders: []
        };
        const readme = creator.createReadme(config);

        assert.contains(readme, '2.5.0');
        assert.contains(readme, '1.1.*');
    });

    // ==========================================
    // FILE LIST GENERATION
    // ==========================================

    runner.test('Get file list includes required files', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: []
        };
        const files = creator.getFileList(config);

        const paths = files.map(f => f.path);
        assert.ok(paths.includes('.metadata/metadata.json'));
        assert.ok(paths.includes('descriptor.mod'));
        assert.ok(paths.includes('README.md'));
    });

    runner.test('Get file list with common folder', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: ['common']
        };
        const files = creator.getFileList(config);

        const paths = files.map(f => f.path);
        assert.ok(paths.includes('in_game/common/.gitkeep'));
    });

    runner.test('Get file list with events folder', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: ['events']
        };
        const files = creator.getFileList(config);

        const paths = files.map(f => f.path);
        assert.ok(paths.includes('in_game/events/.gitkeep'));
    });

    runner.test('Get file list with localization folder', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: ['localization']
        };
        const files = creator.getFileList(config);

        const paths = files.map(f => f.path);
        assert.ok(paths.includes('in_game/localization/.gitkeep'));
        assert.ok(paths.includes('in_game/localization/english/.gitkeep'));
    });

    runner.test('Get file list with multiple folders', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: ['common', 'events', 'gfx', 'gui']
        };
        const files = creator.getFileList(config);

        const paths = files.map(f => f.path);
        assert.ok(paths.includes('in_game/common/.gitkeep'));
        assert.ok(paths.includes('in_game/events/.gitkeep'));
        assert.ok(paths.includes('in_game/gfx/.gitkeep'));
        assert.ok(paths.includes('in_game/gui/.gitkeep'));
    });

    runner.test('File list files have content', () => {
        const config = {
            name: 'Test',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*',
            tags: [],
            folders: []
        };
        const files = creator.getFileList(config);

        for (const file of files) {
            assert.ok(file.content !== undefined);
            assert.ok(file.content.length > 0);
        }
    });

    // ==========================================
    // VALIDATION
    // ==========================================

    runner.test('Validate throws for missing name', async () => {
        const config = {
            name: '',
            id: 'test',
            version: '1.0.0',
            gameVersion: '1.0.*'
        };

        let threw = false;
        try {
            await creator.createMod(config);
        } catch (e) {
            threw = true;
            assert.contains(e.message, 'required');
        }
        assert.ok(threw);
    });

    runner.test('Validate throws for missing ID', async () => {
        const config = {
            name: 'Test',
            id: '',
            version: '1.0.0',
            gameVersion: '1.0.*'
        };

        let threw = false;
        try {
            await creator.createMod(config);
        } catch (e) {
            threw = true;
            assert.contains(e.message, 'required');
        }
        assert.ok(threw);
    });

    return await runner.run();
}

// Main
async function main() {
    console.log('EU5 ModHelper - ModCreator Tests\n');

    const results = await runModCreatorTests();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TOTAL: ${results.passed} passed, ${results.failed} failed`);
    console.log('='.repeat(60));

    process.exit(results.failed > 0 ? 1 : 0);
}

main();
