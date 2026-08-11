import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return { r: 255, g: 255, b: 255 };
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
}
function isInterior(r, g, b) {
  return r > 100 && g < 80 && b > 25 && b < 130;
}
function isGold(r, g, b) {
  return r > 120 && g > 85 && b < 160 && r > b && (r - b) > 40;
}

const seed = { x: 715, y: 500 };
const visited = new Uint8Array(width * height);
const mask = new Uint8Array(width * height);
const stack = [seed];
visited[seed.y * width + seed.x] = 1;
let count = 0;
let minX = width, maxX = -1, minY = height, maxY = -1;

function push(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * width + x;
  if (visited[idx]) return;
  const { r, g, b } = getPixel(x, y);
  if (isGold(r, g, b)) return;
  visited[idx] = 1;
  if (isInterior(r, g, b)) {
    mask[idx] = 1;
    count++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  stack.push({ x, y });
}

while (stack.length) {
  const { x, y } = stack.pop();
  push(x - 1, y);
  push(x + 1, y);
  push(x, y - 1);
  push(x, y + 1);
}

console.log(`Interior mask: ${count} px, bbox X=[${minX}..${maxX}] Y=[${minY}..${maxY}]`);

// Save mask PNG
const out = new PNG({ width, height });
for (let i = 0; i < width * height; i++) {
  if (mask[i]) {
    out.data[i * 4] = 255; out.data[i * 4 + 1] = 0; out.data[i * 4 + 2] = 0; out.data[i * 4 + 3] = 255;
  } else {
    out.data[i * 4 + 3] = 0;
  }
}
fs.writeFileSync('./src/images/portrait_interior_mask.png', PNG.sync.write(out));
console.log('Mask saved to src/images/portrait_interior_mask.png');

// Per-row boundary of the interior mask
console.log('\n=== ROW PROFILE of interior mask ===');
let last = '';
for (let y = 130; y <= 880; y++) {
  let lo = -1, hi = -1;
  for (let x = 470; x <= 990; x++) {
    if (mask[y * width + x]) {
      if (lo === -1) lo = x;
      hi = x;
    }
  }
  const sig = lo === -1 ? 'none' : `${lo},${hi}`;
  if (sig !== last) {
    if (last !== '') console.log(`Y=${y - 1}: [${last}]`);
    console.log(`Y=${y}: [${sig}]`);
    last = sig;
  }
}
console.log(`Y=880: [${last}]`);
