// ONNX Runtime Web configuration
const MODEL_URL = 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx';

let rmbgSession = null;
let ort = null;

/**
 * Initialize ONNX Runtime with RMBG-1.4
 * Uses browser CDN - no bundler required
 */
async function initSession() {
    if (rmbgSession) return rmbgSession;
    
    console.log('[RMBG] Initializing ONNX Runtime...');
    
    // Load ONNX Runtime Web from CDN
    // Using the proper ESM entry point
    const ortModule = await import(
        'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.10.0/dist/ort.min.js'
    );
    
    // The module exports InferenceSession and Tensor differently
    // Try namespace import pattern first
    ort = ortModule;
    
    // Debug: check what we got
    console.log('[RMBG] Module exports:', Object.keys(ortModule));
    console.log('[RMBG] Default:', ortModule?.default);
    console.log('[RMBG] InferenceSession:', ortModule?.InferenceSession);
    console.log('[RMBG] Tensor:', ortModule?.Tensor);
    
    // Handle different export patterns
    let InferenceSession, Tensor;
    
    if (ortModule.InferenceSession) {
        // Direct export
        InferenceSession = ortModule.InferenceSession;
        Tensor = ortModule.Tensor;
    } else if (ortModule.default?.InferenceSession) {
        // Default export with nested APIs
        InferenceSession = ortModule.default.InferenceSession;
        Tensor = ortModule.default.Tensor;
    } else if (ortModule.default) {
        // Try to get from default
        console.log('[RMBG] Checking default exports:', Object.keys(ortModule.default || {}));
        InferenceSession = ortModule.default?.InferenceSession;
        Tensor = ortModule.default?.Tensor;
    }
    
    if (!InferenceSession || !Tensor) {
        throw new Error('[RMBG] Could not find InferenceSession or Tensor in ONNX Runtime Web module');
    }
    
    console.log('[RMBG] Found InferenceSession:', typeof InferenceSession);
    console.log('[RMBG] Found Tensor:', typeof Tensor);
    
    // Configure WASM paths for models
    if (ortModule.env?.wasm) {
        ortModule.env.wasm.wasmPaths = 
            'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.10.0/dist/';
    }
    
    // Create session
    console.log('[RMBG] Creating ONNX session for RMBG-1.4...');
    const session = await InferenceSession.create(MODEL_URL, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
    });
    
    rmbgSession = session;
    console.log('[RMBG] ONNX session initialized successfully');
    console.log('[RMBG] Input names:', session.inputNames);
    console.log('[RMBG] Output names:', session.outputNames);
    
    return session;
}

/**
 * Preprocess image for RMBG-1.4
 */
function preprocessImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const SIZE = 1024;
    
    canvas.width = SIZE;
    canvas.height = SIZE;
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    const tensorData = new Float32Array(3 * SIZE * SIZE);
    
    for (let i = 0; i < SIZE * SIZE; i++) {
        const r = data[i * 4] / 255;
        const g = data[i * 4 + 1] / 255;
        const b = data[i * 4 + 2] / 255;
        
        tensorData[i] = (r - 0.5);
        tensorData[SIZE * SIZE + i] = (g - 0.5);
        tensorData[2 * SIZE * SIZE + i] = (b - 0.5);
    }
    
    return { data: tensorData, dimensions: [1, 3, SIZE, SIZE] };
}

/**
 * Main export: Remove background from image
 */
export async function removeBackground(file) {
    console.log('[RMBG] Processing file:', file.name);
    
    try {
        const session = await initSession();
        
        // Load image
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
        });
        
        URL.revokeObjectURL(objectUrl);
        
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;
        console.log('[RMBG] Image size:', originalWidth, 'x', originalHeight);
        
        // Preprocess
        const inputTensor = preprocessImage(img);
        
        // Create input tensor
        // Get Tensor constructor from the module
        const Tensor = ort?.Tensor || (await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.10.0/dist/ort.min.js')).Tensor;
        const input = new Tensor('float32', inputTensor.data, inputTensor.dimensions);
        
        // Run inference
        console.log('[RMBG] Running inference...');
        const results = await session.run({ 'input': input });
        console.log('[RMBG] Output keys:', Object.keys(results));
        
        // Extract mask
        const mask = extractMask(results, originalWidth, originalHeight);
        
        // Create cutout
        const cutout = createCutout(img, mask);
        
        // Find bounds
        const bounds = findSubjectBounds(cutout);
        console.log('[RMBG] Bounds:', bounds);
        
        // Crop to bounds
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = bounds.width;
        finalCanvas.height = bounds.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.clearRect(0, 0, bounds.width, bounds.height);
        finalCtx.drawImage(
            cutout,
            bounds.x, bounds.y, bounds.width, bounds.height,
            0, 0, bounds.width, bounds.height
        );
        
        // Get blob
        const blob = await new Promise(resolve => {
            finalCanvas.toBlob(resolve, 'image/png', 1.0);
        });
        
        return {
            blob: blob,
            image: finalCanvas,
            width: bounds.width,
            height: bounds.height,
            bounds: bounds
        };
        
    } catch (err) {
        console.error('[RMBG] Error:', err);
        throw err;
    }
}

/**
 * Extract mask from ONNX output
 */
function extractMask(output, width, height) {
    const key = Object.keys(output)[0];
    const tensor = output[key];
    
    const outH = tensor.dims[2];
    const outW = tensor.dims[3] || tensor.dims[1];
    const maskData = tensor.data;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcX = Math.floor((x / width) * outW);
            const srcY = Math.floor((y / height) * outH);
            const srcIdx = srcY * outW + srcX;
            
            let alpha = maskData[srcIdx];
            if (alpha > 1) alpha = alpha / 255;
            alpha = Math.max(0, Math.min(1, alpha));
            
            const dstIdx = (y * width + x) * 4;
            imageData.data[dstIdx] = 255;
            imageData.data[dstIdx + 1] = 255;
            imageData.data[dstIdx + 2] = 255;
            imageData.data[dstIdx + 3] = alpha * 255;
        }
    }
    
    return imageData;
}

/**
 * Create cutout with transparent background
 */
function createCutout(img, maskImageData) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    
    for (let i = 0; i < maskImageData.data.length; i += 4) {
        data.data[i + 3] = maskImageData.data[i + 3];
    }
    
    ctx.putImageData(data, 0, 0);
    return canvas;
}

/**
 * Find subject bounds by alpha threshold
 */
function findSubjectBounds(canvas) {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const w = canvas.width;
    const h = canvas.height;
    
    let minX = w, minY = h, maxX = 0, maxY = 0;
    const THRESHOLD = 8;
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4 + 3;
            if (data[i] > THRESHOLD) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    const padX = Math.round((maxX - minX) * 0.08);
    const padY = Math.round((maxY - minY) * 0.12);
    
    return {
        x: Math.max(0, minX - padX),
        y: Math.max(0, minY - padY),
        width: Math.min(w - minX - padX, maxX - minX + padX),
        height: Math.min(h - minY - padY, maxY - minY + padY),
        originalMinX: minX,
        originalMinY: minY,
        originalMaxX: maxX,
        originalMaxY: maxY
    };
}

/**
 * Reset session for testing
 */
export async function resetSession() {
    if (rmbgSession) {
        await rmbgSession.dispose();
        rmbgSession = null;
        console.log('[RMBG] Session reset');
    }
}