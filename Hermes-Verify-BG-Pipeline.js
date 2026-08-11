#!/usr/bin/env node
/* hermes-verify-bg-pipeline.js - Verify IMG.LY integration fix */

const fs = require('fs');
const path = require('path');

console.log('=== IMG.LY BACKGROUND REMOVAL FIX VERIFICATION ===\n');

const appPath = path.join(__dirname, 'js/app.js');
let code = '';

try {
    code = fs.readFileSync(appPath, 'utf8');
} catch (e) {
    console.log('Error reading app.js:', e.message);
    process.exit(1);
}

// Check 1: ES module import
console.log('1. ES Module Import:');
if (code.includes('import { removeBackground } from') && 
    code.includes('jsdelivr.net') && 
    code.includes('@imgly/background-removal')) {
    console.log('   ✓ Correct CDN ES module import');
} else {
    console.log('   ✗ Missing or incorrect import');
}

// Check 2: Correct API usage
console.log('\n2. API Usage:');
if (code.includes('await removeBackground(file') && 
    code.includes('model: \'isnet_fp16\'') &&
    code.includes('output: {') &&
    code.includes('format: \'image/png\'')) {
    console.log('   ✓ Uses correct removeBackground(file, options) API');
} else {
    console.log('   ✗ Incorrect API call');
}

// Check 3: Returns Blob
console.log('\n3. Blob Return:');
if (code.includes('const blob = await') && 
    code.includes('blob instanceof Blob')) {
    console.log('   ✓ Handles Blob return type');
} else {
    console.log('   ✗ Missing Blob handling');
}

// Check 4: No old BackgroundRemoval global
console.log('\n4. No Legacy Global:');
if (!code.includes('typeof BackgroundRemoval') && 
    !code.includes('BackgroundRemoval.remove')) {
    console.log('   ✓ Removed old BackgroundRemoval global check');
} else {
    console.log('   ✗ Still using old global pattern');
}

// Check 5: No fallback to original
console.log('\n5. No Original Photo Fallback:');
const renderResultMatches = code.match(/function renderResult[\s\S]*?\{[\s\S]*?state\.cutout/);
if (renderResultMatches && !/state\.photo\.img.*drawImage/.test(code)) {
    console.log('   ✓ Uses cutout, not original photo in renderResult');
} else {
    console.log('   ✗ May still use original photo');
}

// Check 6: Debug mode
console.log('\n6. Debug Mode:');
if (code.includes('window.toggleDebug') && 
    code.includes('checkerboard') &&
    code.includes('ORIGINAL') && 
    code.includes('CUTOUT')) {
    console.log('   ✓ Debug mode with visual verification');
} else {
    console.log('   ✗ Missing debug verification');
}

// Check 7: Error handling
console.log('\n7. Error Handling:');
if (code.includes('Could not isolate the person')) {
    console.log('   ✓ Shows user-friendly error on BG failure');
} else {
    console.log('   ✗ Missing error message');
}

// Check files
console.log('\n8. Asset Files:');
const files = ['front.png', 'back.jpeg'];
files.forEach(f => {
    const exists = fs.existsSync(path.join(__dirname, f));
    console.log('   ' + (exists ? '✓' : '✗') + ' ' + f + (exists ? '' : ' MISSING'));
});

// Check HTML
const htmlPath = path.join(__dirname, 'index.html');
try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    console.log('\n9. HTML Module Script:');
    if (html.includes('<script type="module" src="js/app.js">')) {
        console.log('   ✓ ES module script tag');
    } else {
        console.log('   ✗ Missing module script tag');
    }
    
    console.log('\n10. Screen Visibility:');
    const landingHasNoHidden = !/<section[^>]*id="screen-landing"[^>]*hidden/.test(html);
    const builderHasHidden = /id="screen-builder"[^>]*hidden/.test(html);
    
    console.log('   ' + (landingHasNoHidden ? '✓' : '✗') + ' Landing visible (no hidden attr)');
    console.log('   ' + (builderHasHidden ? '✓' : '✗') + ' Builder hidden by default');
    
} catch(e) {
    console.log('   ✗ Cannot read index.html:', e.message);
}

console.log('\n=== VERIFICATION COMPLETE ===');