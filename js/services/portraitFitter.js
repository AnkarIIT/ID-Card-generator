export const CARD_LAYOUT = {
    width: 1024,
    height: 1536,

    portrait: {
        x: 520,
        y: 195,
        width: 414,
        height: 577
    },

    fields: {
        name:         { x: 26,  y: 493, w: 460, h: 220, fontSize: 64 },
        role:         { x: 26,  y: 710, w: 460, h: 118, fontSize: 36 },
        stack:        { x: 27,  y: 833, w: 459, h: 152, fontSize: 24 },
        builderTitle: { x: 27,  y: 983, w: 459, h: 159, fontSize: 40 },
        building:     { x: 27,  y: 1138, w: 460, h: 167, fontSize: 26 },
        sideQuest:    { x: 28,  y: 1304, w: 459, h: 126, fontSize: 24 },
        sleepStatus:  { x: 488, y: 838,  w: 506, h: 165, fontSize: 24 },
        chaos:        { x: 488, y: 998,  w: 506, h: 107, fontSize: 22 },
        poweredBy:    { x: 488, y: 1102, w: 506, h: 134, fontSize: 24 },
        mostUsedKey:  { x: 489, y: 1232, w: 298, h: 98,  fontSize: 28 },
        favoriteError:{ x: 489, y: 1332, w: 298, h: 102, fontSize: 36 },
        id:           { x: 550, y: 885,  w: 320, h: 35,  fontSize: 24 }
    }
};

let archMaskCache = { key: null, value: null };

function colorDistSq(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return dr * dr + dg * dg + db * db;
}

function dominantPink(data, width, portrait) {
    const bins = new Int32Array(512);
    for (let y = portrait.y; y < portrait.y + portrait.height; y++) {
        const row = y * width;
        for (let x = portrait.x; x < portrait.x + portrait.width; x++) {
            const i = (row + x) * 4;
            const r = data[i] >> 5, g = data[i + 1] >> 5, b = data[i + 2] >> 5;
            bins[(r << 6) | (g << 3) | b]++;
        }
    }
    let maxIdx = 0, maxCount = 0;
    for (let k = 0; k < 512; k++) {
        if (bins[k] > maxCount) { maxCount = bins[k]; maxIdx = k; }
    }
    return {
        r: (maxIdx >> 6) * 8 + 4,
        g: ((maxIdx >> 3) & 7) * 8 + 4,
        b: (maxIdx & 7) * 8 + 4
    };
}

function refinePink(data, width, portrait, seed) {
    let sr = 0, sg = 0, sb = 0, n = 0;
    const t = 55 * 55;
    for (let y = portrait.y; y < portrait.y + portrait.height; y++) {
        const row = y * width;
        for (let x = portrait.x; x < portrait.x + portrait.width; x++) {
            const i = (row + x) * 4;
            if (colorDistSq(data[i], data[i + 1], data[i + 2], seed.r, seed.g, seed.b) < t) {
                sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
                n++;
            }
        }
    }
    if (!n) return seed;
    return { r: sr / n, g: sg / n, b: sb / n };
}

function pinkTolerance(data, width, portrait, pink) {
    let sum = 0, sumSq = 0, n = 0;
    for (let y = portrait.y; y < portrait.y + portrait.height; y++) {
        const row = y * width;
        for (let x = portrait.x; x < portrait.x + portrait.width; x++) {
            const i = (row + x) * 4;
            const d = Math.sqrt(colorDistSq(data[i], data[i + 1], data[i + 2], pink.r, pink.g, pink.b));
            if (d < 55) { sum += d; sumSq += d * d; n++; }
        }
    }
    if (!n) return 45;
    const mean = sum / n;
    const variance = Math.max(0, sumSq / n - mean * mean);
    const std = Math.sqrt(variance);
    return Math.max(30, Math.min(80, mean + 2 * std));
}

