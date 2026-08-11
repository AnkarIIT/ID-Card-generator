import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

// Function to check if pixel is bright text (yellowish or whiteish or redish) on dark background
function isTextOrBrightPixel(r, g, b) {
  // Not black/dark green background (background is r<40, g<60, b<50)
  const isDark = r < 45 && g < 65 && b < 55;
  return !isDark;
}

// Let's do a 2D projection / bounding box finder for distinct text/label blocks in left and right columns!

function scanRegionForContent(minX, maxX, minY, maxY, regionName) {
  console.log(`\n========================================`);
  console.log(`ANALYZING REGION: ${regionName} [X: ${minX}..${maxX}, Y: ${minY}..${maxY}]`);
  console.log(`========================================`);

  // Row by row histogram of non-dark pixels
  const rowCounts = [];
  for (let y = minY; y <= maxY; y++) {
    let count = 0;
    for (let x = minX; x <= maxX; x++) {
      const { r, g, b } = getPixel(x, y);
      if (isTextOrBrightPixel(r, g, b)) {
        count++;
      }
    }
    rowCounts.push({ y, count });
  }

  // Find contiguous bands of Y where count > threshold
  let inBand = false;
  let bandStart = 0;
  const bands = [];

  for (let i = 0; i < rowCounts.length; i++) {
    const { y, count } = rowCounts[i];
    if (count > 8 && !inBand) {
      inBand = true;
      bandStart = y;
    } else if (count <= 8 && inBand) {
      inBand = false;
      bands.push({ startY: bandStart, endY: y - 1, height: y - bandStart });
    }
  }
  if (inBand) {
    bands.push({ startY: bandStart, endY: maxY, height: maxY - bandStart + 1 });
  }

  bands.forEach((b, idx) => {
    // Find minX and maxX for this Y band
    let bMinX = maxX, bMaxX = minX;
    for (let y = b.startY; y <= b.endY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const { r, g, b: blue } = getPixel(x, y);
        if (isTextOrBrightPixel(r, g, blue)) {
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
        }
      }
    }
    console.log(`Band #${idx + 1}: Y = [${b.startY}..${b.endY}] (h=${b.height}), X = [${bMinX}..${bMaxX}] (w=${bMaxX - bMinX + 1})`);
  });
}

// Left Column: X approx 60 to 480, Y 450 to 1520
scanRegionForContent(60, 480, 450, 1520, "LEFT COLUMN (NAME, ROLE, STACK, BUILDER TITLE, CURRENTLY BUILDING, SIDE QUEST)");

// Right Column: X approx 490 to 980, Y 800 to 1520
scanRegionForContent(490, 980, 800, 1520, "RIGHT COLUMN (SLEEP, CHAOS, POWERED BY, KEY, ERROR, ID)");
