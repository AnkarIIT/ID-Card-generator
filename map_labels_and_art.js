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

// Check if pixel is part of text or label graphic (not dark background)
function isGraphic(r, g, b) {
  // dark background is r<45, g<65, b<55
  return !(r < 45 && g < 65 && b < 55);
}

// Function to find bounding box of non-dark pixels in a sub-rectangle
function getGraphicBounds(minX, maxX, minY, maxY) {
  let minObsX = maxX, maxObsX = minX, minObsY = maxY, maxObsY = minY;
  let count = 0;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const { r, g, b } = getPixel(x, y);
      if (isGraphic(r, g, b)) {
        count++;
        if (x < minObsX) minObsX = x;
        if (x > maxObsX) maxObsX = x;
        if (y < minObsY) minObsY = y;
        if (y > maxObsY) maxObsY = y;
      }
    }
  }
  return { minX: minObsX, maxX: maxObsX, minY: minObsY, maxY: maxObsY, count };
}

// Let's test section Y ranges for Left Column:
// 1. NAME: Y = 472..748
// 2. ROLE: Y = 753..844
// 3. STACK: Y = 849..1056
// 4. BUILDER TITLE: Y = 1058..1228
// 5. CURRENTLY BUILDING: Y = 1231..1383
// 6. SIDE QUEST: Y = 1386..1518

const leftSections = [
  { name: 'NAME', minY: 472, maxY: 748, minX: 63, maxX: 480 },
  { name: 'ROLE', minY: 753, maxY: 844, minX: 63, maxX: 480 },
  { name: 'STACK', minY: 849, maxY: 1056, minX: 63, maxX: 480 },
  { name: 'BUILDER TITLE', minY: 1058, maxY: 1228, minX: 63, maxX: 480 },
  { name: 'CURRENTLY BUILDING', minY: 1231, maxY: 1383, minX: 63, maxX: 480 },
  { name: 'SIDE QUEST', minY: 1386, maxY: 1518, minX: 63, maxX: 480 },
];

console.log('=== LEFT COLUMN SECTIONS & LABEL GRAPHICS ===');
leftSections.forEach((s) => {
  const g = getGraphicBounds(s.minX, s.maxX, s.minY, s.maxY);
  console.log(`Section: ${s.name} [Y: ${s.minY}..${s.maxY}, h=${s.maxY - s.minY}]`);
  console.log(`  Graphic content found: Y=[${g.minY}..${g.maxY}] (h=${g.maxY - g.minY + 1}), X=[${g.minX}..${g.maxX}]`);
});

// Let's test Right Column Sections:
// 7. SLEEP STATUS: Y = 855..1030
// 8. CHAOS LEVEL: Y = 1034..1149
// 9. POWERED BY: Y = 1152..1260
// 10. MOST USED KEY: Y = 1262..1365 (left part X=495..760)
// 11. FAVOURITE ERROR: Y = 1368..1518 (left part X=495..760)
// 12. HHG26-ID: Y = 800..850 (X=549..837)

const rightSections = [
  { name: 'HHG26-ID', minY: 800, maxY: 852, minX: 520, maxX: 860 },
  { name: 'SLEEP STATUS', minY: 855, maxY: 1030, minX: 495, maxX: 980 },
  { name: 'CHAOS LEVEL', minY: 1034, maxY: 1149, minX: 495, maxX: 980 },
  { name: 'POWERED BY', minY: 1152, maxY: 1260, minX: 495, maxX: 980 },
  { name: 'MOST USED KEY', minY: 1262, maxY: 1365, minX: 495, maxX: 760 },
  { name: 'FAVOURITE ERROR', minY: 1368, maxY: 1518, minX: 495, maxX: 760 },
];

console.log('\n=== RIGHT COLUMN SECTIONS & LABEL GRAPHICS ===');
rightSections.forEach((s) => {
  const g = getGraphicBounds(s.minX, s.maxX, s.minY, s.maxY);
  console.log(`Section: ${s.name} [Y: ${s.minY}..${s.maxY}, h=${s.maxY - s.minY}]`);
  console.log(`  Graphic content found: Y=[${g.minY}..${g.maxY}] (h=${g.maxY - g.minY + 1}), X=[${g.minX}..${g.maxX}]`);
});
