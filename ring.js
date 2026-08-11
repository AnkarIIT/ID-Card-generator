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
function isGold(x, y) {
  const { r, g, b } = getPixel(x, y);
  return r > 110 && g > 70 && b < 170 && r > b;
}

const x0 = 470, x1 = 1000, y0 = 100, y1 = 900;
const W = x1 - x0, H = y1 - y0;
const gold = new Uint8Array(W * H);
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    if (isGold(x, y)) gold[(y - y0) * W + (x - x0)] = 1;
  }
}
const label = new Int32Array(W * H).fill(-1);
let compCount = 0;
for (let i = 0; i < W * H; i++) {
  if (!gold[i] || label[i] !== -1) continue;
  compCount++;
  const stack = [i];
  label[i] = compCount;
  while (stack.length) {
    const p = stack.pop();
    const px = p % W, py = (p - px) / W;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const ni = ny * W + nx;
        if (gold[ni] && label[ni] === -1) { label[ni] = compCount; stack.push(ni); }
      }
    }
  }
}
// Find largest comp label
let maxSize = 0, maxLabel = 0;
for (let c = 1; c <= compCount; c++) {
  let s = 0;
  for (let i = 0; i < W * H; i++) if (label[i] === c) s++;
  if (s > maxSize) { maxSize = s; maxLabel = c; }
}
console.log(`Largest component label=${maxLabel} size=${maxSize}`);
const ring = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) if (label[i] === maxLabel) ring[i] = 1;

// Per-row: min and max X of ring, and whether present
console.log('=== RING per-row extent (left, right) every 5 rows ===');
for (let y = 100; y <= 880; y += 5) {
  let lo = -1, hi = -1, count = 0;
  for (let x = x0; x < x1; x++) {
    if (ring[(y - y0) * W + (x - x0)]) { if (lo === -1) lo = x; hi = x; count++; }
  }
  console.log(`y=${y}: [${lo ?? '-'} .. ${hi ?? '-'}] n=${count}`);
}

// ASCII: ring = #, interior maroon outside ring but inside bbox region = m, other = .
const step = 3;
console.log('\n=== RING SHAPE (step 3, x=480..990, y=110..870) ===');
for (let y = 110; y <= 870; y += step) {
  let line = '';
  for (let x = 480; x <= 990; x += step) {
    const idx = (y - y0) * W + (x - x0);
    if (ring[idx]) { line += '#'; continue; }
    const p = getPixel(x, y);
    if (p.r > 100 && p.g < 80 && p.b > 25 && p.b < 130) line += 'm';
    else line += '.';
  }
  console.log(line);
}
