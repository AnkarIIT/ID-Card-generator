import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0 };
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
}

function isDarkBg(x, y) {
  const { r, g, b } = getPixel(x, y);
  // Dark green/black background inside sections
  return r < 40 && g < 60 && b < 50;
}

// Let's inspect vertical lines at X=70, X=200, X=450 (Left Column)
// and X=510, X=700, X=950 (Right Column)
console.log('=== LEFT COLUMN VERTICAL COLOR MAP AT X=250 ===');
let inBox = false;
let startY = 0;
for (let y = 460; y <= 1525; y++) {
  const dark = isDarkBg(250, y);
  if (dark && !inBox) {
    inBox = true;
    startY = y;
  } else if (!dark && inBox) {
    inBox = false;
    console.log(`Left Box: Y = ${startY} to ${y - 1} (height: ${y - startY})`);
  }
}
if (inBox) console.log(`Left Box: Y = ${startY} to 1525 (height: ${1525 - startY})`);

console.log('\n=== RIGHT COLUMN VERTICAL COLOR MAP AT X=700 ===');
inBox = false;
startY = 0;
for (let y = 800; y <= 1525; y++) {
  const dark = isDarkBg(700, y);
  if (dark && !inBox) {
    inBox = true;
    startY = y;
  } else if (!dark && inBox) {
    inBox = false;
    console.log(`Right Box: Y = ${startY} to ${y - 1} (height: ${y - startY})`);
  }
}
if (inBox) console.log(`Right Box: Y = ${startY} to 1525 (height: ${1525 - startY})`);
