import fs from 'fs';
import { PNG } from 'pngjs';
const card = PNG.sync.read(fs.readFileSync('./src/images/_sample_card_tall_900x1600_head_top.png'));
const { width, height, data } = card;
// ASCII map x=[460..1000] y=[130..880] step 4
const step = 4;
for (let y = 130; y <= 880; y += step) {
  let line = '';
  for (let x = 460; x <= 1000; x += step) {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 200 && g > 200 && b < 80) line += 'Y';       // top band (head marker) 255,230,0
    else if (r > 200 && b > 180 && g < 80) line += 'P';  // bottom band magenta 255,0,220
    else if (r > 110 && g < 80 && b > 25 && b < 130) line += 'p'; // maroon (pink gap check)
    else if (r > 120 && g > 85 && b < 160 && r > b) line += 'G';  // gold
    else line += '.';
  }
  console.log(String(y).padStart(3) + ' ' + line);
}
