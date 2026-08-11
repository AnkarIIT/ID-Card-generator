import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);

console.log(`Image dimensions: ${png.width} x ${png.height}`);

// Let's sample colors down key vertical lines (x = 100 for left column, x = 600 for right column)
// We want to find dark green/black box interiors vs gold/yellow borders!

function analyzeColumn(x, label) {
  console.log(`\n=== Vertical scan at X = ${x} (${label}) ===`);
  let currentBoxStart = -1;
  let inBox = false;

  for (let y = 0; y < png.height; y++) {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];

    // Check if pixel is dark box interior (e.g., dark green/black: r<30, g<50, b<40)
    // or gold border (r > 150, g > 120, b < 100)
    const isDarkBox = r < 40 && g < 60 && b < 50;
    const isGoldBorder = r > 140 && g > 110 && b < 120;

    if (isDarkBox && !inBox) {
      inBox = true;
      currentBoxStart = y;
    } else if (!isDarkBox && inBox) {
      inBox = false;
      console.log(`Box found Y: ${currentBoxStart} to ${y - 1} (height: ${y - currentBoxStart})`);
    }
  }
  if (inBox) {
    console.log(`Box found Y: ${currentBoxStart} to ${png.height - 1} (height: ${png.height - currentBoxStart})`);
  }
}

analyzeColumn(200, "Left Column (NAME, ROLE, STACK, BUILDER TITLE, CURRENTLY BUILDING, SIDE QUEST)");
analyzeColumn(700, "Right Column (SLEEP STATUS, CHAOS LEVEL, POWERED BY, KEY, ERROR)");
