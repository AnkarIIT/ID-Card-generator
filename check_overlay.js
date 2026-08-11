import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front_gold_frame.png'));
const W = png.width, H = png.height;
console.log(`Size ${W}x${H}`);
const step = 4;
for (let y = 100; y <= 900; y += step) {
  let line = '';
  for (let x = 470; x <= 990; x += step) {
    const a = png.data[(y * W + x) * 4 + 3];
    line += a > 100 ? '#' : '.';
  }
  console.log(line);
}
