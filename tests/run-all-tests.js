/**
 * Unified Test Runner for EU5 ModHelper
 * Runs all test suites and provides summary
 *
 * Usage: node tests/run-all-tests.js [EU5_PATH]
 */

const { spawn } = require('child_process');
const path = require('path');

const testFiles = [
    'test-parser.js',
    'test-mod-writer.js',
    'test-mod-creator.js',
    'test-integration.js'
];

async function runTest(testFile, eu5Path) {
    return new Promise((resolve) => {
        const args = [path.join(__dirname, testFile)];
        if (eu5Path) {
            args.push(eu5Path);
        }

        const proc = spawn('node', args, {
            stdio: 'inherit'
        });

        proc.on('close', (code) => {
            resolve({ file: testFile, passed: code === 0 });
        });

        proc.on('error', (err) => {
            console.error(`Failed to run ${testFile}:`, err);
            resolve({ file: testFile, passed: false });
        });
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          EU5 ModHelper - Complete Test Suite               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const eu5Path = process.argv[2];

    if (eu5Path) {
        console.log(`EU5 Path: ${eu5Path}\n`);
    } else {
        console.log('No EU5 path provided - file tests will be skipped\n');
    }

    const results = [];

    for (const testFile of testFiles) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`Running: ${testFile}`);
        console.log('─'.repeat(60));

        const result = await runTest(testFile, eu5Path);
        results.push(result);
    }

    // Summary
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                     SUMMARY                                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');

    let allPassed = true;
    for (const result of results) {
        const status = result.passed ? '✓ PASS' : '✗ FAIL';
        const padding = ' '.repeat(Math.max(0, 45 - result.file.length));
        console.log(`║ ${result.file}${padding}${status}     ║`);
        if (!result.passed) allPassed = false;
    }

    console.log('╚════════════════════════════════════════════════════════════╝');

    if (allPassed) {
        console.log('\n🎉 All test suites passed!\n');
    } else {
        console.log('\n❌ Some test suites failed.\n');
    }

    process.exit(allPassed ? 0 : 1);
}

main();
