/**
 * Pixel-based Background Removal Service
 * 
 * Uses browser-native Canvas pixel analysis to:
 * 1. Estimate background color
 * 2. Generate foreground mask via color distance
 * 3. Find connected components for person detection
 * 4. Create transparent cutout with auto-fit
 */

// Debug panel elements (will be created on demand)
let debugPanel = null;
let debugCanvases = [];

/**
 * Calculate color distance between two pixels
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

/**
 * Estimate background color from edges
 */
function estimateBackground(imgData, width, height) {
    const data = imgData.data;
    const samples = [];
    const sampleCount = 50;
    
    // Sample from edges (top, bottom, left, right, corners)
    for (let i = 0; i < sampleCount; i++) {
        const t = i / sampleCount;
        
        // Top edge
        if (t < 0.25) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * (height * 0.1));
            const idx = (y * width + x) * 4;
            samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
        }
        // Bottom edge
        else if (t < 0.5) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor((height - height * 0.1) + Math.random() * (height * 0.1));
            const idx = (y * width + x) * 4;
            samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
        }
        // Left edge
        else if (t < 0.75) {
            const x = Math.floor(Math.random() * (width * 0.1));
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
        }
        // Right edge
        else {
            const x = Math.floor((width - width * 0.1) + Math.random() * (width * 0.1));
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
        }
    }
    
    // Calculate average background color
    let sumR = 0, sumG = 0, sumB = 0;
    samples.forEach(s => {
        sumR += s.r;
        sumG += s.g;
        sumB += s.b;
    });
    
    const count = samples.length;
    return {
        r: sumR / count,
        g: sumG / count,
        b: sumB / count
    };
}

/**
 * Generate foreground probability map using color distance + edge awareness
 */
function generateForegroundMask(imgCtx, bg, width, height) {
    // Create a separate canvas to get RGBA data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(imgCtx.canvas, 0, 0, width, height);
    
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const maskData = new Float32Array(width * height);
    
    // Calculate distance threshold based on background variance
    const bgDist = Math.sqrt(3 * 255 * 255); // Max possible distance
    
    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        const dist = colorDistance(r, g, b, bg.r, bg.g, bg.b);
        
        // Normalize distance to 0-255 probability
        let prob = Math.min(255, (dist / bgDist) * 255 * 2);
        
        // Boost if this is a strong edge (RGB difference from neighbors)
        const edgeBoost = getEdgeGradientRGB(data, i % width, Math.floor(i / width), width, height);
        if (edgeBoost > 30) {
            prob = Math.min(255, prob + 50);
        }
        
        maskData[i] = prob;
    }
    
    return maskData;
}

/**
 * Calculate edge gradient for a pixel using RGB values
 */
function getEdgeGradientRGB(data, x, y, width, height) {
    const idx = (y * width + x) * 4;
    const centerR = data[idx];
    const centerG = data[idx + 1];
    const centerB = data[idx + 2];
    
    let gradients = [];
    
    // Check neighboring pixels
    if (x > 0) {
        const nIdx = (y * width + (x - 1)) * 4;
        gradients.push(Math.sqrt(
            Math.pow(centerR - data[nIdx], 2) +
            Math.pow(centerG - data[nIdx + 1], 2) +
            Math.pow(centerB - data[nIdx + 2], 2)
        ));
    }
    if (x < width - 1) {
        const nIdx = (y * width + (x + 1)) * 4;
        gradients.push(Math.sqrt(
            Math.pow(centerR - data[nIdx], 2) +
            Math.pow(centerG - data[nIdx + 1], 2) +
            Math.pow(centerB - data[nIdx + 2], 2)
        ));
    }
    if (y > 0) {
        const nIdx = ((y - 1) * width + x) * 4;
        gradients.push(Math.sqrt(
            Math.pow(centerR - data[nIdx], 2) +
            Math.pow(centerG - data[nIdx + 1], 2) +
            Math.pow(centerB - data[nIdx + 2], 2)
        ));
    }
    if (y < height - 1) {
        const nIdx = ((y + 1) * width + x) * 4;
        gradients.push(Math.sqrt(
            Math.pow(centerR - data[nIdx], 2) +
            Math.pow(centerG - data[nIdx + 1], 2) +
            Math.pow(centerB - data[nIdx + 2], 2)
        ));
    }
    
    if (gradients.length === 0) return 0;
    return gradients.reduce((a, b) => a + b, 0) / gradients.length;
}

