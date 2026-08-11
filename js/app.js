// Import ONNX-based RMBG-1.4 background removal
import { removeBackground, resetSession } from
    './services/backgroundRemoval.js';

/* HH Goa 2026 - RMBG-1.4 Background Removal Integration
 * 
 * Backend: briaai/RMBG-1.4 via ONNX Runtime Web
 * Model: ONNX model directly (bypasses Transformers.js pipeline resolution issues)
 * Output: Transparent PNG foreground cutout
 * 
 * IMPORTANT: The cutout preserves the COMPLETE person.
 * No body parts are cropped during segmentation.
 */

// Global state
let templateImg = null;
const state = {
    photo: null,
    cutout: null,
    bgRemovalStatus: 'idle',
    debugMode: false,
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

// Card layout - measured from front.png (1024x1536 canvas)
// Reference card positions: LEFT COLUMN for personal info, RIGHT COLUMN for stats

const CARD_LAYOUT = {
    width: 1024,
    height: 1536,
    portrait: {
        x: 222,  // left padding
        y: 78,   // top padding  
        width: 580,   // 1024 - 222*2 - 20
        height: 750
    },
    photo: {
        x: 222,
        y: 78,
        width: 580,
        height: 750
    },
    // Text field positions - LEFT COLUMN (personal info)
    fields: {
        name: { x: 55, y: 505, w: 430, h: 200, fontSize: 68 },
        role: { x: 55, y: 715, w: 430, h: 110, fontSize: 32 },
        stack: { x: 55, y: 835, w: 430, h: 155, fontSize: 20 },
        builderTitle: { x: 55, y: 985, w: 430, h: 155, fontSize: 40 },
        building: { x: 55, y: 1140, w: 430, h: 165, fontSize: 24 },
        sideQuest: { x: 55, y: 1305, w: 430, h: 135, fontSize: 22 },
        // RIGHT COLUMN (below portrait)
        sleepStatus: { x: 535, y: 850, w: 420, h: 130, fontSize: 20 },
        chaos: { x: 535, y: 1010, w: 420, h: 115, fontSize: 18 },
        poweredBy: { x: 535, y: 1105, w: 420, h: 135, fontSize: 20 },
        mostUsedKey: { x: 535, y: 1240, w: 270, h: 110, fontSize: 24 },
        favoriteError: { x: 535, y: 1355, w: 270, h: 100, fontSize: 36 },
        id: { x: 540, y: 1470, w: 400, h: 50, fontSize: 24 }
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

// ============= PROCESS FILE =============
async function processFile(file) {
    console.log('[FILE] Processing:', file.name);
    state.bgRemovalStatus = 'processing';
    
    if (file.size > 15 * 1024 * 1024) {
        showError('Image too large (max 15MB)');
        return;
    }
    
    try {
        // Store original for preview
        const originalUrl = URL.createObjectURL(file);
        const originalImg = new Image();
        originalImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            originalImg.onload = resolve;
            originalImg.onerror = reject;
            originalImg.src = originalUrl;
        });
        state.photo = { img: originalImg, url: originalUrl };
        
        // Background removal with ONNX RMBG
        const result = await removeBackground(file);
        
        // result.image is already the final cutout canvas
        state.cutout = result.image;
        
        console.log('[CUTOUT] Final cutout:', result.image.width, 'x', result.image.height);
        console.log('[BOUNDS] Detected bounds:', result.bounds);
        
        state.bgRemovalStatus = 'ready';
        showPhotoPreview(originalImg, result.image, result.bounds);
        
    } catch (err) {
        console.error('[ERROR] Processing failed:', err);
        showError(`Model error: ${err.message}. Check console for details.`);
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
        
        // Original panel
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
        
        // Cutout panel
        const cutoutWrapper = document.createElement('div');
        cutoutWrapper.style.display = 'flex';
        cutoutWrapper.style.flexDirection = 'column';
        cutoutWrapper.style.alignItems = 'center';
        cutoutWrapper.style.gap = '8px';
        
        const cutoutLabel = document.createElement('div');
        cutoutLabel.textContent = 'CUTOUT';
        cutoutLabel.style.color = '#888';
        cutoutLabel.style.fontSize = '14px';
        cutoutLabel.style.fontWeight = 'bold';
        
        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = 160;
        cutoutCanvas.height = 213;
        const cctx = cutoutCanvas.getContext('2d');
        
        // Draw checkerboard background for transparency view
        cctx.fillStyle = '#1a1a1a';
        cctx.fillRect(0, 0, 160, 213);
        // Add checker pattern
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
        debugHeader.textContent = 'BACKGROUND REMOVAL TEST';
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
    
    // Scale to fit within portrait area
    const scale = Math.min(
        portrait.width * 0.85 / cw,
        portrait.height * 0.85 / ch
    );
    
    const renderedWidth = cw * scale;
    const renderedHeight = ch * scale;
    
    const x = portrait.x + (portrait.width - renderedWidth) / 2;
    const y = portrait.y + 50;
    
    console.log('[RENDER] Position:', { scale, x: Math.round(x), y: Math.round(y) });
    
    return {
        x: x,
        y: y,
        w: renderedWidth,
        h: renderedHeight
    };
}

// ============= TEXT RENDERING =============
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    let currentY = y;
    
    lines.forEach(line => {
        const words = line.split(' ');
        let lineText = '';
        
        words.forEach(word => {
            const testText = lineText ? lineText + ' ' + word : word;
            if (ctx.measureText(testText).width > maxWidth && lineText) {
                ctx.fillText(lineText, x, currentY);
                lineText = word;
                currentY += lineHeight;
            } else {
                lineText = testText;
            }
        });
        
        if (lineText) {
            ctx.fillText(lineText, x, currentY);
        }
        currentY += lineHeight;
    });
}

function drawText(ctx, field, value) {
    const f = CARD_LAYOUT.fields[field];
    if (!f) return;
    
    ctx.save();
    ctx.fillStyle = '#F5F5F7'; // White text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${f.fontSize}px system-ui, sans-serif`;
    
    const centerX = f.x + f.w / 2;
    const centerY = f.y + f.h / 2;
    
    drawWrappedText(ctx, value, centerX, centerY, f.w - 20, f.fontSize * 1.3);
    ctx.restore();
}

// ============= CARD RENDERING =============
function renderCard(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = CARD_LAYOUT.width;
    canvas.height = CARD_LAYOUT.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw template
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw cutout
    if (state.cutout) {
        ctx.save();
        const pos = calculateCutoutPosition(state.cutout);
        clipToPortraitArch(ctx);
        ctx.clip();
        ctx.drawImage(state.cutout, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();
        console.log('[RENDER] Cutout composited');
    }
    
    // Draw data fields
    drawText(ctx, 'name', state.form.name);
    drawText(ctx, 'role', state.form.role);
    drawText(ctx, 'stack', state.form.stack);
    drawText(ctx, 'builderTitle', state.form.builderTitle);
    drawText(ctx, 'building', state.form.building);
    drawText(ctx, 'sideQuest', state.form.sideQuest);
    drawText(ctx, 'sleepStatus', state.form.sleepStatus);
    drawText(ctx, 'chaos', `CHAOS: ${state.form.chaos}%`);
    drawText(ctx, 'poweredBy', state.form.poweredBy);
    drawText(ctx, 'mostUsedKey', state.form.mostUsedKey);
    drawText(ctx, 'favoriteError', `ERROR: ${state.form.favoriteError}`);
    drawText(ctx, 'id', `HHG26-ID: ${state.id}`);
    
    console.log('[RENDER] Card complete');
}

function renderBuilderPreview() {
    console.log('[RENDER] Builder preview');
    const canvas = $('card-preview');
    if (!canvas) return;
    renderCard(canvas);
}

function renderResult() {
    console.log('[RENDER] Final result');
    const canvas = $('card-result');
    if (!canvas) return;
    
    renderCard(canvas);
    
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
    
    // Upload
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
window.toggleDebug = () => {
    state.debugMode = !state.debugMode;
    console.log('[DEBUG]', state.debugMode ? 'ON' : 'OFF');
};

window.togglePhotoDebug = () => {
    state.photoDebug = !state.photoDebug;
    console.log('[DEBUG] Photo debug:', state.photoDebug ? 'ON' : 'OFF');
};

// Debug: Show field layout overlay on the card
window.toggleCardLayoutDebug = () => {
    state.debugMode = !state.debugMode;
    console.log('[DEBUG] Card layout:', state.debugMode ? 'ON' : 'OFF');
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
        showError('Failed to load resources.');
    }
});