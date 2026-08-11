/* HH Goa 2026 - Canvas Rendering with Background Removal */

// Global template image
let templateImg = null;

// Card layout coordinates (measured from front.png)
const CARD_LAYOUT = {
    // Canvas dimensions
    width: 1080,
    height: 1350,
    
    // Pink portrait arch region on front.png
    // Positioned in upper-right portion of card
    photo: {
        x: 480,      // left edge of portrait region
        y: 120,      // top edge  
        width: 480,   // width of portrait area
        height: 600,  // height (from arch top to bottom)
        
        // Actual pink arch mask path coordinates (derived from template)
        // The ornate pink region starts around corner of arch
        mask: {
            // Left curve start point (pink arch interior)
            leftX: 520,
            leftY: 280,
            // Right edge of portrait
            rightX: 920,
            // Top of head area
            topCenterX: 700,
            topCenterY: 150
        }
    }
};

// App state
const state = {
    photo: null,
    cutout: null,
    output: null
};

// DOM helper
const $ = (id) => document.getElementById(id);

// Load Template
async function loadTemplate() {
    console.log('[TEMPLATE] Loading front.png...');
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            console.log('[TEMPLATE] Loaded:', img.naturalWidth, 'x', img.naturalHeight);
            templateImg = this;
            resolve(this);
        };
        img.onerror = function(e) {
            console.error('[TEMPLATE] Failed to load:', e);
            reject(e);
        };
        img.src = './front.png';
    });
}

