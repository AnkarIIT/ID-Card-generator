import { removeBackground } from
    'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm';

/* HH Goa 2026 - IMG.LY Background Removal Integration
 * 
 * FIXED: Using proper ES module import from CDN
 * API: removeBackground(imageSource, options?) returns PNG Blob
 */

// Global state
let templateImg = null;
const state = {
    photo: null,
    cutout: null,
    bgRemovalStatus: 'idle', // idle, loading, processing, ready, error
    debugMode: false
};

// Card layout - measured from front.png
const CARD_LAYOUT = {
    width: 1080,
    height: 1350,
    portrait: {
        x: 380,
        y: 80,
        width: 580,
        height: 750
    }
};

const $ = (id) => document.getElementById(id);

// ============= TEMPLATE LOADING =============
async function loadTemplate() {
    console.log('[TEMPLATE] Loading front.png...');
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('[TEMPLATE] Loaded:', img.naturalWidth, 'x', img.naturalHeight);
            templateImg = img;
            resolve(img);
        };
        img.onerror = (e) => {
            console.error('[TEMPLATE] Failed:', e);
            reject(e);
        };
        img.src = './front.png';
    });
}

// ============= BACKGROUND REMOVAL =============
async function removeBackgroundFromFile(file) {
    console.log('[BG] Starting IMG.LY background removal...');
    console.log('[BG] File:', file.name);
    console.log('[BG] Size:', file.size);

    try {
        // First run downloads and caches the WASM model
        const blob = await removeBackground(file, {
            debug: true,
            model: 'isnet_fp16',
            output: {
                format: 'image/png',
                type: 'foreground'
            }
        });

        console.log('[BG] Result type:', blob.constructor.name);
        console.log('[BG] Blob type:', blob.type);
        console.log('[BG] Blob size:', blob.size);

        if (!(blob instanceof Blob)) {
            throw new Error('Background removal returned invalid result');
        }

        if (!blob.type.includes('png') && !blob.type.includes('image')) {
            console.warn('[BG] Unexpected blob type:', blob.type);
        }

        return blob;

    } catch (err) {
        console.error('[BG] Background removal failed:', err);
        throw err;
    }
}

