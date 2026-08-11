// ONNX Runtime Web model URL for RMBG-1.4
const MODEL_URL = 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx';

let rmbgSession = null;

/**
 * Initialize ONNX Runtime session with RMBG-1.4
 */
async function initSession() {
    if (rmbgSession) return rmbgSession;
    
    console.log('[RMBG] Initializing ONNX session...');
    
    // Load ort.js dynamically
    const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@latest/dist/ort.min.js');
    
    const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        sessionOptions: {
            // Reduce memory usage
            externalMemLimit: 1024 * 1024 * 1024
        }
    });
    
    rmbgSession = session;
    console.log('[RMBG] ONNX session initialized');
    
    // Log input/output info
    console.log('[RMBG] Input names:', session.inputNames);
    console.log('[RMBG] Output names:', session.outputNames);
    
    return session;
}

/**
 * Preprocess image for RMBG-1.4
 * RMBG expects 1024x1024 input, normalized with mean=[0.5,0.5,0.5], std=[1,1,1]
 */
function preprocessImage(img, session) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // RMBG input size
    const SIZE = 1024;
    canvas.width = SIZE;
    canvas.height = SIZE;
    
    // Draw and resize
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    
    // Convert to tensor format: [1, 3, 1024, 1024]
    const tensorData = new Float32Array(3 * SIZE * SIZE);
    
    for (let i = 0; i < SIZE * SIZE; i++) {
        const r = data[i * 4] / 255;
        const g = data[i * 4 + 1] / 255;
        const b = data[i * 4 + 2] / 255;
        
        // Normalize with mean=[0.5, 0.5, 0.5], std=[1, 1, 1]
        tensorData[i] = (r - 0.5) / 1;
        tensorData[SIZE * SIZE + i] = (g - 0.5) / 1;
        tensorData[2 * SIZE * SIZE + i] = (b - 0.5) / 1;
    }
    
    // Create tensor [1, 3, 1024, 1024] - batch, channels, height, width
    return {
        data: tensorData,
        dimensions: [1, 3, SIZE, SIZE]
    };
}

/**
 * Run RMBG-1.4 inference
 */
async function runInference(tensor, session) {
    console.log('[RMBG] Running inference...');
    
    const results = await session.run({
        'input': new Ort.Tensor('float32', tensor.data, tensor.dimensions)
    });
    
    console.log('[RMBG] Output keys:', Object.keys(results));
    
    return results;
}

/**
 * Extract foreground mask from ONNX output
 */
function extractMask(output, originalWidth, originalHeight) {
    // Get the output tensor (usually named 'output' or similar)
    const outputKey = Object.keys(output)[0];
    const tensor = output[outputKey];
    
    console.log('[RMBG] Output tensor shape:', tensor.dims);
    console.log('[RMBG] Output tensor size:', tensor.data.length);
    
    const outputHeight = tensor.dims[1]; // Batch first, then channels
    const outputWidth = tensor.dims[2];
    
    // The output is a single-channel mask (foreground probability)
    // Shape: [1, 1, 1024, 1024] or similar
    const maskData = tensor.data;
    
    // Convert to ImageData with original dimensions
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(originalWidth, originalHeight);
    
    // Resize mask from 1024x1024 to original dimensions
    // Using bilinear interpolation approximation
    for (let y = 0; y < originalHeight; y++) {
        for (let x = 0; x < originalWidth; x++) {
            // Map to output coordinates
            const srcX = Math.floor((x / originalWidth) * outputWidth);
            const srcY = Math.floor((y / originalHeight) * outputHeight);
            const srcIdx = srcY * outputWidth + srcX;
            
            // Get alpha value (normalize if needed)
            let alpha = maskData[srcIdx];
            if (alpha > 1) alpha = alpha / 255; // Normalize if 0-255 range
            alpha = Math.max(0, Math.min(1, alpha));
            
            const dstIdx = (y * originalWidth + x) * 4;
            
            // Keep RGB from original, use mask for alpha
            imageData.data[dstIdx] = 255;      // R
            imageData.data[dstIdx + 1] = 255;  // G
            imageData.data[dstIdx + 2] = 255;  // B
            imageData.data[dstIdx + 3] = alpha * 255; // A
        }
    }
    
    return imageData;
}

/**
 * Create cutout from original image and mask
 */
function createCutout(img, maskImageData, session) {
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
    
    // Apply mask as alpha channel
    const originalData = ctx.getImageData(0, 0, originalWidth, originalHeight);
    
    for (let i = 0; i < maskImageData.data.length; i += 4) {
        originalData.data[i + 3] = maskImageData.data[i + 3];
    }
    
    ctx.putImageData(originalData, 0, 0);
    
    return canvas;
}

/**
 * Main function: remove background from image file
 * @param {File} file - Image file (JPG/PNG)
 * @returns {Promise<{blob: Blob, width: number, height: number, bounds: object}>}
 */
export async function removeBackground(file) {
    console.log('[RMBG] Processing:', file.name);
    console.log('[RMBG] Size:', file.size, 'bytes');
    
    try {
        // Initialize ONNX session
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
        
        console.log('[RMBG] Image dimensions:', originalWidth, 'x', originalHeight);
        
        // Preprocess for RMBG
        const inputTensor = preprocessImage(img, session);
        
        // Run inference
        const results = await runInference(inputTensor, session);
        
        // Extract mask
        const mask = extractMask(results, originalWidth, originalHeight);
        
        // Create cutout
        const cutoutCanvas = createCutout(img, mask, session);
        
        // Find subject bounds
        const bounds = findSubjectBounds(cutoutCanvas);
        console.log('[RMBG] Subject bounds:', bounds);
        
        // Create final cutout with bounds
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = bounds.width;
        finalCanvas.height = bounds.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.clearRect(0, 0, bounds.width, bounds.height);
        finalCtx.drawImage(
            cutoutCanvas,
            bounds.x, bounds.y, bounds.width, bounds.height,
            0, 0, bounds.width, bounds.height
        );
        
        // Convert to blob
        const blob = await new Promise(resolve => {
            finalCanvas.toBlob(resolve, 'image/png', 1.0);
        });
        
        console.log('[RMBG] Cutout created:', blob.size, 'bytes');
        
        return {
            blob,
            image: finalCanvas,
            width: bounds.width,
            height: bounds.height,
            bounds
        };
        
    } catch (err) {
        console.error('[RMBG] Background removal failed:', err);
        throw err;
    }
}

/**
 * Find subject bounds by scanning alpha channel
 */
function findSubjectBounds(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;
    
    let minX = w, minY = h, maxX = 0, maxY = 0;
    
    // Use threshold of 8 to preserve soft edges (hair, cloth)
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
    
    // Add padding (8% horizontal, 12% vertical)
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
 * Reset the session (useful for testing)
 */
export async function resetSession() {
    if (rmbgSession) {
        await rmbgSession.dispose();
        rmbgSession = null;
        console.log('[RMBG] Session reset');
    }
}