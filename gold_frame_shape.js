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
function isGold(r, g, b) {
  return r > 120 && g > 85 && b < 160 && r > b && (r - b) > 40;
}

// Flood fill gold from seed on the left band
const seeds = [{ x: 500, y: 500 }, { x: 500, y: 180 }, { x: 925, y: 500 }, { x: 780, y: 200 }, { x: 925, y: 850 }, { x: 515, y: 850 }, { x: 700, y: 900 }];
const visited = new Uint8Array(width * height);
const goldRegion = new Uint8Array(width * height);
const stack = [];
for (const s of seeds) {
  const idx = s.y * width + s.x;
  if (!visited[idx]) { visited[idx] = 1; stack.push(s); }
}
let count = 0;
let minX = width, maxX = -1, minY = height, maxY = -1;
while (stack.length) {
  const { x, y } = stack.pop();
  const idx = y * width + x;
  const { r, g, b } = getPixel(x, y);
  if (!isGold(r, g, b)) continue;
  goldRegion[idx] = 1;
  count++;
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  const nbs = [
    { x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 },
    { x: x - 1, y: y - 1 }, { x: x + 1, y: y - 1 }, { x: x - 1, y: y + 1 }, { x: x + 1, y: y + 1 }
  ];
  for (const n of nbs) {
    if (n.x < 0 || n.x >= width || n.y < 0 || n.y >= height) continue;
    const ni = n.y * width + n.x;
    if (!visited[ni]) { visited[ni] = 1; stack.push(n); }
  }
}
console.log(`Gold region: ${count} px, bbox X=[${minX}..${maxX}] Y=[${minY}..${maxY}]`);

const step = 2;
console.log('\n=== GOLD FRAME SHAPE (2px/char) ===');
for (let y = 130; y <= 870; y += step) {
  let line = '';
  for (let x = 480; x <= 990; x += step) {
    const idx = y * width + x;
    if (goldRegion[idx]) line += '#';
    else line += '.';
  }
  console.log(line);
}
