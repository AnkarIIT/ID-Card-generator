import fs from 'fs';
import { PNG } from 'pngjs';

const W = 1024, H = 1536;
const tpl = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const ovl = PNG.sync.read(fs.readFileSync('./src/images/front_gold_frame.png'));

function px(d, x, y) { const i = (y * d.width + x) * 4; return { r: d.data[i], g: d.data[i + 1], b: d.data[i + 2] }; }
function isGold(r, g, b) { return r > 120 && g > 85 && b < 160 && r > b && (r - b) > 40; }
function isMaroon(r, g, b) { return r > 100 && g < 80 && b > 25 && b < 130; }

// 1. Mask: flood fill from seed, gold = wall (bounds-safe)
const visited = new Uint8Array(W * H);
const stack = [[715, 500]]; visited[500 * W + 715] = 1;
let minX = W, maxX = -1, minY = H, maxY = -1;
while (stack.length) {
  const [x, y] = stack.pop();
  const { r, g, b } = px(tpl, x, y);
  if (isGold(r, g, b)) continue;
  visited[y * W + x] = 1;
  if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
    if (visited[ny * W + nx]) continue;
    visited[ny * W + nx] = 1; stack.push([nx, ny]);
  }
}
const T = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
console.log('TARGET (mask bounds):', JSON.stringify(T));
console.log('CLIP BOUNDS: same as mask — opening follows gold inner frame, apex y=' + minY + ', bottom y=' + maxY + ', x=[' + minX + '..' + maxX + ']');

const VBIAS = 0.08;

function coverRect(iw, ih) {
  const baseScale = Math.max(T.width / iw, T.height / ih);
  const drawW = iw * baseScale, drawH = ih * baseScale;
  const drawX = T.x + (T.width - drawW) / 2;
  const overflowY = Math.max(0, drawH - T.height);
  const drawY = T.y + (T.height - drawH) / 2 + overflowY * VBIAS;
  return { drawX, drawY, drawW, drawH, scale: baseScale };
}

// synthetic photo generators: u,v in [0,1] (u right, v down). Top band = "head".
function photoColor(iw, ih, u, v) {
  const r = Math.round(v * 255), g = Math.round(120 + 80 * u), b = Math.round(255 - v * 255);
  if (v < 0.12) return [255, 230, 0];      // bright top band (head/sky marker)
  if (v > 0.88) return [255, 0, 220];      // magenta bottom band (ground marker)
  return [r, g, b];
}
function makePhoto(iw, ih) {
  const out = new PNG({ width: iw, height: ih });
  for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) {
    const [r, g, b] = photoColor(iw, ih, x / iw, y / ih);
    const i = (y * iw + x) * 4; out.data[i] = r; out.data[i + 1] = g; out.data[i + 2] = b; out.data[i + 3] = 255;
  }
  return out;
}

const cases = [
  { name: 'square_800', iw: 800, ih: 800 },
  { name: 'portrait_900x1200', iw: 900, ih: 1200 },
  { name: 'landscape_1280x853', iw: 1280, ih: 853 },
  { name: 'tall_900x1600_head_top', iw: 900, ih: 1600 },
  { name: 'wide_1600x900_person_bottom', iw: 1600, ih: 900 },
];

for (const c of cases) {
  const photo = makePhoto(c.iw, c.ih);
  const { drawX, drawY, drawW, drawH, scale } = coverRect(c.iw, c.ih);
  const photoU = (u) => Math.max(0, Math.min(c.iw - 1, Math.round(u)));
  const photoV = (v) => Math.max(0, Math.min(c.ih - 1, Math.round(v)));

  const out = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
  let pinkGap = 0, goldCorrupt = 0, outsidePhoto = 0, inMaskPhoto = 0, inMaskTotal = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const inMask = visited[y * W + x];
      const { r, g, b } = px(tpl, x, y);
      const isMar = isMaroon(r, g, b);
      if (inMask) inMaskTotal++;

      let photoHere = false;
      if (inMask) {
        const u = (x - drawX) / scale, v = (y - drawY) / scale;
        if (u >= 0 && u < c.iw && v >= 0 && v < c.ih) {
          photoHere = true;
          const pi = (photoV(v) * c.iw + photoU(u)) * 4;
          out.data[i] = photo.data[pi]; out.data[i + 1] = photo.data[pi + 1]; out.data[i + 2] = photo.data[pi + 2];
          inMaskPhoto++;
        }
      } else {
        if (uOutside(x, y, drawX, drawY, drawW, drawH)) outsidePhoto++; // photo would be visible outside mask
      }
      // after photo: does any remaining maroon inside the opening show a pink gap?
      if (inMask && isMar && !photoHere) pinkGap++;
      // gold overlay on top
      const oa = ovl.data[i + 3];
      if (oa > 0) { out.data[i] = ovl.data[i]; out.data[i + 1] = ovl.data[i + 1]; out.data[i + 2] = ovl.data[i + 2]; }
    }
  }
  function uOutside(x, y, dx, dy, dw, dh) {
    const u = (x - dx) / scale, v = (y - dy) / scale;
    return u >= 0 && u < c.iw && v >= 0 && v < c.ih;
  }
  // recount gold corruption: gold overlay pixels must never equal photo colors (they were overwritten last, so this is guaranteed structurally) — instead verify no photo color under gold
  let underGoldPhoto = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (ovl.data[i + 3] > 0) {
      const before = out.data[i];
      // photo colors used: computed here quickly
      if (visited[y * W + x]) {
        const u = (x - drawX) / scale, v = (y - drawY) / scale;
        if (u >= 0 && u < c.iw && v >= 0 && v < c.ih) underGoldPhoto++;
      }
    }
  }

  fs.writeFileSync(`./src/images/_sample_card_${c.name}.png`, PNG.sync.write(out));
  console.log(`\n[${c.name}]  source ${c.iw}x${c.ih} (aspect ${(c.iw/c.ih).toFixed(3)})`);
  console.log(`  drawRect: { x:${drawX.toFixed(1)} y:${drawY.toFixed(1)} w:${drawW.toFixed(1)} h:${drawH.toFixed(1)} }`);
  console.log(`  scale: ${scale.toFixed(4)}  overflowY: ${Math.max(0, drawH - T.height).toFixed(1)}  biasShift: ${(Math.max(0, drawH - T.height) * VBIAS).toFixed(1)}`);
  console.log(`  mask px: ${inMaskTotal}  photo-covered mask px: ${inMaskPhoto}  pink gaps: ${pinkGap}  photo-under-gold: ${underGoldPhoto}  photo-outside-mask: ${outsidePhoto}`);
}
console.log('\nSample cards saved to src/images/_sample_card_*.png');
