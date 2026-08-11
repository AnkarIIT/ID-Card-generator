// Ad-hoc verification: Background Removal Pipeline
const fs = require('fs');
const path = require('path');

console.log('=== BACKGROUND REMOVAL PIPELINE VERIFICATION ===\n');

const appPath = 'js/app.js';
let code = '';
try {
    code = fs.readFileSync(appPath, 'utf8');
} catch (e) {
    console.log('Error reading file:', e.message);
    process.exit(1);
}

const checks = [
    // Core pipeline functions
    ['loadTemplate()', /function loadTemplate\s*\(/],
    ['removeBackground()', /function removeBackground\s*\(/],
    ['verifyAlphaChannel()', /function verifyAlphaChannel\s*\(/],
    ['findSubjectBounds()', /function findSubjectBounds\s*\(/],
    ['createCutoutCanvas()', /function createCutoutCanvas\s*\(/],
    
    // Critical requirements
    ['Template from ./front.png', /img\.src\s*=\s*['"]\.\/front\.png['"]/],
    ['Handles ImageData result', /ImageData/],
    ['Handles Image result', /result\.constructor\.name/],
    ['Handles Canvas result', /HTMLCanvasElement/],
    ['Handles string/base64', /typeof result\s*===\s*['"]string['"]/],
    ['Alpha threshold > 20 (soft)', /alpha\s*>\s*20/],
    ['Checkerboard visualization', /checkerboard|#ccc|#999/],
    ['Debug mode toggle', /window\.toggleDebug|\.debugMode/],
];

// Check NO fallback to original photo in rendering
const noFallback = !/ctx\.drawImage\s*\(\s*state\.photo\.img/gm.test(code);

let passed = 0, failed = 0;

console.log('Function implementations:');
checks.forEach(([name, pattern]) => {
    if (pattern.test(code)) {
        console.log('  ✓', name);
        passed++;
    } else {
        console.log('  ✗', name, 'MISSING');
        failed++;
    }
});

console.log('\nCritical requirements:');
if (noFallback) {
    console.log('  ✓ No fallback to original photo in rendering');
    passed++;
} else {
    console.log('  ✗ Fallback to original photo detected');
    failed++;
}

// Check no 50% threshold
const hasBadThreshold = /transparencyRatio.*0\.5|0\.5.*transparencyRatio|50%/.test(code);
if (!hasBadThreshold) {
    console.log('  ✓ No arbitrary 50% transparency rejection');
    passed++;
} else {
    console.log('  ✗ Still uses 50% threshold');
    failed++;
}

console.log('\n=== RESULTS: ' + passed + ' passed, ' + failed + ' failed ===\n');

// Check files exist
const files = ['front.png', 'back.jpeg'];
files.forEach(f => {
    try {
        if (fs.existsSync(f)) {
            const stat = fs.statSync(f);
            console.log('  ✓ ' + f + ' (' + Math.round(stat.size/1024) + 'KB)');
        } else {
            console.log('  ✗ ' + f + ' missing');
        }
    } catch(e) {
        console.log('  ✗ ' + f + ' error: ' + e.message);
    }
});

process.exit(failed > 0 ? 1 : 0);