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

// Only portrait area: x in [470,1000], y in [100,900]
const x0 = 470, x1 = 1000, y0 = 100, y1 = 900;
const W = x1 - x0, H = y1 - y0;
const gold = new Uint8Array(W * H);
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    if (isGold(x, y)) gold[(y - y0) * W + (x - x0)] = 1;
  }
}

// Connected components (8-connectivity)
const label = new Int32Array(W * H).fill(-1);
let compCount = 0;
const sizes = [];
for (let i = 0; i < W * H; i++) {
  if (!gold[i] || label[i] !== -1) continue;
  compCount++;
  let size = 0;
  const stack = [i];
  label[i] = compCount;
  while (stack.length) {
    const p = stack.pop();
    size++;
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
  sizes.push(size);
}
const sorted = sizes.slice().sort((a, b) => b - a);
console.log(`Total gold px in portrait area: ${gold.reduce((a, b) => a + b, 0)}`);
console.log(`Components: ${compCount}`);
console.log(`Top 12 sizes: ${sorted.slice(0, 12).join(', ')}`);

// Bounding boxes + per-component analysis for top components
const boxes = new Map();
for (let i = 0; i < W * H; i++) {
  if (label[i] === -1) continue;
  const c = label[i];
  if (!boxes.has(c)) boxes.set(c, { minX: 1e9, maxX: -1, minY: 1e9, maxY: -1 });
  const b = boxes.get(c);
  const px = i % W, py = (i - px) / W;
  if (px < b.minX) b.minX = px;
  if (px > b.maxX) b.maxX = px;
  if (py < b.minY) b.minY = py;
  if (py > b.maxY) b.maxY = py;
}
// Print top components with their info
for (const c of sorted.slice(0, 12)) {
  const comp = [...boxes.entries()].find(([k, v]) => v.size === undefined || true);
}
// Recompute with size attached
const compInfo = [];
for (const [c, b] of boxes.entries()) {
  compInfo.push({ c, size: sizes[c - 1], minX: b.minX + x0, maxX: b.maxX + x0, minY: b.minY + y0, maxY: b.maxY + y0 });
}
compInfo.sort((a, b) => b.size - a.size);
for (const ci of compInfo.slice(0, 12)) {
  console.log(`#${ci.c} size=${ci.size} bbox X=[${ci.minX}..${ci.maxX}] Y=[${ci.minY}..${ci.maxY}]`);
}
