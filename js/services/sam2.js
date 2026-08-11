import {
    downscaleToWork,
    analyzeMask,
    maskToWorkAlpha,
    refineMask,
    findSubjectBounds,
    createCutout
} from './maskProcessor.js';

const ORT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.min.mjs';
const ORT_WEBGPU_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.webgpu.min.mjs';
const ORT_WASM_PATHS = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
const ENCODER_URL = './models/encoder.onnx';
const DECODER_URL = './models/decoder.onnx';

const INPUT_SIZE = 1024;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let ort = null;
let encoderSession = null;
let decoderSession = null;
let initPromise = null;

export function isSAMLoaded() {
    return !!(ort && encoderSession && decoderSession);
}

export function getSAMContext() {
    return {
        loaded: isSAMLoaded(),
        encoder: ENCODER_URL,
        decoder: DECODER_URL,
        ortVersion: ort && ort.env && ort.env.versions ? ort.env.versions.ort : null
    };
}

async function loadOrt() {
    const preferWebGpu = typeof navigator !== 'undefined' && !!navigator.gpu;
    const url = preferWebGpu ? ORT_WEBGPU_URL : ORT_URL;
    console.log('[SAM2] Loading onnxruntime-web:', url);
    const mod = await import(url);
    if (mod.env && mod.env.wasm) {
        mod.env.wasm.wasmPaths = ORT_WASM_PATHS;
        mod.env.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency || 4);
    }
    return mod;
}

export async function initSAM() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        ort = await loadOrt();

        const eps = ['wasm'];
        if (ort.env && ort.env.webgpu) eps.unshift('webgpu');

        console.log('[SAM2] Creating sessions with EP:', eps.join('+'));
        try {
            encoderSession = await ort.InferenceSession.create(ENCODER_URL, {
                executionProviders: eps,
                graphOptimizationLevel: 'all'
            });
            decoderSession = await ort.InferenceSession.create(DECODER_URL, {
                executionProviders: eps,
                graphOptimizationLevel: 'all'
            });
        } catch (err) {
            console.warn('[SAM2] WebGPU session failed, retrying with WASM only:', err);
            ort = await import(ORT_URL);
            if (ort.env && ort.env.wasm) {
                ort.env.wasm.wasmPaths = ORT_WASM_PATHS;
                ort.env.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency || 4);
            }
            encoderSession = await ort.InferenceSession.create(ENCODER_URL, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            decoderSession = await ort.InferenceSession.create(DECODER_URL, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
        }

        console.log('[SAM2] Ready. Encoder inputs:', encoderSession.inputNames, '| Decoder inputs:', decoderSession.inputNames);
    })();

    initPromise = initPromise.catch((err) => {
        initPromise = null;
        throw err;
    });

    return initPromise;
}