// ============= CONVERT BLOB TO IMAGE =============
async function blobToImage(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

// ============= ALPHA CHANNEL VERIFICATION =============
function verifyAlphaChannel(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    
    let minAlpha = 255, maxAlpha = 0;
    let transparentPixels = 0, opaquePixels = 0;
    const sampleStep = 8;
    
    for (let i = 3; i < data.length; i += 4 * sampleStep * sampleStep) {
        const alpha = data[i];
        minAlpha = Math.min(minAlpha, alpha);
        maxAlpha = Math.max(maxAlpha, alpha);
        if (alpha < 20) transparentPixels++;
        if (alpha > 235) opaquePixels++;
    }
    
    const totalSampled = data.length / (4 * sampleStep * sampleStep);
    const ratio = transparentPixels / totalSampled;
    
    console.log('[VERIFY] Alpha range:', minAlpha, '-', maxAlpha);
    console.log('[VERIFY] Transparent ratio:', Math.round(ratio * 100) + '%');
    console.log('[VERIFY] Opaque ratio:', Math.round((1 - ratio) * 100) + '%');
    
    return {
        hasTransparency: minAlpha < 20 && ratio > 0.05,
        minAlpha,
        maxAlpha,
        ratio
    };
}

// ============= SUBJECT BOUNDS DETECTION =============
function findSubjectBounds(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4 + 3; // Alpha channel
            if (data[i] > 20) {
                found = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    if (!found) {
        console.log('[BOUNDS] No subject found');
        return { x: 0, y: 0, w: w, h: h };
    }
    
    // Add padding for natural framing
    const padX = Math.round((maxX - minX) * 0.08);
    const padY = Math.round((maxY - minY) * 0.12);
    
    return {
        x: Math.max(0, minX - padX),
        y: Math.max(0, minY - padY),
        w: Math.min(w - minX - padX, maxX - minX + padX),
        h: Math.min(h - minY - padY, maxY - minY + padY)
    };
}

// ============= CREATE CUTOUT CANVAS =============
function createCutoutCanvas(image, bounds) {
    const canvas = document.createElement('canvas');
    canvas.width = bounds.w;
    canvas.height = bounds.h;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, bounds.w, bounds.h);
    ctx.drawImage(image, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
    
    return canvas;
}

// ============= PROCESS FILE =============
async function processFile(file) {
    console.log('[FILE] Processing:', file.name);
    state.bgRemovalStatus = 'processing';
    
    if (file.size > 15 * 1024 * 1024) {
        showError('Image too large (max 15MB)');
        return;
    }
    
    try {
        // Step 1: Load original for reference
        const originalUrl = URL.createObjectURL(file);
        const originalImg = new Image();
        await new Promise((resolve, reject) => {
            originalImg.onload = resolve;
            originalImg.onerror = reject;
            originalImg.src = originalUrl;
        });
        state.photo = { img: originalImg, url: originalUrl };
        
        // Step 2: Background removal via IMG.LY
        const cutoutBlob = await removeBackgroundFromFile(file);
        console.log('[BG] Got PNG Blob:', cutoutBlob.size, 'bytes');
        
        // Step 3: Convert Blob to Image
        const cutoutImg = await blobToImage(cutoutBlob);
        console.log('[CUTOUT] Image ready:', cutoutImg.naturalWidth, 'x', cutoutImg.naturalHeight);
        
        // Step 4: Verify alpha channel
        const verification = verifyAlphaChannel(cutoutImg);
        if (!verification.hasTransparency) {
            console.warn('[BG] Low transparency detected');
        }
        
        // Step 5: Find subject bounds
        const bounds = findSubjectBounds(cutoutImg);
        console.log('[BOUNDS] Cropped bounds:', bounds);
        
        // Step 6: Create tight cutout
        const cutoutCanvas = createCutoutCanvas(cutoutImg, bounds);
        state.cutout = cutoutCanvas;
        console.log('[CUTOUT] Final cutout:', cutoutCanvas.width, 'x', cutoutCanvas.height);
        
        state.bgRemovalStatus = 'ready';
        showPhotoPreview(originalImg, cutoutCanvas);
        
    } catch (err) {
        console.error('[ERROR] Processing failed:', err);
        state.bgRemovalStatus = 'error';
        showError(`Could not isolate the person: ${err.message}. Please try another photo.`);
    }
}

// ============= PHOTO PREVIEW =============
function showPhotoPreview(original, cutout) {
    const area = $('upload-area');
    area.innerHTML = '';
    
    if (state.debugMode) {
        // Debug view: original vs cutout side by side
        const debugContainer = document.createElement('div');
        debugContainer.style.display = 'flex';
        debugContainer.style.gap = '16px';
        debugContainer.style.marginBottom = '16px';
        
        // Original
        const origLabel = document.createElement('div');
        origLabel.textContent = 'ORIGINAL';
        origLabel.style.color = '#888';
        origLabel.style.fontSize = '12px';
        
        const origCanvas = document.createElement('canvas');
        origCanvas.width = 90;
        origCanvas.height = 112;
        const origCtx = origCanvas.getContext('2d');
        origCtx.fillStyle = '#1a1a1a';
        origCtx.fillRect(0, 0, 90, 112);
        origCtx.drawImage(original, 0, 0, 90, 112);
        
        const origWrapper = document.createElement('div');
        origWrapper.appendChild(origLabel);
        origWrapper.appendChild(origCanvas);
        origWrapper.style.display = 'flex';
        origWrapper.style.flexDirection = 'column';
        origWrapper.style.alignItems = 'center';
        
        // Cutout with checkerboard
        const cutoutLabel = document.createElement('div');
        cutoutLabel.textContent = 'CUTOUT';
        cutoutLabel.style.color = '#888';
        cutoutLabel.style.fontSize = '12px';
        
        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = 90;
        cutoutCanvas.height = 112;
        const cctx = cutoutCanvas.getContext('2d');
        
        // Checkerboard
        cctx.fillStyle = '#ccc';
        cctx.fillRect(0, 0, 45, 56);
        cctx.fillStyle = '#999';
        cctx.fillRect(45, 0, 45, 56);
        cctx.fillRect(0, 56, 45, 56);
        cctx.fillStyle = '#ccc';
        cctx.fillRect(45, 56, 45, 56);
        cctx.drawImage(cutout, 0, 0, 90, 112);
        
        const cutoutWrapper = document.createElement('div');
        cutoutWrapper.appendChild(cutoutLabel);
        cutoutWrapper.appendChild(cutoutCanvas);
        cutoutWrapper.style.display = 'flex';
        cutoutWrapper.style.flexDirection = 'column';
        cutoutWrapper.style.alignItems = 'center';
        
        debugContainer.appendChild(origWrapper);
        debugContainer.appendChild(cutoutWrapper);
        area.appendChild(debugContainer);
    }
    
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.marginTop = '16px';
    btn.textContent = 'CONTINUE →';
    btn.onclick = (e) => {
        e.stopPropagation();
        renderBuilderPreview();
        showScreen('builder');
    };
    area.appendChild(btn);
}

// ============= SCREEN ROUTING =============
function showScreen(name) {
    console.log('[SCREEN] Switching to:', name);
    ['landing', 'builder', 'result'].forEach(screenName => {
        const el = $(`screen-${screenName}`);
        if (el) el.hidden = screenName !== name;
    });
}

// ============= ARCH MASK =============
function clipToPortraitArch(ctx) {
    const { x, y, width, height } = CARD_LAYOUT.portrait;
    
    ctx.beginPath();
    ctx.moveTo(x + 10, y + height - 20);
    ctx.lineTo(x + width - 10, y + height - 20);
    ctx.bezierCurveTo(x + width + 20, y + height - 20, x + width + 40, y + height - 100, x + width + 60, y + height - 150);
    ctx.bezierCurveTo(x + width + 80, y + height - 250, x + width + 100, y + height - 400, x + width + 120, y + height - 550);
    ctx.bezierCurveTo(x + width + 140, y + height - 650, x + width + 160, y + 200, x + width, y + 100);
    ctx.bezierCurveTo(x + width - 60, y + 80, x + width - 120, y + 120, x + width - 180, y + 180);
    ctx.bezierCurveTo(x + width - 240, y + 250, x + width - 300, y + 350, x + width - 350, y + 450);
    ctx.bezierCurveTo(x + width - 400, y + 550, x + width - 440, y + 650, x + width - 460, y + 720);
    ctx.closePath();
}

// ============= POSITION CALCULATION =============
function calculateCutoutPosition(cutout) {
    const portrait = CARD_LAYOUT.portrait;
    const cw = cutout.width;
    const ch = cutout.height;
    
    const scale = Math.min(portrait.width * 0.85 / cw, portrait.height * 0.85 / ch);
    
    return {
        x: portrait.x + (portrait.width - cw * scale) / 2,
        y: portrait.y + portrait.height * 0.4,
        w: cw * scale,
        h: ch * scale
    };
}

// ============= RENDERING =============
function renderBuilderPreview() {
    console.log('[RENDER] Builder preview');
    
    const canvas = $('card-preview');
    if (!canvas) { console.error('[RENDER] No canvas'); return; }
    if (!templateImg) { loadTemplate().then(renderBuilderPreview); return; }
    
    const ctx = canvas.getContext('2d');
    canvas.width = templateImg.naturalWidth;
    canvas.height = templateImg.naturalHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    
    if (state.cutout) {
        ctx.save();
        const pos = calculateCutoutPosition(state.cutout);
        clipToPortraitArch(ctx);
        ctx.clip();
        ctx.drawImage(state.cutout, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();
        console.log('[RENDER] Cutout composited at:', pos.x, pos.y);
    }
}

function renderResult() {
    console.log('[RENDER] Final result');
    
    const canvas = $('card-result');
    if (!canvas || !templateImg) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = templateImg.naturalWidth;
    canvas.height = templateImg.naturalHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    
    if (state.cutout) {
        ctx.save();
        clipToPortraitArch(ctx);
        ctx.clip();
        const pos = calculateCutoutPosition(state.cutout);
        ctx.drawImage(state.cutout, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();
    }
    
    canvas.toBlob((blob) => {
        state.output = blob;
        console.log('[OUTPUT] Ready:', Math.round(blob.size / 1024) + 'KB');
    }, 'image/png', 1.0);
}

// ============= EVENT BINDING =============
function bindEvents() {
    const frame = $('upload-area');
    const input = $('file-input');
    const uploadBtn = $('upload-btn');
    
    if (frame) {
        frame.onclick = () => input?.click();
        frame.ondragover = (e) => { e.preventDefault(); frame.classList.add('dragover'); };
        frame.ondragleave = (e) => { e.preventDefault(); frame.classList.remove('dragover'); };
        frame.ondrop = async (e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) await processFile(e.dataTransfer.files[0]);
        };
    }
    
    if (input) input.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
    if (uploadBtn) uploadBtn.onclick = (e) => { e.stopPropagation(); input?.click(); };
    if ($('generate-btn')) $('generate-btn').onclick = () => { showScreen('result'); renderResult(); };
    if ($('download-btn')) $('download-btn').onclick = downloadImage;
    if ($('share-btn')) $('share-btn').onclick = shareImage;
    if ($('new-btn')) $('new-btn').onclick = () => showScreen('landing');
}

// ============= UTILITIES =============
function downloadImage() {
    if (!state.output) return;
    const url = URL.createObjectURL(state.output);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hhgoa-builder-id.png';
    a.click();
    URL.revokeObjectURL(url);
}

function shareImage() {
    const text = "Just framed my builder identity for HH Goa 2026 🔥\n\n#FrameInGoa";
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
}

function showError(msg) {
    const area = $('upload-area');
    area.innerHTML = 
        '<div style="color:#ff6b35;text-align:center;padding:12px;font-size:0.875rem;">' + 
        msg + '</div>' +
        '<button class="btn btn-secondary" style="margin-top:12px;">TRY AGAIN</button>';
    area.querySelector('button').onclick = () => showScreen('landing');
}

// ============= DEBUG TOGGLE =============
window.toggleDebug = () => {
    state.debugMode = !state.debugMode;
    console.log('[DEBUG]', state.debugMode ? 'ON' : 'OFF');
    if (state.photo && state.cutout) {
        $('upload-area').innerHTML = '';
        showPhotoPreview(state.photo.img, state.cutout);
    }
};

// ============= INIT =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[INIT] Loading HH Goa 2026 ID Builder...');
    try {
        await loadTemplate();
        bindEvents();
        showScreen('landing');
        console.log('[INIT] Ready');
    } catch (err) {
        console.error('[INIT] Failed:', err);
        showError('Failed to load ID template. Please refresh.');
    }
});