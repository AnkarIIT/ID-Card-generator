import { removeBackground, initSAM } from './services/sam2.js';
import { renderCard } from './services/cardGenerator.js';
import { CARD_LAYOUT, buildArchMask, fitCutout } from './services/portraitFitter.js';

let templateImg = null;
const state = {
    photo: null,
    cutout: null,
    mask: null,
    bgRemovalStatus: 'idle',
    debugMode: false,
    photoDebug: false,
    form: {
        name: "SHASHWAT KUMAR",
        role: "DESIGNER",
        stack: "FIGMA • PHOTOSHOP • ILLUSTRATOR • BLENDER • AFTER EFFECTS",
        builderTitle: "PROFESSIONAL\nजुगाड़ SPECIALIST",
        building: "खुद को और कुछ धांसू चीजें",
        sideQuest: "STARTUPS • TRAVEL • ANIME\n3D PRINTS • LUCKNOW FOOD",
        sleepStatus: "404: NOT FOUND (KAAM > NEEND)",
        chaos: 82,
        poweredBy: "CHAI + जुगाड़ + QUESTIONABLE DECISIONS",
        mostUsedKey: "CTRL + Z",
        favoriteError: "404"
    },
    id: "0X5A7B1"
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

// ============= PROCESS FILE =============
async function processFile(file) {
    console.log('[SAM2] Processing:', file.name);
    state.bgRemovalStatus = 'processing';

    if (file.size > 15 * 1024 * 1024) {
        showError('Image too large (max 15MB)');
        return;
    }

    const area = $('upload-area');
    if (area) {
        area.innerHTML =
            '<div class="upload-label">SAM2 SEGMENTING…</div>' +
            '<div class="upload-prompt">AI CUTTING OUT YOUR PHOTO</div>' +
            '<div class="upload-hint">first run loads the model (~155MB)</div>';
    }

    try {
        const originalUrl = URL.createObjectURL(file);
        const originalImg = new Image();
        originalImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            originalImg.onload = resolve;
            originalImg.onerror = reject;
            originalImg.src = originalUrl;
        });
        state.photo = { img: originalImg, url: originalUrl };

        const result = await removeBackground(originalImg);

        state.cutout = result.image;
        state.mask = result.mask || null;
        state.bounds = result.bounds || null;

        console.log('[CUTOUT] Final cutout:', result.image.width, 'x', result.image.height);
        console.log('[BOUNDS] Detected bounds:', result.bounds);

        console.log('[RMBG/SAM2]', JSON.stringify({
            source: [originalImg.naturalWidth, originalImg.naturalHeight],
            mask: result.mask ? [result.mask.width, result.mask.height] : null,
            subjectBounds: result.bounds,
            cutout: [result.image.width, result.image.height],
            targetPortrait: [CARD_LAYOUT.portrait.x, CARD_LAYOUT.portrait.y,
                CARD_LAYOUT.portrait.width, CARD_LAYOUT.portrait.height]
        }));

        state.bgRemovalStatus = 'ready';
        showPhotoPreview(originalImg, result.image, result.bounds);

    } catch (err) {
        console.error('[ERROR] Processing failed:', err);
        showError(`Error: ${err.message}. Check console for details.`);
    }
}

