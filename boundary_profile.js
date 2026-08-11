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
function isInterior(r, g, b) {
  return r > 100 && g < 80 && b > 25 && b < 130;
}

// For each row, find interior span (simple scanline, using seed-based connectivity not needed)
// Build per-row min/max of maroon-ish pixels in arch band
console.log('=== ROW PROFILE (left/right interior boundary) ===');
let last = '';
let changedCount = 0;
for (let y = 140; y <= 860; y += 1) {
  let lo = -1, hi = -1;
  for (let x = 470; x <= 960; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isInterior(r, g, b)) {
      if (lo === -1) lo = x;
      hi = x;
    }
  }
  const sig = lo === -1 ? 'none' : `${lo},${hi}`;
  if (sig !== last) {
    if (last !== '') console.log(`Y=${y - 1}: last=[${last}]`);
    console.log(`Y=${y}: [${sig}]`);
    last = sig;
    changedCount++;
  }
}
console.log(`Y=860: last=[${last}]`);
console.log(`\nChanged ${changedCount} times`);
