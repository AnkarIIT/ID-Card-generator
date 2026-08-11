import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

console.log(`Analyzing ${width}x${height} template image...`);

// Helper to get RGB
function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}

// Check if pixel is gold border (high R and G, lower B)
function isGoldBorder(r, g, b) {
  return r > 160 && g > 130 && b < 140 && Math.abs(r - g) < 60;
}

// Check if pixel is pink arch area
function isPink(r, g, b) {
  return r > 180 && g < 120 && b > 100;
}

// Check if pixel is dark background inside boxes
function isDarkBackground(r, g, b) {
  return r < 35 && g < 55 && b < 45;
}

// Scan horizontal line across left column (X around 50 to 480)
// Scan horizontal line across right column (X around 490 to 980)

// Let's find gold border lines!
console.log('\n--- Scanning Left Column Outer Gold Borders (around X = 60..480) ---');
for (let y = 450; y < 1530; y++) {
  // scan across x = 60..480 at this Y
  let goldPixels = 0;
  for (let x = 63; x < 486; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isGoldBorder(r, g, b)) goldPixels++;
  }
  if (goldPixels > 250) {
    console.log(`Horizontal Gold Border Line at Y = ${y} (gold pixels: ${goldPixels})`);
  }
}

console.log('\n--- Scanning Right Column Outer Gold Borders (around X = 490..980) ---');
for (let y = 750; y < 1530; y++) {
  let goldPixels = 0;
  for (let x = 495; x < 982; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isGoldBorder(r, g, b)) goldPixels++;
  }
  if (goldPixels > 200) {
    console.log(`Horizontal Gold Border Line at Y = ${y} (gold pixels: ${goldPixels})`);
  }
}

// Find Pink Arch Bounds
console.log('\n--- Scanning Pink Arch Bounds ---');
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
let pinkCount = 0;
for (let y = 150; y < 850; y++) {
  for (let x = 480; x < 980; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isPink(r, g, b)) {
      pinkCount++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`Pink Arch Region: X = [${minX}..${maxX}] (w=${maxX - minX + 1}), Y = [${minY}..${maxY}] (h=${maxY - minY + 1}), Total Pink Pixels = ${pinkCount}`);