export function preprocessImage(workCanvas, workW, workH) {
    const fitScale = Math.min(INPUT_SIZE / workW, INPUT_SIZE / workH);
    const rw = Math.round(workW * fitScale);
    const rh = Math.round(workH * fitScale);
    const offsetX = Math.round((INPUT_SIZE - rw) / 2);
    const offsetY = Math.round((INPUT_SIZE - rh) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(124,116,104)';
    ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
    ctx.drawImage(workCanvas, offsetX, offsetY, rw, rh);

    const data = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
    const tensor = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
    const area = INPUT_SIZE * INPUT_SIZE;
    for (let i = 0; i < area; i++) {
        tensor[i] = (data[i * 4] / 255 - MEAN[0]) / STD[0];
        tensor[area + i] = (data[i * 4 + 1] / 255 - MEAN[1]) / STD[1];
        tensor[2 * area + i] = (data[i * 4 + 2] / 255 - MEAN[2]) / STD[2];
    }

    return { tensor, dims: [1, 3, INPUT_SIZE, INPUT_SIZE], fitScale, offsetX, offsetY };
}

export async function encodeWork(work) {
    const pre = preprocessImage(work.canvas, work.width, work.height);
    const input = new ort.Tensor('float32', pre.tensor, pre.dims);
    const inputName = encoderSession.inputNames[0] || 'image';
    const out = await encoderSession.run({ [inputName]: input });

    const values = encoderSession.outputNames.map((n) => out[n]);
    const embed = out.image_embed || out.image_embeddings || values[0];
    const hr0 = out.high_res_feats_0 || values[1];
    const hr1 = out.high_res_feats_1 || values[2];

    return { embed, hr0, hr1, fitScale: pre.fitScale, offsetX: pre.offsetX, offsetY: pre.offsetY, inputSize: INPUT_SIZE };
}

export async function decode(embeddings, coords, labels) {
    const n = coords.length / 2;
    const pointCoords = new ort.Tensor('float32', coords, [1, n, 2]);
    const pointLabels = new ort.Tensor('float32', labels, [1, n]);
    const maskInput = new ort.Tensor('float32', new Float32Array(256 * 256), [1, 1, 256, 256]);
    const hasMaskInput = new ort.Tensor('float32', new Float32Array([0]), [1]);

    const map = {
        image_embed: embeddings.embed,
        high_res_feats_0: embeddings.hr0,
        high_res_feats_1: embeddings.hr1,
        point_coords: pointCoords,
        point_labels: pointLabels,
        mask_input: maskInput,
        has_mask_input: hasMaskInput
    };

    const feeds = {};
    for (const name of decoderSession.inputNames) {
        if (name in map) feeds[name] = map[name];
    }

    return decoderSession.run(feeds);
}

export function buildPromptConfigs() {
    return [
        { coords: [512, 512], labels: [1] },
        { coords: [512, 512, 512, 256, 512, 768, 256, 512, 768, 512], labels: [1, 1, 1, 1, 1] },
        { coords: [0, 0, INPUT_SIZE, INPUT_SIZE], labels: [2, 3] },
        { coords: [256, 256, 768, 768], labels: [2, 3] }
    ];
}

function scoreCandidate(maskData, w, h, iou) {
    const geom = analyzeMask(maskData, w, h);
    const iouProb = 1 / (1 + Math.exp(-iou));
    return { score: iouProb * 0.6 + geom.score * 0.4, geom };
}

export async function segmentPerson(img) {
    console.log('[SAM2] Segmenting person...');
    await initSAM();

    const work = downscaleToWork(img, INPUT_SIZE);
    console.log('[SAM2] Work size:', work.width, 'x', work.height);

    const embeddings = await encodeWork(work);
    const configs = buildPromptConfigs();

    let best = null;

    for (let ci = 0; ci < configs.length; ci++) {
        const out = await decode(embeddings, configs[ci].coords, configs[ci].labels);
        const masksTensor = out.masks || Object.values(out)[0];
        const dims = masksTensor.dims;
        const numMasks = dims[1];
        const H = dims[2];
        const W = dims[3];
        const data = masksTensor.data;
        const ious = out.iou_predictions ? out.iou_predictions.data : new Float32Array(numMasks).fill(0.5);

        for (let s = 0; s < numMasks; s++) {
            const offset = s * H * W;
            const maskData = data.subarray(offset, offset + H * W);
            const cand = scoreCandidate(maskData, W, H, ious[s]);
            console.log(
                `[SAM2] config=${ci} slot=${s} iou=${ious[s].toFixed(3)} ` +
                `geom=${cand.geom.score.toFixed(3)} cov=${cand.geom.coverage.toFixed(3)}`
            );
            if (!best || cand.score > best.score) {
                best = { score: cand.score, config: ci, slot: s, maskData, H, W };
            }
        }
    }

    if (!best || best.score <= 0) {
        throw new Error('Could not find a person in this image. Try a clearer photo.');
    }

    const alpha = refineMask(
        maskToWorkAlpha(best.maskData, best.W, best.H, work.width, work.height, embeddings),
        work.width,
        work.height
    );

    const bounds = findSubjectBounds(alpha, work.width, work.height);
    const cutout = createCutout(work.canvas, alpha, bounds, work.width, work.height);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = work.width;
    maskCanvas.height = work.height;
    const mctx = maskCanvas.getContext('2d');
    const mimg = mctx.createImageData(work.width, work.height);
    for (let i = 0; i < alpha.length; i++) {
        const v = alpha[i] < 0 ? 0 : alpha[i] > 1 ? 1 : alpha[i];
        const j = i * 4;
        mimg.data[j] = Math.round(v * 255);
        mimg.data[j + 1] = Math.round(v * 255);
        mimg.data[j + 2] = Math.round(v * 255);
        mimg.data[j + 3] = 255;
    }
    mctx.putImageData(mimg, 0, 0);

    console.log('[SAM2] Selected config', best.config, 'slot', best.slot, 'score', best.score.toFixed(3));
    console.log('[SAM2] Bounds:', bounds);

    return {
        image: cutout,
        mask: maskCanvas,
        width: cutout.width,
        height: cutout.height,
        bounds,
        score: best.score
    };
}

export async function resetSession() {
    if (encoderSession) {
        try { await encoderSession.release(); } catch (e) { encoderSession = null; }
        encoderSession = null;
    }
    if (decoderSession) {
        try { await decoderSession.release(); } catch (e) { decoderSession = null; }
        decoderSession = null;
    }
    ort = null;
    initPromise = null;
    console.log('[SAM2] Session reset');
}

export const removeBackground = segmentPerson;