// Background Removal using @imgly/background-removal
async function removeBackground(file) {
    console.log('[BACKGROUND] Starting removal for file:', file.name);
    
    return new Promise((resolve, reject) => {
        if (typeof BackgroundRemoval === 'undefined') {
            console.error('[BACKGROUND] Library not loaded');
            reject(new Error('Background removal library not available'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async function() {
            try {
                const result = await BackgroundRemoval.remove(this.result, {
                    background: 'white',
                    saveAsWebP: false
                });
                console.log('[BACKGROUND] Removal complete, dimensions:', result.width, 'x', result.height);
                resolve(result);
            } catch (err) {
                console.error('[BACKGROUND] Removal failed:', err);
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Screen routing - use native hidden attribute
function showScreen(name) {
    const screens = {
        landing: $('screen-landing'),
        builder: $('screen-builder'),
        result: $('screen-result')
    };
    
    Object.entries(screens).forEach(([screenName, element]) => {
        if (!element) {
            console.error('[SCREEN] Missing element:', screenName);
            return;
        }
        element.hidden = screenName !== name;
    });
}

// Render Builder Preview with template and photo cutout
function renderBuilderPreview() {
    console.log('[RENDER] renderBuilderPreview called');
    
    const canvas = $('card-preview');
    if (!canvas) {
        console.error('[RENDER] Canvas not found');
        return;
    }
    
    if (!templateImg) {
        console.log('[RENDER] Waiting for template...');
        loadTemplate().then(() => renderBuilderPreview());
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match template
    canvas.width = templateImg.naturalWidth;
    canvas.height = templateImg.naturalHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw template background (includes pink arch)
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    console.log('[RENDER] Template drawn');
    
    // Draw cutout photo if available
    if (state.cutout) {
        console.log('[RENDER] Drawing cutout, dimensions:', state.cutout.width || state.cutout.naturalWidth);
        
        ctx.save();
        
        // Create mask for the pink arch region
        // Based on actual front.png pink portrait area
        createPortraitMask(ctx, canvas.width, canvas.height);
        ctx.clip();
        
        // Calculate position to fit person naturally
        const position = calculatePhotoPosition(state.cutout, canvas);
        
        // Draw the cutout (transparent background will show pink arch)
        ctx.drawImage(state.cutout, position.x, position.y, position.w, position.h);
        console.log('[RENDER] Cutout positioned at:', position.x, position.y);
        
        ctx.restore();
    }
}

// Create the portrait arch clipping path
function createPortraitMask(ctx, width, height) {
    // Create path matching the ornate pink arch in front.png
    // This is the interior region where the person should appear
    
    ctx.beginPath();
    
    // Start from lower-left corner of portrait area
    ctx.moveTo(500, 720);
    
    // Lower edge (bottom of card, under portrait)
    ctx.lineTo(940, 720);
    
    // Right curve - following the ornate pink arch shape
    ctx.bezierCurveTo(
        980, 680,  // control point 1
        990, 550,  // control point 2  
        960, 450   // end point (arch right interior)
    );
    
    // Top of arch - snaking up to frame corner
    ctx.bezierCurveTo(
        940, 380,  // control point 1
        880, 320,  // control point 2
        780, 280   // end point (arch top center)
    );
    
    // Left side of arch
    ctx.bezierCurveTo(
        700, 260,  // control point 1
        650, 280,  // control point 2
        620, 340   // end point (arch left interior)
    );
    
    // Inner arc - following pink artwork contour
    ctx.bezierCurveTo(
        600, 400,  // 
        590, 500,  //
        600, 600   // back toward bottom
    );
    
    // Close the path
    ctx.lineTo(500, 720);
    ctx.closePath();
}

// Calculate optimal photo position/scale
function calculatePhotoPosition(cutout, canvas) {
    // Target region within the arch
    const target = {
        x: CARD_LAYOUT.photo.x + 20,    // left padding
        y: CARD_LAYOUT.photo.y + 40,    // top padding  
        width: CARD_LAYOUT.photo.width - 40,
        height: CARD_LAYOUT.photo.height - 80
    };
    
    // Get cutout dimensions
    const cutoutW = cutout.width || cutout.naturalWidth;
    const cutoutH = cutout.height || cutout.naturalHeight;
    
    // Calculate scale to fit naturally (not fill entire region)
    // Leave some pink artwork visible around the person
    const scale = Math.min(
        target.width / cutoutW * 0.85,   // 85% width fit
        target.height / cutoutH * 0.95   // 95% height fit
    );
    
    // Position: center the person in the portrait area
    // Adjust vertical position so head is in upper portion
    const posWidth = cutoutW * scale;
    const posHeight = cutoutH * scale;
    const posX = target.x + (target.width - posWidth) / 2 + 30;  // slightly offset right
    const posY = target.y + 80;  // lower portion of arch
    
    return {
        x: posX,
        y: posY,
        w: posWidth,
        h: posHeight
    };
}

// Process uploaded file with background removal
async function processFile(file) {
    console.log('[FILE] Processing:', file.name);
    
    if (file.size > 15 * 1024 * 1024) {
        showError('Image too large (max 15MB)');
        return;
    }
    
    try {
        // First load the image to verify
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
        });
        
        console.log('[FILE] Loaded:', img.naturalWidth, 'x', img.naturalHeight);
        
        // Store original
        state.photo = {
            img: img,
            objectUrl: objectUrl,
            file: file
        };
        
        // Remove background
        console.log('[BACKGROUND] Calling removeBackground...');
        try {
            const blob = await removeBackground(file);
            
            // Convert result to image
            const cutoutImg = new Image();
            await new Promise((resolve, reject) => {
                cutoutImg.onload = resolve;
                cutoutImg.onerror = reject;
                if (typeof blob === 'string') {
                    cutoutImg.src = blob;
                } else {
                    cutoutImg.src = URL.createObjectURL(blob);
                }
            });
            
            state.cutout = cutoutImg;
            console.log('[BACKGROUND] Cutout ready:', cutoutImg.naturalWidth, 'x', cutoutImg.naturalHeight);
            
        } catch (bgErr) {
            console.error('[BACKGROUND] Removal failed, using original:', bgErr);
            // Fall back to original but log error
            state.cutout = img;
        }
        
        // Show preview
        showPhotoPreview();
        
    } catch (err) {
        console.error('[FILE] Processing failed:', err);
        URL.revokeObjectURL(objectUrl);
        showError('Failed to process image');
    }
}

// Show photo preview with cutout
function showPhotoPreview() {
    const area = $('upload-area');
    area.innerHTML = '';
    
    // Show a preview of the processed image
    const preview = document.createElement('canvas');
    preview.width = 180;
    preview.height = 225;
    const ctx = preview.getContext('2d');
    
    // Draw cutout or original
    const src = state.cutout || state.photo?.img;
    if (src) {
        // Check if it's a canvas (from background removal)
        if (src.canvas) {
            ctx.drawImage(src.canvas, 15, 15, 150, 200);
        } else {
            ctx.drawImage(src, 15, 15, 150, 200);
        }
    }
    
    area.appendChild(preview);
    
    // Continue button
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.marginTop = '16px';
    btn.textContent = 'CONTINUE →';
    btn.onclick = (e) => {
        e.stopPropagation();
        console.log('[FLOW] Photo processed, showing builder');
        renderBuilderPreview();
        showScreen('builder');
    };
    area.appendChild(btn);
}

// Render final result
function renderResult() {
    console.log('[RENDER] renderResult');
    
    const canvas = $('card-result');
    if (!canvas || !templateImg) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = templateImg.naturalWidth;
    canvas.height = templateImg.naturalHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    
    // Draw cutout if available
    if (state.cutout) {
        ctx.save();
        
        createPortraitMask(ctx, canvas.width, canvas.height);
        ctx.clip();
        const pos = calculatePhotoPosition(state.cutout, canvas);
        ctx.drawImage(state.cutout, pos.x, pos.y, pos.w, pos.h);
        
        ctx.restore();
    }
    
    // Create download blob
    canvas.toBlob((blob) => {
        state.output = blob;
        console.log('[OUTPUT] Created:', blob.size, 'bytes');
    }, 'image/png', 1.0);
}

// Event handlers
function bindEvents() {
    const uploadFrame = $('upload-area');
    const fileInput = $('file-input');
    const uploadBtn = $('upload-btn');
    const genBtn = $('generate-btn');
    
    if (uploadFrame) {
        uploadFrame.onclick = () => fileInput?.click();
        uploadFrame.ondragover = (e) => { e.preventDefault(); uploadFrame.classList.add('dragover'); };
        uploadFrame.ondragleave = (e) => { e.preventDefault(); uploadFrame.classList.remove('dragover'); };
        uploadFrame.ondrop = async (e) => {
            e.preventDefault();
            uploadFrame.classList.remove('dragover');
            if (e.dataTransfer.files[0]) await processFile(e.dataTransfer.files[0]);
        };
    }
    
    if (fileInput) {
        fileInput.onchange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
    }
    if (uploadBtn) uploadBtn.onclick = (e) => { e.stopPropagation(); fileInput?.click(); };
    if (genBtn) genBtn.onclick = () => { showScreen('result'); renderResult(); };
    
    // Result buttons
    if ($('download-btn')) $('download-btn').onclick = downloadImage;
    if ($('share-btn')) $('share-btn').onclick = shareImage;
    if ($('new-btn')) $('new-btn').onclick = () => showScreen('landing');
}

// Download function
function downloadImage() {
    if (!state.output) return;
    const url = URL.createObjectURL(state.output);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hhgoa-builder-id.png';
    a.click();
    URL.revokeObjectURL(url);
}

// Share function
function shareImage() {
    const text = "Just framed my builder identity for HH Goa 2026 🔥\n\n#FrameInGoa";
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
}

// Error display
function showError(msg) {
    const area = $('upload-area');
    area.innerHTML = '<div style="color:#ff6b35;text-align:center;padding:12px;">' + msg + '</div>';
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[INIT] Loading...');
    await loadTemplate();
    bindEvents();
    showScreen('landing');
});