/**
 * Find connected components using Union-Find
 */
function findConnectedComponents(maskData, width, height, threshold = 40) {
    const visited = new Array(width * height).fill(false);
    const components = [];
    const componentMasks = [];
    
    const getIndex = (x, y) => y * width + x;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = getIndex(x, y);
            
            if (visited[idx] || maskData[idx] < threshold) continue;
            
            // BFS to find connected region
            const component = [];
            const queue = [[x, y]];
            visited[idx] = true;
            
            while (queue.length > 0) {
                const [cx, cy] = queue.shift();
                const cidx = getIndex(cx, cy);
                component.push({ x: cx, y: cy, prob: maskData[cidx] });
                
                // Check 4 neighbors
                const neighbors = [
                    [cx - 1, cy], [cx + 1, cy],
                    [cx, cy - 1], [cx, cy + 1]
                ];
                
                for (const [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nidx = getIndex(nx, ny);
                        if (!visited[nidx] && maskData[nidx] >= threshold) {
                            visited[nidx] = true;
                            queue.push([nx, ny]);
                        }
                    }
                }
            }
            
            if (component.length > 50) { // Filter tiny noise
                components.push(component);
            }
        }
    }
    
    // Score components by finding the one near center
    const centerX = width / 2;
    const centerY = height / 2;
    
    let bestComponent = null;
    let bestScore = -1;
    
    components.forEach((component, i) => {
        // Calculate centroid
        let sumX = 0, sumY = 0;
        component.forEach(p => { sumX += p.x; sumY += p.y; });
        const cx = sumX / component.length;
        const cy = sumY / component.length;
        
        // Score by: size + proximity to center
        const distanceToCenter = Math.sqrt(
            Math.pow(cx - centerX, 2) + Math.pow(cy - centerY, 2)
        );
        const score = component.length * 1000 - distanceToCenter;
        
        if (score > bestScore) {
            bestScore = score;
            bestComponent = component;
        }
    });
    
    return bestComponent || components[0]; // Fallback to largest
}

/**
 * Apply morphological operations to clean mask
 */
function cleanMask(maskData, width, height, kernelSize = 3) {
    const result = new Float32Array(maskData.length);
    const halfK = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let count = 0;
            
            for (let dy = -halfK; dy <= halfK; dy++) {
                for (let dx = -halfK; dx <= halfK; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        sum += maskData[ny * width + nx];
                        count++;
                    }
                }
            }
            
            result[y * width + x] = sum / count;
        }
    }
    
    return result;
}

/**
 * Find subject bounds with padding
 */
function findSubjectBounds(maskData, width, height, paddingX = 0.08, paddingY = 0.12) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (maskData[idx] > 30) { // Threshold
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    const padX = Math.round((maxX - minX) * paddingX);
    const padY = Math.round((maxY - minY) * paddingY);
    
    return {
        x: Math.max(0, minX - padX),
        y: Math.max(0, minY - padY),
        width: Math.min(width - minX - padX, maxX - minX + padX),
        height: Math.min(height - minY - padY, maxY - minY + padY),
        originalMinX: minX,
        originalMinY: minY,
        originalMaxX: maxX,
        originalMaxY: maxY
    };
}

/**
 * Create transparent cutout from mask
 */
