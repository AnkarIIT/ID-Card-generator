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
function isGold(r, g, b) {
  return r > 120 && g > 85 && b < 160 && r > b && (r - b) > 40;
}
function isInterior(r, g, b) {
  return r > 100 && g < 80 && b > 25 && b < 130;
}

// For each row, find:
//  leftInner = rightmost gold pixel that is part of the LEFT arm (x < 620)
//  rightInner = leftmost gold pixel that is part of the RIGHT arm (x > 820)
// Also find the interior span of maroon between them.
console.log('Y | leftInnerX rightInnerX | interiorLeft interiorRight');
let out = [];
for (let y = 130; y <= 865; y++) {
  let leftInner = -1, rightInner = -1;
  let goldLeft = [], goldRight = [];
  let maroon = [];
  for (let x = 470; x < 990; x++) {
    const { r, g, b } = getPixel(x, y);
    if (isGold(r, g, b)) {
      if (x < 620) goldLeft.push(x);
      if (x > 820) goldRight.push(x);
    }
    if (isInterior(r, g, b)) maroon.push(x);
  }
  if (goldLeft.length) leftInner = goldLeft[goldLeft.length - 1];
  if (goldRight.length) rightInner = goldRight[0];
  out.push({ y, leftInner, rightInner, maroon });
}

// Print smooth sampled rows
for (let i = 0; i < out.length; i += 2) {
  const { y, leftInner, rightInner, maroon } = out[i];
  const lo = maroon.length ? maroon[0] : -1;
  const hi = maroon.length ? maroon[maroon.length - 1] : -1;
  console.log(`${y} | ${leftInner} ${rightInner} | ${lo} ${hi}`);
}

// Also print top region at full resolution
console.log('\n=== TOP ARCH REGION (y=130..240, every row) ===');
for (let y = 130; y <= 245; y++) {
  const { leftInner, rightInner, maroon } = out[y - 130];
  const lo = maroon.length ? maroon[0] : -1;
  const hi = maroon.length ? maroon[maroon.length - 1] : -1;
  console.log(`${y} | L=${leftInner} R=${rightInner} | interior=${lo}..${hi}`);
}
