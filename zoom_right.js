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
function classify(x, y) {
  const { r, g, b } = getPixel(x, y);
  if (r > 120 && g > 85 && b < 160 && r > b && (r - b) > 40) return '#';
  if (r > 100 && g < 80 && b > 25 && b < 130) return 'm';
  if (r < 45 && g < 65 && b < 55) return '.';
  return '?';
}

// Zoom: x=780..985, y=430..520, 1px/char
console.log('=== ZOOM x=780..985, y=430..530 ===');
for (let y = 430; y <= 530; y++) {
  let line = '';
  for (let x = 780; x <= 985; x++) line += classify(x, y);
  console.log(`${y} | ${line}`);
}
