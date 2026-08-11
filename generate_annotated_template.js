import fs from 'fs';
import { PNG } from 'pngjs';

const buffer = fs.readFileSync('./src/images/front.png');
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

// Helper to draw colored rectangle border
function drawRect(x, y, w, h, r, g, b, alpha = 255) {
  for (let px = x; px < x + w; px++) {
    for (let py = y; py < y + h; py++) {
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      // Draw border only (3px thick) or translucent fill
      const isBorder = px < x + 3 || px >= x + w - 3 || py < y + 3 || py >= y + h - 3;
      const idx = (py * width + px) * 4;
      if (isBorder) {
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      } else {
        // Blended translucent fill
        data[idx] = Math.round(data[idx] * 0.7 + r * 0.3);
        data[idx + 1] = Math.round(data[idx + 1] * 0.7 + g * 0.3);
        data[idx + 2] = Math.round(data[idx + 2] * 0.7 + b * 0.3);
      }
    }
  }
}

// Let's test section boxes based on our exact findings from gold lines and pixel structure:

// Pink Arch Portrait Region:
// X = 514..915 (w = 401), Y = 265..755 (h = 490)
// Inner Photo Safe Area inside Arch: X = 530..899 (w = 370), Y = 320..740 (h = 420)
drawRect(514, 265, 401, 490, 255, 0, 255); // Pink Arch Outer

// LEFT COLUMN SECTIONS (X = 63, W = 423)
// 1. NAME: Y = 472..748 (h = 276)
// Safe Area: Y = 480..740 (h = 260)
drawRect(63, 472, 423, 276, 255, 255, 0);

// 2. ROLE: Y = 753..844 (h = 91)
// Pre-printed "ROLE" header occupies Y = 753..780
// Safe Area: Y = 780..840 (h = 60)
drawRect(63, 753, 423, 91, 0, 255, 255);

// 3. STACK: Y = 849..1056 (h = 207)
// Pre-printed "STACK" header occupies Y = 849..880
// Safe Area: Y = 880..1050 (h = 170)
drawRect(63, 849, 423, 207, 0, 255, 0);

// 4. BUILDER TITLE: Y = 1058..1228 (h = 170)
// Pre-printed "BUILDER TITLE" header occupies Y = 1058..1090
// Safe Area: Y = 1090..1220 (h = 130)
drawRect(63, 1058, 423, 170, 255, 128, 0);

// 5. CURRENTLY BUILDING: Y = 1231..1383 (h = 152)
// Pre-printed "CURRENTLY BUILDING" header occupies Y = 1231..1260
// Rocket icon on right side X = 380..470
// Safe Area: X = 75..375 (w = 300), Y = 1260..1375 (h = 115)
drawRect(63, 1231, 423, 152, 255, 0, 128);

// 6. SIDE QUEST: Y = 1386..1518 (h = 132)
// Pre-printed "SIDE QUEST" header occupies Y = 1386..1415
// Safe Area: Y = 1415..1510 (h = 95)
drawRect(63, 1386, 423, 132, 128, 0, 255);

// RIGHT COLUMN SECTIONS (X = 495)
// 12. HHG26-ID: Y = 800..852 (X = 549, W = 288, H = 45)
drawRect(549, 800, 288, 45, 255, 255, 255);

// 7. SLEEP STATUS: Y = 855..1030 (X = 495, W = 487, H = 175)
// Pre-printed "SLEEP STATUS" header occupies Y = 855..885
// Safe Area: Y = 885..1020 (h = 135)
drawRect(495, 855, 487, 175, 255, 255, 0);

// 8. CHAOS LEVEL: Y = 1034..1149 (X = 495, W = 487, H = 115)
// Pre-printed "CHAOS LEVEL" header occupies Y = 1034..1065
// Progress Blocks Safe Area: Y = 1070..1140 (h = 70)
drawRect(495, 1034, 487, 115, 255, 0, 255);

// 9. POWERED BY: Y = 1152..1260 (X = 495, W = 487, H = 108)
// Pre-printed "POWERED BY" header occupies Y = 1152..1180
// Safe Area: Y = 1180..1252 (h = 72)
drawRect(495, 1152, 487, 108, 0, 255, 255);

// 10. MOST USED KEY: Y = 1262..1365 (X = 495, W = 264, H = 103)
// Pre-printed "MOST USED KEY" header occupies Y = 1262..1290
// Keyboard icon on right X = 680..750
// Safe Area: X = 505..680 (w = 175), Y = 1290..1358 (h = 68)
drawRect(495, 1262, 264, 103, 0, 255, 0);

// 11. FAVOURITE ERROR: Y = 1368..1518 (X = 495, W = 264, H = 150)
// Pre-printed "FAVOURITE ERROR" header occupies Y = 1368..1395
// Warning icon on right X = 680..750
// Safe Area: X = 505..680 (w = 175), Y = 1395..1510 (h = 115)
drawRect(495, 1368, 264, 150, 255, 128, 0);

fs.writeFileSync('./annotated_template.png', PNG.sync.write(png));
console.log('Successfully generated annotated_template.png');
