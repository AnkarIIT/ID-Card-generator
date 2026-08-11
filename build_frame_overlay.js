import fs from 'fs';
import { PNG } from 'pngjs';

const src = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const W = src.width, H = src.height;

function getPixel(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return { r: 0, g: 0, b: 0, a: 0 };
  const i = (y * W + x) * 4;
  return { r: src.data[i], g: src.data[i + 1], b: src.data[i + 2], a: src.data[i + 3] };
}
function isGold(x, y) {
  const { r, g, b } = getPixel(x, y);
  return r > 110 && g > 70 && b < 170 && r > b;
}

const gold = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isGold(x, y)) gold[y * W + x] = 1;

// Connected components (8-connectivity), full image
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

// Count per-component pixels inside the portrait area, pick the dominant one
const X0 = 480, X1 = 1000, Y0 = 100, Y1 = 900;
const counts = new Map();
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    const c = label[y * W + x];
    if (c === -1) continue;
    counts.set(c, (counts.get(c) || 0) + 1);
  }
}
let best = -1, bestN = 0;
for (const [c, n] of counts) if (n > bestN) { bestN = n; best = c; }
console.log(`Dominant frame component in portrait area: label=${best} portraitPx=${bestN}`);

// Build overlay: ring pixels inside portrait area, template color, alpha 255.
// Dilate by 2px to cover anti-aliased frame edges.
const out = new PNG({ width: W, height: H });
const ring = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (label[y * W + x] === best) ring[y * W + x] = 1;
const D = 2;
const dilated = new Uint8Array(W * H);
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    if (!ring[y * W + x]) continue;
    for (let dy = -D; dy <= D; dy++) {
      for (let dx = -D; dx <= D; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= X0 && nx < X1 && ny >= Y0 && ny < Y1) dilated[ny * W + nx] = 1;
      }
    }
  }
}
let written = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (dilated[y * W + x]) {
      out.data[i] = src.data[i];
      out.data[i + 1] = src.data[i + 1];
      out.data[i + 2] = src.data[i + 2];
      out.data[i + 3] = 255;
      written++;
    } else {
      out.data[i + 3] = 0;
    }
  }
}
fs.writeFileSync('./src/images/front_gold_frame.png', PNG.sync.write(out));
console.log(`Overlay written: src/images/front_gold_frame.png (${written} opaque px)`);

// Stats: overlay bbox
let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (dilated[y * W + x]) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
console.log(`Overlay bbox: X=[${minX}..${maxX}] Y=[${minY}..${maxY}]`);
