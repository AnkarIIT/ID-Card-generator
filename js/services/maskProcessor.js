export function downscaleToWork(img, maxDim = 1024) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(1, maxDim / Math.max(iw, ih));
    const width = Math.max(1, Math.round(iw * scale));
    const height = Math.max(1, Math.round(ih * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return { canvas, width, height, scaleX: width / iw, scaleY: height / ih };
}

function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
}

function sigmoid(v) {
    return 1 / (1 + Math.exp(-v));
}

function detectLogit(maskData, w, h) {
    let min = Infinity;
    let max = -Infinity;
    for (let y = 0; y < h; y += 4) {
        const row = y * w;
        for (let x = 0; x < w; x += 4) {
            const v = maskData[row + x];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }
    return min < 0 || max > 1;
}

export function analyzeMask(maskData, w, h) {
    const isLogit = detectLogit(maskData, w, h);
    const toProb = (v) => (isLogit ? sigmoid(v) : v);

    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(w, h) / 2;
    const edgeThresh = Math.max(4, Math.round(Math.min(w, h) * 0.01));

    const bx0 = Math.round(w * 0.2), bx1 = Math.round(w * 0.8);
    const by0 = Math.round(h * 0.15), by1 = Math.round(h * 0.85);

    let sampled = 0;
    let fg = 0;
    let centerWeightedFg = 0;
    let centerFill = 0;
    let edgeContact = 0;
    let minX = w, minY = h, maxX = 0, maxY = 0;

    for (let y = 0; y < h; y += 2) {
        const row = y * w;
        for (let x = 0; x < w; x += 2) {
            const p = toProb(maskData[row + x]);
            sampled++;
            if (p > 0.5) {
                fg++;
                const dist = Math.hypot(x - cx, y - cy) / maxDist;
                centerWeightedFg += 1 - dist;
                if (x >= bx0 && x <= bx1 && y >= by0 && y <= by1) centerFill++;
                if (x < edgeThresh || x >= w - edgeThresh || y < edgeThresh || y >= h - edgeThresh) edgeContact++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (fg === 0 || sampled === 0) {
        return { score: 0, coverage: 0, edgeContact: 1, centerFocus: 0 };
    }

    const coverage = fg / sampled;
    const centerFocus = centerWeightedFg / fg;
    const centerFillRatio = centerFill / sampled;
    const edgeContactRatio = edgeContact / fg;

    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    const aspect = bh / bw;
    let aspectScore = 1;
    if (aspect < 0.5) aspectScore = aspect / 0.5;
    if (aspect > 4) aspectScore = 4 / aspect;

    let coverageQuality = coverage < 0.5 ? coverage / 0.5 : (1 - coverage) / 0.5;
    if (coverage >= 0.85) coverageQuality = Math.max(0, 1 - (coverage - 0.85) / 0.15);

    let score =
        coverageQuality * 0.30 +
        centerFocus * 0.30 +
        centerFillRatio * 0.20 +
        (1 - edgeContactRatio) * 0.15 +
        aspectScore * 0.05;

    if (coverage > 0.85) score *= 0.25;
    if (coverage < 0.02) score *= 0.1;

    return { score, coverage, edgeContact: edgeContactRatio, centerFocus };
}

export function maskToWorkAlpha(maskData, maskW, maskH, workW, workH, meta) {
    const { fitScale, offsetX, offsetY, inputSize = 1024 } = meta;
    const alpha = new Float32Array(workW * workH);

    for (let y = 0; y < workH; y++) {
        const row = y * workW;
        for (let x = 0; x < workW; x++) {
            const sx = (offsetX + x * fitScale) * (maskW / inputSize);
            const sy = (offsetY + y * fitScale) * (maskH / inputSize);
            alpha[row + x] = bilinearSample(maskData, maskW, maskH, sx, sy);
        }
    }

    return alpha;
}

function bilinearSample(data, w, h, x, y) {
    if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return 0;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
    const fx = x - x0, fy = y - y0;

    const v00 = data[y0 * w + x0];
    const v10 = data[y0 * w + x1];
    const v01 = data[y1 * w + x0];
    const v11 = data[y1 * w + x1];

    return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy;
}

export function refineMask(alpha, w, h) {
    const blurred = boxBlur(alpha, w, h, 2);
    const stepped = new Float32Array(alpha.length);
    for (let i = 0; i < alpha.length; i++) {
        stepped[i] = clamp((blurred[i] - 0.35) / 0.4, 0, 1);
    }
    return boxBlur(stepped, w, h, 1);
}

function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(src.length);
    const out = new Float32Array(src.length);
    const windowSize = 2 * r + 1;

    for (let y = 0; y < h; y++) {
        const row = y * w;
        let sum = 0;
        for (let x = -r; x <= r; x++) sum += src[row + clamp(x, 0, w - 1)];
        for (let x = 0; x < w; x++) {
            tmp[row + x] = sum / windowSize;
            sum += src[row + clamp(x + r + 1, 0, w - 1)] - src[row + clamp(x - r, 0, w - 1)];
        }
    }

    for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let y = -r; y <= r; y++) sum += tmp[clamp(y, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) {
            out[y * w + x] = sum / windowSize;
            sum += tmp[clamp(y + r + 1, 0, h - 1) * w + x] - tmp[clamp(y - r, 0, h - 1) * w + x];
        }
    }

    return out;
}

export function findSubjectBounds(alpha, w, h, paddingX = 0.08, paddingY = 0.12) {
    const THRESHOLD = 30;
    let minX = w, minY = h, maxX = 0, maxY = 0;

    for (let y = 0; y < h; y++) {
        const row = y * w;
        for (let x = 0; x < w; x++) {
            if (alpha[row + x] * 255 > THRESHOLD) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return { x: 0, y: 0, width: w, height: h, minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
    }

    const padX = Math.round((maxX - minX) * paddingX);
    const padY = Math.round((maxY - minY) * paddingY);
    const x = Math.max(0, minX - padX);
    const y = Math.max(0, minY - padY);

    return {
        x,
        y,
        width: Math.min(w - x, maxX - minX + padX + 1),
        height: Math.min(h - y, maxY - minY + padY + 1),
        minX, minY, maxX, maxY
    };
}

export function createCutout(source, alpha, bounds, srcW, srcH) {
    const w = Math.max(1, Math.round(bounds.width));
    const h = Math.max(1, Math.round(bounds.height));
    const sx = Math.max(0, Math.min(srcW - 1, Math.round(bounds.x)));
    const sy = Math.max(0, Math.min(srcH - 1, Math.round(bounds.y)));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const out = ctx.createImageData(w, h);
    const srcCtx = source.getContext ? source.getContext('2d') : null;
    const srcData = srcCtx ? srcCtx.getImageData(sx, sy, w, h) : ctx.createImageData(w, h);

    for (let i = 0; i < w * h; i++) {
        const ox = i % w, oy = Math.floor(i / w);
        const a = alpha[(sy + oy) * srcW + (sx + ox)];
        const outI = i * 4;
        out.data[outI] = srcData.data[outI];
        out.data[outI + 1] = srcData.data[outI + 1];
        out.data[outI + 2] = srcData.data[outI + 2];
        out.data[outI + 3] = Math.round(clamp(a, 0, 1) * 255);
    }

    ctx.putImageData(out, 0, 0);
    return canvas;
}
