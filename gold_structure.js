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
  return r > 110 && g > 75 && b < 160 && r > b;
}
function isInterior(r, g, b) {
  return r > 100 && g < 80 && b > 25 && b < 130;
}

// For each row, find runs of gold pixels and note boundaries between gold and maroon
console.log('Y | goldRuns | maroonRuns');
for (let y = 140; y <= 860; y += 2) {
  // collect gold spans and maroon spans
  let x = 470;
  const goldSpans = [];
  const maroonSpans = [];
  while (x < 990) {
    const { r, g, b } = getPixel(x, y);
    if (isGold(r, g, b)) {
      let x2 = x;
      while (x2 < 990 && isGold(getPixel(x2, y).r, getPixel(x2, y).g, getPixel(x2, y).b)) x2++;
      goldSpans.push([x, x2 - 1]);
      x = x2;
    } else if (isInterior(r, g, b)) {
      let x2 = x;
      while (x2 < 990 && isInterior(getPixel(x2, y).r, getPixel(x2, y).g, getPixel(x2, y).b)) x2++;
      maroonSpans.push([x, x2 - 1]);
      x = x2;
    } else {
      x++;
    }
  }
  const gs = goldSpans.map(([a, b]) => `${a}-${b}`).join(',');
  const ms = maroonSpans.map(([a, b]) => `${a}-${b}`).join(',');
  if (gs || ms) {
    console.log(`${y} | G[${gs}] | M[${ms}]`);
  }
}