function createCutout(img, maskData, bounds, originalWidth, originalHeight) {
    const canvas = document.createElement('canvas');
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    const ctx = canvas.getContext('2d');
    
    // Draw original image onto transparent canvas
    const imageData = ctx.createImageData(bounds.width, bounds.height);
    const data = imageData.data;
    
    for (let y = 0; y < bounds.height; y++) {
        for (let x = 0; x < bounds.width; x++) {
            // Map to original coordinates
            const srcX = bounds.x + x;
            const srcY = bounds.y + y;
            
            if (srcX >= 0 && srcX < originalWidth && srcY >= 0 && srcY < originalHeight) {
                // Get original pixel color
                const srcIdx = (srcY * originalWidth + srcX) * 4;
                const outIdx = (y * bounds.width + x) * 4;
                
                data[outIdx] = img.src ? 0 : 0; // Will be handled differently
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Main function: Remove background using pixel analysis
 * @param {HTMLImageElement} img - Loaded image element
 * @returns {Promise<{blob: Blob, width: number, height: number, bounds: object}>}
 */
export async function removeBackground(img) {
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    
    console.log('[PIXEL-CUTOUT] Processing:', img.src, originalWidth, 'x', originalHeight);
    
    // Create canvas for analysis (scale down for performance)
    const scale = Math.min(1, 1200 / Math.max(originalWidth, originalHeight));
    const workWidth = Math.round(originalWidth * scale);
    const workHeight = Math.round(originalHeight * scale);
    
    const canvas = document.createElement('canvas');
    canvas.width = workWidth;
    canvas.height = workHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, workWidth, workHeight);
    
    // Get image data
    const imgData = ctx.getImageData(0, 0, workWidth, workHeight);
    
    // Step 1: Estimate background
    const bg = estimateBackground(imgData, workWidth, workHeight);
    console.log('[PIXEL-CUTOUT] Background estimate:', bg);
    
    // Step 2: Generate foreground mask
    let maskData = generateForegroundMask(ctx, bg, workWidth, workHeight);
    
    // Step 3: Find connected components
    const personComponent = findConnectedComponents(maskData, workWidth, workHeight);
    
    if (!personComponent) {
        throw new Error('Could not find person in image');
    }
    
    console.log('[PIXEL-CUTOUT] Found component with', personComponent.length, 'pixels');
    
    // Step 4: Create binary mask from component
    const binaryMask = new Float32Array(workWidth * workHeight);
    personComponent.forEach(p => {
        binaryMask[p.y * workWidth + p.x] = 255;
    });
    
    // Step 5: Clean mask
    const cleanedMask = cleanMask(binaryMask, workWidth, workHeight);
    
    // Step 6: Find bounds
    const bounds = findSubjectBounds(cleanedMask, workWidth, workHeight);
    console.log('[PIXEL-CUTOUT] Detected bounds:', bounds);
    
    // Step 7: Scale bounds back to original size
    const scaleX = originalWidth / workWidth;
    const scaleY = originalHeight / workHeight;
    
    const finalBounds = {
        x: Math.round(bounds.x * scaleX),
        y: Math.round(bounds.y * scaleY),
        width: Math.round(bounds.width * scaleX),
        height: Math.round(bounds.height * scaleY)
    };
    
    // Step 8: Create final transparent cutout
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalBounds.width;
    finalCanvas.height = finalBounds.height;
    const finalCtx = finalCanvas.getContext('2d');
    
    // Clear with transparency
    finalCtx.clearRect(0, 0, finalBounds.width, finalBounds.height);
    
    // Draw the cropped person
    finalCtx.drawImage(
        img,
        finalBounds.x, finalBounds.y, finalBounds.width, finalBounds.height,
        0, 0, finalBounds.width, finalBounds.height
    );
    
    // Create alpha channel from mask
    const imageData = finalCtx.getImageData(0, 0, finalBounds.width, finalBounds.height);
    const data = imageData.data;
    
    for (let y = 0; y < finalBounds.height; y++) {
        for (let x = 0; x < finalBounds.width; x++) {
            const origX = Math.floor(x / scaleX);
            const origY = Math.floor(y / scaleY);
            
            if (origX >= 0 && origX < workWidth && origY >= 0 && origY < workHeight) {
                const maskVal = cleanedMask[origY * workWidth + origX];
                const idx = (y * finalBounds.width + x) * 4;
                data[idx + 3] = maskVal; // Set alpha from mask
            } else {
                const idx = (y * finalBounds.width + x) * 4;
                data[idx + 3] = 0; // Transparent
            }
        }
    }
    
    finalCtx.putImageData(imageData, 0, 0);
    
    return {
        blob: await new Promise(resolve => finalCanvas.toBlob(resolve, 'image/png')),
        image: finalCanvas,
        width: finalBounds.width,
        height: finalBounds.height,
        bounds: finalBounds
    };
}

/**
 * Reset state (for testing)
 */
export function resetSession() {
    // Nothing to reset for pixel-based approach
}