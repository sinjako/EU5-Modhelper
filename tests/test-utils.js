/**
 * Test Utilities for EU5 ModHelper
 * Provides a lightweight test framework that works in both Node.js and browser
 */

class TestRunner {
    constructor(name) {
        this.name = name;
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        // Check for actual browser environment (has document), not just window mock
        this.isBrowser = typeof document !== 'undefined' && typeof document.getElementById === 'function';
    }

    /**
     * Add a test
     */
    test(name, fn, options = {}) {
        this.tests.push({ name, fn, options });
    }

    /**
     * Add a test that should be skipped
     */
    skip(name, fn) {
        this.tests.push({ name, fn, options: { skip: true } });
    }

    /**
     * Add a test that tests for expected failure
     */
    shouldFail(name, fn) {
        this.tests.push({ name, fn, options: { shouldFail: true } });
    }

    /**
     * Run all tests
     */
    async run() {
        this.log(`\n${'='.repeat(60)}`);
        this.log(`Running: ${this.name}`);
        this.log('='.repeat(60));

        for (const test of this.tests) {
            await this.runTest(test);
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        const { name, fn, options } = test;

        if (options.skip) {
            this.results.skipped++;
            this.log(`  ⏭ SKIP: ${name}`);
            return;
        }

        try {
            await fn();

            if (options.shouldFail) {
                this.results.failed++;
                this.results.errors.push({ name, error: 'Expected test to fail but it passed' });
                this.log(`  ✗ FAIL: ${name} (expected failure)`);
            } else {
                this.results.passed++;
                this.log(`  ✓ PASS: ${name}`);
            }
        } catch (err) {
            if (options.shouldFail) {
                this.results.passed++;
                this.log(`  ✓ PASS: ${name} (failed as expected)`);
            } else {
                this.results.failed++;
                this.results.errors.push({ name, error: err.message, stack: err.stack });
                this.log(`  ✗ FAIL: ${name}`);
                this.log(`         ${err.message}`);
            }
        }
    }

    /**
     * Print summary
     */
    printSummary() {
        this.log('\n' + '-'.repeat(60));
        this.log(`Results: ${this.results.passed} passed, ${this.results.failed} failed, ${this.results.skipped} skipped`);

        if (this.results.errors.length > 0) {
            this.log('\nFailures:');
            for (const { name, error } of this.results.errors) {
                this.log(`  - ${name}: ${error}`);
            }
        }
        this.log('-'.repeat(60));
    }

    /**
     * Log output
     */
    log(msg) {
        console.log(msg);
        // In browser, also append to results div if it exists
        if (this.isBrowser) {
            const resultsDiv = document.getElementById('test-results');
            if (resultsDiv) {
                resultsDiv.innerHTML += msg + '\n';
            }
        }
    }
}

/**
 * Assertion helpers
 */
const assert = {
    equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },

    deepEqual(actual, expected, message = '') {
        const actualStr = JSON.stringify(actual, null, 2);
        const expectedStr = JSON.stringify(expected, null, 2);
        if (actualStr !== expectedStr) {
            throw new Error(`${message}\nExpected:\n${expectedStr}\n\nActual:\n${actualStr}`);
        }
    },

    notEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(`${message} Expected values to be different, both are ${JSON.stringify(actual)}`);
        }
    },

    ok(value, message = '') {
        if (!value) {
            throw new Error(`${message} Expected truthy value, got ${JSON.stringify(value)}`);
        }
    },

    notOk(value, message = '') {
        if (value) {
            throw new Error(`${message} Expected falsy value, got ${JSON.stringify(value)}`);
        }
    },

    throws(fn, message = '') {
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new Error(`${message} Expected function to throw`);
        }
    },

    doesNotThrow(fn, message = '') {
        try {
            fn();
        } catch (e) {
            throw new Error(`${message} Expected function not to throw, but it threw: ${e.message}`);
        }
    },

    contains(str, substring, message = '') {
        if (!str.includes(substring)) {
            throw new Error(`${message} Expected "${str}" to contain "${substring}"`);
        }
    },

    hasProperty(obj, prop, message = '') {
        if (!(prop in obj)) {
            throw new Error(`${message} Expected object to have property "${prop}"`);
        }
    },

    isType(value, type, message = '') {
        const actualType = typeof value;
        if (actualType !== type) {
            throw new Error(`${message} Expected type "${type}", got "${actualType}"`);
        }
    },

    isArray(value, message = '') {
        if (!Array.isArray(value)) {
            throw new Error(`${message} Expected array, got ${typeof value}`);
        }
    },

    lengthOf(arr, length, message = '') {
        if (arr.length !== length) {
            throw new Error(`${message} Expected length ${length}, got ${arr.length}`);
        }
    },

    approximately(actual, expected, delta, message = '') {
        if (Math.abs(actual - expected) > delta) {
            throw new Error(`${message} Expected ${actual} to be within ${delta} of ${expected}`);
        }
    }
};

/**
 * Test fixtures - sample data for testing
 */
const fixtures = {
    // Simple Paradox script samples
    simpleKeyValue: `
        name = "Test"
        value = 123
        enabled = yes
        disabled = no
    `,

    nestedBlock: `
        outer = {
            inner = {
                value = "deep"
            }
            sibling = 42
        }
    `,

    arraySimple: `
        list = { a b c }
        numbers = { 1 2 3 }
    `,

    arrayComplex: `
        items = {
            { name = "first" value = 1 }
            { name = "second" value = 2 }
        }
    `,

    colors: `
        rgb_color = rgb { 255 128 64 }
        hsv_color = hsv { 0.5 0.8 0.9 }
    `,

    dates: `
        start_date = 1444.11.11
        end_date = 1821.1.1
    `,

    numbers: `
        integer = 42
        negative = -17
        decimal = 3.14159
        scientific = 1e6
        zero = 0
    `,

    strings: `
        simple = unquoted
        quoted = "with spaces"
        special = "quotes: \\"escaped\\""
        empty = ""
    `,

    comments: `
        # This is a comment
        value = 123 # inline comment
        # Another comment
        other = "test"
    `,

    // Complex real-world-like sample
    complexItem: `
        sand = {
            method = gathering
            category = raw_material
            color = goods_sand
            default_market_price = 0.5
            base_production = 0.2
            modifiers = {
                local_goods_production = 0.1
                province_trade_power = 5
            }
            triggers = {
                OR = {
                    has_terrain = desert
                    has_terrain = coastal_desert
                }
            }
        }
    `,

    // Sample mod metadata
    modMetadata: {
        name: "Test Mod",
        id: "test_mod",
        version: "1.0.0",
        supported_game_version: "1.0.*",
        short_description: "A test mod",
        tags: ["Gameplay", "Balance"],
        relationships: [],
        game_custom_data: {
            multiplayer_synchronized: true
        }
    },

    // Sample mod descriptor
    modDescriptor: `version="1.0.0"
tags={
\t"Gameplay"
\t"Balance"
}
name="Test Mod"
supported_version="1.0.*"
`
};

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestRunner, assert, fixtures };
} else {
    window.TestRunner = TestRunner;
    window.assert = assert;
    window.fixtures = fixtures;
}
