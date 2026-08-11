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
  // maroon interior: high red, low green, medium-low blue
  return r > 100 && g < 80 && b > 25 && b < 130;
}

// Flood fill from seed
const seed = { x: 715, y: 500 };
const visited = new Uint8Array(width * height);
const region = new Uint8Array(width * height);
const stack = [seed];
visited[seed.y * width + seed.x] = 1;
let count = 0;
let minX = width, maxX = -1, minY = height, maxY = -1;

while (stack.length) {
  const { x, y } = stack.pop();
  const idx = y * width + x;
  const { r, g, b } = getPixel(x, y);
  if (!isInterior(r, g, b)) continue;
  region[idx] = 1;
  count++;
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; stack.push({ x: x - 1, y }); }
  if (x < width - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; stack.push({ x: x + 1, y }); }
  if (y > 0 && !visited[idx - width]) { visited[idx - width] = 1; stack.push({ x, y: y - 1 }); }
  if (y < height - 1 && !visited[idx + width]) { visited[idx + width] = 1; stack.push({ x, y: y + 1 }); }
}

console.log(`Region size: ${count} px, bbox X=[${minX}..${maxX}] Y=[${minY}..${maxY}]`);

// ASCII visualization at ~2px resolution
const step = 2;
console.log('\n=== ASCII MAP (2px per char) ===');
const chars = [];
for (let y = 90; y <= 950; y += step) {
  let line = '';
  for (let x = 470; x <= 1000; x += step) {
    const idx = y * width + x;
    if (region[idx]) {
      // check if boundary
      line += '#';
    } else {
      const { r, g, b } = getPixel(x, y);
      if (r > 120 && g > 85 && b < 160 && r > b) line += 'G';
      else if (r < 45 && g < 65 && b < 55) line += '.';
      else if (r > 100 && g < 80 && b > 25 && b < 130) line += 'r';
      else line += ' ';
    }
  }
  chars.push(line);
}
console.log(chars.join('\n'));

// Save region mask as PNG for further analysis
const out = new PNG({ width, height });
for (let i = 0; i < width * height; i++) {
  if (region[i]) {
    out.data[i * 4] = 255; out.data[i * 4 + 1] = 0; out.data[i * 4 + 2] = 0; out.data[i * 4 + 3] = 255;
  } else {
    out.data[i * 4] = 0; out.data[i * 4 + 1] = 0; out.data[i * 4 + 2] = 0; out.data[i * 4 + 3] = 0;
  }
}
fs.writeFileSync('./src/images/portrait_mask_debug.png', PNG.sync.write(out));
console.log('\nMask saved to src/images/portrait_mask_debug.png');