export function buildArchMask(templateImg) {
    if (archMaskCache.key === templateImg) return archMaskCache.value;

    const W = CARD_LAYOUT.width;
    const H = CARD_LAYOUT.height;
    const p = CARD_LAYOUT.portrait;
    const rw = p.width;
    const rh = p.height;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(templateImg, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;

    const seed = dominantPink(data, W, p);
    const pink = refinePink(data, W, p, seed);
    const tol = pinkTolerance(data, W, p, pink);
    const tolSq = tol * tol;

    const mask = new Uint8Array(rw * rh);

    const flood = (sx, sy) => {
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= rw || y < 0 || y >= rh) continue;
            const mi = y * rw + x;
            if (mask[mi]) continue;
            const i = ((p.y + y) * W + (p.x + x)) * 4;
            if (colorDistSq(data[i], data[i + 1], data[i + 2], pink.r, pink.g, pink.b) > tolSq) continue;
            mask[mi] = 1;
            stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
        }
    };

    flood(Math.floor(rw / 2), Math.floor(rh / 2));

    for (let pass = 0; pass < 3; pass++) {
        const next = mask.slice();
        for (let y = 1; y < rh - 1; y++) {
            const row = y * rw;
            for (let x = 1; x < rw - 1; x++) {
                const mi = row + x;
                if (mask[mi]) continue;
                const i = ((p.y + y) * W + (p.x + x)) * 4;
                if (colorDistSq(data[i], data[i + 1], data[i + 2], pink.r, pink.g, pink.b) > tolSq) continue;
                if (mask[mi - 1] || mask[mi + 1] || mask[mi - rw] || mask[mi + rw]) next[mi] = 1;
            }
        }
        mask.set(next);
    }

    const ER = 3;
    const eroded = new Uint8Array(rw * rh);
    for (let y = ER; y < rh - ER; y++) {
        for (let x = ER; x < rw - ER; x++) {
            let keep = 1;
            for (let dy = -ER; dy <= ER && keep; dy++) {
                const row = (y + dy) * rw;
                for (let dx = -ER; dx <= ER; dx++) {
                    if (!mask[row + x + dx]) { keep = 0; break; }
                }
            }
            if (keep) eroded[y * rw + x] = 255;
        }
    }

    let minX = rw, minY = rh, maxX = -1, maxY = -1;
    for (let y = 0; y < rh; y++) {
        const row = y * rw;
        for (let x = 0; x < rw; x++) {
            if (eroded[row + x]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = rw;
    maskCanvas.height = rh;
    const mctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    const img = mctx.createImageData(rw, rh);

    if (maxX >= minX && maxY >= minY) {
        for (let y = 0; y < rh; y++) {
            for (let x = 0; x < rw; x++) {
                const oi = (y * rw + x) * 4;
                img.data[oi] = 255;
                img.data[oi + 1] = 255;
                img.data[oi + 2] = 255;
                img.data[oi + 3] = eroded[y * rw + x];
            }
        }
    } else {
        console.warn('[ARCH] No pink region detected — falling back to full portrait rect');
        for (let y = 0; y < rh; y++) {
            for (let x = 0; x < rw; x++) {
                const oi = (y * rw + x) * 4;
                img.data[oi] = 255;
                img.data[oi + 1] = 255;
                img.data[oi + 2] = 255;
                img.data[oi + 3] = 255;
            }
        }
        minX = 0; minY = 0; maxX = rw - 1; maxY = rh - 1;
    }

    mctx.putImageData(img, 0, 0);

    const bounds = {
        x: p.x + minX,
        y: p.y + minY,
        width: Math.max(1, maxX - minX + 1),
        height: Math.max(1, maxY - minY + 1)
    };

    const result = { canvas: maskCanvas, bounds, pink };
    archMaskCache = { key: templateImg, value: result };

    console.log('[ARCH] Detected pink:', Math.round(pink.r), Math.round(pink.g), Math.round(pink.b),
        '| tol:', tol.toFixed(1), '| interior bounds:', JSON.stringify(bounds));
    return result;
}

export function fitCutout(cutout, archInfo) {
    const cw = cutout.width;
    const ch = cutout.height;
    const b = archInfo && archInfo.bounds ? archInfo.bounds : CARD_LAYOUT.portrait;

    const padX = Math.round(b.width * 0.03);
    const padY = Math.round(b.height * 0.06);
    const availW = Math.max(1, b.width - padX * 2);
    const availH = Math.max(1, b.height - padY * 2);

    const scale = Math.min(availW / cw, availH / ch);
    const w = Math.round(cw * scale);
    const h = Math.round(ch * scale);

    const x = b.x + Math.round((b.width - w) / 2);
    const y = b.y + padY + Math.round((b.height - padY * 2 - h) / 2);

    return { x, y, w, h, scale };
}

export function clipPortraitArch() {
    console.warn('[portraitFitter] clipPortraitArch is deprecated — use buildArchMask instead');
}
