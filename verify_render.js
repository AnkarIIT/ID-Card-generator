import fs from 'fs';
import { PNG } from 'pngjs';

// 1. Load template + overlay
const tpl = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const ovl = PNG.sync.read(fs.readFileSync('./src/images/front_gold_frame.png'));
const W = tpl.width, H = tpl.height;

// 2. Build the portrait arch path as a polygon (sample the same beziers as CARD_LAYOUT.portrait.path)
function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
const pts = [];
{
  const samples = 60;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = cubic(513, 545, 620, 667, t);
    const y = cubic(240, 195, 140, 110, t);
    pts.push([x, y]);
  }
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = cubic(667, 715, 785, 845, t);
    const y = cubic(110, 118, 165, 235, t);
    pts.push([x, y]);
  }
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = cubic(845, 878, 900, 910, t);
    const y = cubic(235, 275, 320, 390, t);
    pts.push([x, y]);
  }
  pts.push([910, 840], [513, 840]);
}
function inPolygon(px, py) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// 3. Composite exactly like renderFrontBadge:
//    template bg -> cover photo (bright magenta test) clipped to path -> gold frame overlay
const out = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (inPolygon(x + 0.5, y + 0.5)) {
      out.data[i] = 255;
      out.data[i + 1] = 0;
      out.data[i + 2] = 255;
    }
    const oa = ovl.data[i + 3];
    if (oa > 0) {
      out.data[i] = ovl.data[i];
      out.data[i + 1] = ovl.data[i + 1];
      out.data[i + 2] = ovl.data[i + 2];
    }
  }
}
fs.writeFileSync('./src/images/_verify_render.png', PNG.sync.write(out));

// 4. Report per-row: interior left/right (where magenta), and confirm frame band is template gold
let badFrame = 0;
for (let y = 110; y <= 900; y++) {
  let lo = -1, hi = -1;
  for (let x = 470; x <= 990; x++) {
    const i = (y * W + x) * 4;
    if (out.data[i] === 255 && out.data[i + 1] === 0 && out.data[i + 2] === 255) {
      if (lo === -1) lo = x;
      hi = x;
    }
  }
  if (lo !== -1) {
    const row = y % 20 === 0 || y === 110 || y === 147 || y === 240 || y === 390 || y === 500 || y === 700 || y === 840 ? `y=${y}: photo X=[${lo}..${hi}]` : null;
    if (row) console.log(row);
  }
}
// Check gold frame integrity: every overlay pixel must be template-colored (not magenta)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (ovl.data[i + 3] > 0) {
      const isMagenta = out.data[i] === 255 && out.data[i + 1] === 0 && out.data[i + 2] === 255;
      if (isMagenta) badFrame++;
    }
  }
}
console.log(`\nGold-frame pixels corrupted by photo: ${badFrame}`);
console.log('Composited result saved to src/images/_verify_render.png');
