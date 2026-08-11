import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

// Vertical scan down the middle of the arch (x = 715) - sample every 30px
console.log('=== VERTICAL SCAN AT X=715 ===');
for (let y = 100; y <= 950; y += 25) {
  const { r, g, b, a } = getPixel(715, y);
  console.log(`Y=${y}: r=${r} g=${g} b=${b} a=${a}`);
}

console.log('\n=== HORIZONTAL SCAN AT Y=250 (top of arch) ===');
for (let x = 480; x <= 980; x += 20) {
  const { r, g, b } = getPixel(x, 250);
  console.log(`X=${x}: r=${r} g=${g} b=${b}`);
}

console.log('\n=== HORIZONTAL SCAN AT Y=550 (middle) ===');
for (let x = 480; x <= 980; x += 20) {
  const { r, g, b } = getPixel(x, 550);
  console.log(`X=${x}: r=${r} g=${g} b=${b}`);
}

console.log('\n=== HORIZONTAL SCAN AT Y=800 (lower) ===');
for (let x = 480; x <= 980; x += 20) {
  const { r, g, b } = getPixel(x, 800);
  console.log(`X=${x}: r=${r} g=${g} b=${b}`);
}
