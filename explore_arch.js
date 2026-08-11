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

// Print a coarse color map of the arch region (right column top)
const cols = 40, rows = 40;
const rx0 = 470, ry0 = 100, rw = 540, rh = 800;

console.log('=== COARSE COLOR MAP OF ARCH REGION ===');
console.log(`Region X=[${rx0}..${rx0 + rw}] Y=[${ry0}..${ry0 + rh}]`);
const cellW = rw / cols, cellH = rh / rows;
for (let r = 0; r < rows; r++) {
  let line = '';
  for (let c = 0; c < cols; c++) {
    // sample center of cell
    const x = Math.floor(rx0 + c * cellW + cellW / 2);
    const y = Math.floor(ry0 + r * cellH + cellH / 2);
    const { r: pr, g: pg, b: pb } = getPixel(x, y);
    let ch = '.';
    if (pr > 150 && pg > 110 && pb < 130) ch = 'G'; // gold
    else if (pr > 120 && pg < 110 && pb > 90) ch = 'P'; // pink
    else if (pr < 45 && pg < 65 && pb < 55) ch = 'd'; // dark
    else if (pr > 200 && pg > 200 && pb > 200) ch = 'W'; // white
    else if (pr > 100 && pg > 80 && pb < 60) ch = 'b'; // brown
    else ch = '?';
    line += ch;
  }
  console.log(line);
}
