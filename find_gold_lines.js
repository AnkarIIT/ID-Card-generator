import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

function isGold(r, g, b) {
  // Gold border lines in front.png have high R & G, low B
  return r > 140 && g > 110 && b < 120;
}

// Trace left column horizontal gold border lines
console.log('--- LEFT COLUMN HORIZONTAL GOLD LINES (x=63..480) ---');
for (let y = 400; y < 1530; y++) {
  let count = 0;
  for (let x = 63; x < 480; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isGold(r, g, b)) count++;
  }
  if (count > 200) {
    console.log(`Left Gold Line Y: ${y} (pixels=${count})`);
  }
}

// Trace right column horizontal gold border lines
console.log('\n--- RIGHT COLUMN HORIZONTAL GOLD LINES (x=495..980) ---');
for (let y = 700; y < 1530; y++) {
  let count = 0;
  for (let x = 495; x < 980; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isGold(r, g, b)) count++;
  }
  if (count > 200) {
    console.log(`Right Gold Line Y: ${y} (pixels=${count})`);
  }
}
