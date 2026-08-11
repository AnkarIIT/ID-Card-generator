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

const seed = { x: 715, y: 500 };
const visited = new Uint8Array(width * height);
const region = new Uint8Array(width * height);
const stack = [seed];
visited[seed.y * width + seed.x] = 1;
while (stack.length) {
  const { x, y } = stack.pop();
  const idx = y * width + x;
  const { r, g, b } = getPixel(x, y);
  if (!isInterior(r, g, b)) continue;
  region[idx] = 1;
  if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; stack.push({ x: x - 1, y }); }
  if (x < width - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; stack.push({ x: x + 1, y }); }
  if (y > 0 && !visited[idx - width]) { visited[idx - width] = 1; stack.push({ x, y: y - 1 }); }
  if (y < height - 1 && !visited[idx + width]) { visited[idx + width] = 1; stack.push({ x, y: y + 1 }); }
}

const step = 2;
console.log('=== REGION SHAPE (2px/char, # = interior, G = gold, . = dark/other) ===');
for (let y = 130; y <= 900; y += step) {
  let line = '';
  for (let x = 470; x <= 1000; x += step) {
    const idx = y * width + x;
    if (region[idx]) {
      line += '#';
    } else {
      const { r, g, b } = getPixel(x, y);
      if (r > 120 && g > 85 && b < 160 && r > b) line += 'G';
      else line += '.';
    }
  }
  console.log(line);
}