// ============= PHOTO PREVIEW =============
function showPhotoPreview(original, cutout, bounds) {
    const area = $('upload-area');
    area.innerHTML = '';

    if (state.debugMode) {
        console.log('[DEBUG] state.photo:', state.photo);
        console.log('[DEBUG] state.cutout:', {
            width: state.cutout?.width,
            height: state.cutout?.height
        });
        console.log('[DEBUG] bounds:', bounds);

        const origWrapper = document.createElement('div');
        origWrapper.style.display = 'flex';
        origWrapper.style.flexDirection = 'column';
        origWrapper.style.alignItems = 'center';
        origWrapper.style.gap = '8px';

        const origLabel = document.createElement('div');
        origLabel.textContent = 'ORIGINAL PHOTO';
        origLabel.style.color = '#888';
        origLabel.style.fontSize = '14px';
        origLabel.style.fontWeight = 'bold';

        const origCanvas = document.createElement('canvas');
        origCanvas.width = 160;
        origCanvas.height = 213;
        const origCtx = origCanvas.getContext('2d');
        origCtx.fillStyle = '#1a1a1a';
        origCtx.fillRect(0, 0, 160, 213);
        origCtx.drawImage(original, 0, 0, 160, 213);

        origWrapper.appendChild(origLabel);
        origWrapper.appendChild(origCanvas);

        const cutoutWrapper = document.createElement('div');
        cutoutWrapper.style.display = 'flex';
        cutoutWrapper.style.flexDirection = 'column';
        cutoutWrapper.style.alignItems = 'center';
        cutoutWrapper.style.gap = '8px';

        const cutoutLabel = document.createElement('div');
        cutoutLabel.textContent = 'CUTOUT (SAM2)';
        cutoutLabel.style.color = '#888';
        cutoutLabel.style.fontSize = '14px';
        cutoutLabel.style.fontWeight = 'bold';

        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = 160;
        cutoutCanvas.height = 213;
        const cctx = cutoutCanvas.getContext('2d');

        cctx.fillStyle = '#1a1a1a';
        cctx.fillRect(0, 0, 160, 213);
        cctx.fillStyle = '#2a2a2a';
        cctx.fillRect(0, 0, 8, 8);
        cctx.fillRect(16, 0, 8, 8);
        cctx.fillRect(0, 16, 8, 8);
        cctx.fillRect(16, 16, 8, 8);
        cctx.fillRect(8, 8, 8, 8);

        cctx.drawImage(cutout, 0, 0, 160, 213);

        cutoutWrapper.appendChild(cutoutLabel);
        cutoutWrapper.appendChild(cutoutCanvas);

        const boundsLabel = document.createElement('div');
        boundsLabel.textContent = `BOUNDS: ${bounds ? JSON.stringify(bounds) : 'none'}`;
        boundsLabel.style.color = '#4ade80';
        boundsLabel.style.fontSize = '12px';
        boundsLabel.style.fontFamily = 'monospace';

        const debugContainer = document.createElement('div');
        debugContainer.style.display = 'flex';
        debugContainer.style.flexDirection = 'column';
        debugContainer.style.gap = '16px';
        debugContainer.style.alignItems = 'center';
        debugContainer.style.padding = '20px';

        const debugHeader = document.createElement('div');
        debugHeader.textContent = 'SAM2 PERSON SEGMENTATION TEST';
        debugHeader.style.color = '#ff6b35';
        debugHeader.style.fontWeight = 'bold';
        debugHeader.style.fontSize = '18px';
        debugHeader.style.marginBottom = '12px';

        debugContainer.appendChild(debugHeader);
        debugContainer.appendChild(origWrapper);
        debugContainer.appendChild(cutoutWrapper);
        debugContainer.appendChild(boundsLabel);
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

// ============= CARD RENDERING =============
function renderBuilderPreview() {
    console.log('[RENDER] Builder preview');
    const canvas = $('card-preview');
    if (!canvas) return;
    renderCard(canvas, state, templateImg);
}

function renderResult() {
    console.log('[RENDER] Final result');
    const canvas = $('card-result');
    if (!canvas) return;

    renderCard(canvas, state, templateImg);

    canvas.toBlob((blob) => {
        state.output = blob;
        console.log('[OUTPUT] Ready:', Math.round(blob.size / 1024) + 'KB');
    }, 'image/png', 1.0);
}

// ============= EVENT BINDING =============
function bindEvents() {
    const inputs = {
        name: 'input-name',
        role: 'input-role',
        stack: 'input-stack',
        building: 'input-building',
        sideQuest: 'input-sidequest',
        sleepStatus: 'input-sleep'
    };

    Object.entries(inputs).forEach(([field, id]) => {
        const input = $(id);
        if (!input) return;

        input.value = state.form[field];
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            state.form[field] = val;
            renderBuilderPreview();
        });
    });

    const genBtn = $('generate-btn');
    if (genBtn) {
        genBtn.onclick = () => {
            showScreen('result');
            renderResult();
        };
    }

    const dlBtn = $('download-btn');
    if (dlBtn) {
        dlBtn.onclick = downloadImage;
    }

    const shareBtn = $('share-btn');
    if (shareBtn) {
        shareBtn.onclick = shareImage;
    }

    const newBtn = $('new-btn');
    if (newBtn) {
        newBtn.onclick = () => showScreen('landing');
    }

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

// ============= DEBUG =============
window.toggleSAMDebug = () => {
    if (!state.photo?.img || !state.cutout || !state.mask) {
        console.warn('[SAM DEBUG] No processed photo yet. Upload first.');
        return;
    }
    const area = $('upload-area');
    if (!area) return;

    const panel = (label, canvas) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
        const lbl = document.createElement('div');
        lbl.textContent = label;
        lbl.style.cssText = 'color:#888;font-size:12px;font-weight:bold;letter-spacing:1px;';
        wrapper.appendChild(lbl);
        wrapper.appendChild(canvas);
        return wrapper;
    };

    const draw = (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    };

    const origCanvas = draw(240, 320);
    origCanvas.getContext('2d').drawImage(state.photo.img, 0, 0, 240, 320);

    const maskCanvas = draw(240, 320);
    maskCanvas.getContext('2d').drawImage(state.mask, 0, 0, 240, 320);

    const cutCanvas = draw(240, 320);
    const cctx = cutCanvas.getContext('2d');
    cctx.fillStyle = '#1a1a1a';
    cctx.fillRect(0, 0, 240, 320);
    cctx.fillStyle = '#2a2a2a';
    for (let by = 0; by < 320; by += 16) {
        for (let bx = 0; bx < 240; bx += 16) {
            if ((bx / 16 + by / 16) % 2 === 0) cctx.fillRect(bx, by, 16, 16);
        }
    }
    cctx.drawImage(state.cutout, 0, 0, 240, 320);

    const archCanvas = draw(1024, 1536);
    const actx = archCanvas.getContext('2d');
    if (templateImg) actx.drawImage(templateImg, 0, 0, 1024, 1536);

    const arch = buildArchMask(templateImg);
    const portrait = CARD_LAYOUT.portrait;
    const pos = fitCutout(state.cutout, arch);

    const layer = draw(portrait.width, portrait.height);
    const lctx = layer.getContext('2d');
    lctx.drawImage(state.cutout, pos.x - portrait.x, pos.y - portrait.y, pos.w, pos.h);
    lctx.globalCompositeOperation = 'destination-in';
    lctx.drawImage(arch.canvas, 0, 0);
    actx.drawImage(layer, portrait.x, portrait.y);
    archCanvas.style.cssText = 'width:auto;height:320px;';

    const header = document.createElement('div');
    header.textContent = 'SAM2 DEBUG — ORIGINAL | MASK | CUTOUT | ARCH';
    header.style.cssText = 'color:#ff6b35;font-weight:bold;font-size:14px;letter-spacing:1px;';

    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;justify-content:center;padding:16px;';
    container.appendChild(panel('ORIGINAL', origCanvas));
    container.appendChild(panel('MASK', maskCanvas));
    container.appendChild(panel('CUTOUT', cutCanvas));
    container.appendChild(panel('ARCH PREVIEW', archCanvas));

    area.innerHTML = '';
    area.appendChild(header);
    area.appendChild(container);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.marginTop = '8px';
    btn.textContent = 'CONTINUE →';
    btn.onclick = (e) => {
        e.stopPropagation();
        renderBuilderPreview();
        showScreen('builder');
    };
    area.appendChild(btn);
    console.log('[SAM DEBUG] Panels rendered');
};

window.toggleDebug = () => {
    state.debugMode = !state.debugMode;
    console.log('[DEBUG]', state.debugMode ? 'ON' : 'OFF');
};

window.togglePhotoDebug = () => {
    state.photoDebug = !state.photoDebug;
    console.log('[DEBUG] Photo debug:', state.photoDebug ? 'ON' : 'OFF');
};

window.toggleCardLayoutDebug = () => {
    state.debugMode = !state.debugMode;
    console.log('[DEBUG] Card layout:', state.debugMode ? 'ON' : 'OFF');
};

// ============= INIT =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[INIT] Loading HH Goa 2026 ID Builder (SAM2)...');
    try {
        await loadTemplate();
        bindEvents();
        showScreen('landing');
        initSAM().catch((err) => {
            console.warn('[SAM2] Warm-up failed (will retry on upload):', err);
        });
        console.log('[INIT] Ready');
    } catch (err) {
        console.error('[INIT] Failed:', err);
        showError('Failed to load resources.');
    }
});
