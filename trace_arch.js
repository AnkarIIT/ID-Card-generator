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

function isRed(r, g, b) {
  return r > 90 && g < 90 && b > 25 && b < 130;
}
function isGold(r, g, b) {
  return r > 120 && g > 85 && b < 160 && r > b;
}

// Scan each row: find red span and gold span, plus the boundary between red and gold
console.log('Y | redMin redMax | goldMin goldMax | leftBoundary rightBoundary');
for (let y = 140; y <= 920; y += 4) {
  let redMin = -1, redMax = -1;
  let goldMin = -1, goldMax = -1;
  let leftB = -1, rightB = -1;

  for (let x = 470; x < 990; x++) {
    const { r, g, b } = getPixel(x, y);
    const red = isRed(r, g, b);
    const gold = isGold(r, g, b);
    if (red) {
      if (redMin === -1) redMin = x;
      redMax = x;
    }
    if (gold) {
      if (goldMin === -1) goldMin = x;
      goldMax = x;
    }
    if (red && leftB === -1 && x > 480) {
      // leftmost red - check the pixel before is gold/frame
      leftB = x;
    }
  }
  // right boundary: last red before non-red
  // (redMax is already last red)
  // left boundary = first red
  const p = `${y} | ${redMin} ${redMax} | ${goldMin} ${goldMax}`;
  console.log(p);
}
