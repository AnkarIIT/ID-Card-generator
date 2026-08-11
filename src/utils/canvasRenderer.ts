import { CardConfig, PhotoTransform } from '../types';
import QRCode from 'qrcode';
import { extractXHandle, formatQrUrl } from './urlUtils';
import frontImageUrl from '../images/front.png';
import backImageUrl from '../images/back.jpeg';

// Cache for generated QR Code images and template backgrounds
const qrCache = new Map<string, HTMLImageElement>();
let frontImageCached: HTMLImageElement | null = null;
let backImageCached: HTMLImageElement | null = null;

export async function getFrontTemplateImage(): Promise<HTMLImageElement | null> {
  if (frontImageCached) return frontImageCached;
  try {
    const img = new Image();
    img.src = frontImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    frontImageCached = img;
    return img;
  } catch (err) {
    console.error('Failed to load front template image:', err);
    return null;
  }
}

export async function getBackTemplateImage(): Promise<HTMLImageElement | null> {
  if (backImageCached) return backImageCached;
  try {
    const img = new Image();
    img.src = backImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    backImageCached = img;
    return img;
  } catch (err) {
    console.error('Failed to load back template image:', err);
    return null;
  }
}

export async function getQrCodeImage(url: string, handleFallback?: string): Promise<HTMLImageElement | null> {
  const targetUrl = formatQrUrl(url, handleFallback);
  if (qrCache.has(targetUrl)) return qrCache.get(targetUrl)!;

  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 360,
      color: {
        dark: '#1e1b18',
        light: '#fbf3dc',
      },
    });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    qrCache.set(targetUrl, img);
    return img;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return null;
  }
}

// ==================================================
// CENTRALIZED CARD LAYOUT SOURCE OF TRUTH (1024 × 1536)
// Derived directly from front.png template geometry
// ==================================================
export const CARD_LAYOUT = {
  canvas: {
    width: 1024,
    height: 1536,
  },

  portrait: {
    x: 513,
    y: 183,
    width: 402,
    height: 667,
    textSafeArea: { x: 513, y: 183, width: 402, height: 667 },
    shape: 'inner-pink-arch',
    path: (ctx: CanvasRenderingContext2D) => {
      const x = 513;
      const y = 183;
      const w = 402;
      const h = 667;

      ctx.beginPath();
      // Top arch curve
      ctx.moveTo(x, y + 110);
      ctx.bezierCurveTo(x + 10, y + 25, x + w / 2 - 45, y, x + w / 2, y);
      ctx.bezierCurveTo(x + w / 2 + 45, y, x + w - 10, y + 25, x + w, y + 110);
      // Right edge down
      ctx.lineTo(x + w, y + h - 25);
      ctx.bezierCurveTo(x + w, y + h - 8, x + w / 2 + 50, y + h, x + w / 2, y + h);
      ctx.bezierCurveTo(x + w / 2 - 50, y + h, x, y + h - 8, x, y + h - 25);
      // Left edge back up
      ctx.lineTo(x, y + 110);
      ctx.closePath();
    },
  },

  fields: {
    name: {
      section: { x: 28, y: 468, width: 463, height: 284 },
      textSafeArea: { x: 55, y: 515, width: 405, height: 190 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    role: {
      section: { x: 28, y: 753, width: 463, height: 94 },
      textSafeArea: { x: 125, y: 785, width: 330, height: 45 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    builderTitle: {
      section: { x: 28, y: 858, width: 463, height: 201 },
      textSafeArea: { x: 55, y: 925, width: 400, height: 105 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    building: {
      section: { x: 28, y: 1060, width: 463, height: 173 },
      textSafeArea: { x: 55, y: 1120, width: 390, height: 85 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    sideQuest: {
      section: { x: 28, y: 1235, width: 463, height: 157 },
      textSafeArea: { x: 55, y: 1280, width: 390, height: 85 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    id: {
      section: { x: 552, y: 875, width: 320, height: 38 },
      textSafeArea: { x: 565, y: 879, width: 295, height: 30 },
      align: 'center' as const,
      verticalAlign: 'middle' as const,
    },
    chaos: {
      section: { x: 493, y: 927, width: 499, height: 120 },
      textSafeArea: { x: 525, y: 980, width: 400, height: 45 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    poweredBy: {
      section: { x: 493, y: 1050, width: 499, height: 106 },
      textSafeArea: { x: 525, y: 1100, width: 400, height: 42 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    mostUsedKey: {
      section: { x: 493, y: 1158, width: 290, height: 127 },
      textSafeArea: { x: 525, y: 1210, width: 160, height: 45 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
    favoriteError: {
      section: { x: 493, y: 1287, width: 290, height: 131 },
      textSafeArea: { x: 550, y: 1330, width: 100, height: 55 },
      align: 'left' as const,
      verticalAlign: 'middle' as const,
    },
  },
};

/**
 * Cover fitting algorithm for complete original photo inside ornate portrait region
 */
export function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  portrait = CARD_LAYOUT.portrait,
  transform?: PhotoTransform
) {
  const imgW = img.naturalWidth || img.width || 1;
  const imgH = img.naturalHeight || img.height || 1;

  // Cover scale factor
  const baseScale = Math.max(portrait.width / imgW, portrait.height / imgH);
  const extraScale = transform?.scale ? Math.max(0.2, transform.scale) : 1;
  const finalScale = baseScale * extraScale;

  const drawW = imgW * finalScale;
  const drawH = imgH * finalScale;

  const offsetX = transform?.x || 0;
  const offsetY = transform?.y || 0;

  const drawX = portrait.x + (portrait.width - drawW) / 2 + offsetX;
  const drawY = portrait.y + (portrait.height - drawH) / 2 + offsetY;

  ctx.save();

  if (transform?.filter && transform.filter !== 'none') {
    applyPhotoFilter(ctx, transform.filter);
  }

  if (transform?.rotation) {
    const centerX = drawX + drawW / 2;
    const centerY = drawY + drawH / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  ctx.restore();
}

function applyPhotoFilter(ctx: CanvasRenderingContext2D, filter: string) {
  switch (filter) {
    case 'sunkissed':
      ctx.filter = 'contrast(1.1) saturate(1.3) sepia(0.2)';
      break;
    case 'cyberpunk':
      ctx.filter = 'contrast(1.25) saturate(1.5) hue-rotate(-20deg)';
      break;
    case 'cinematic':
      ctx.filter = 'contrast(1.3) brightness(0.95) saturate(1.1)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(1) contrast(1.2)';
      break;
    case 'vivid':
      ctx.filter = 'saturate(1.6) contrast(1.15)';
      break;
    default:
      ctx.filter = 'none';
  }
}

// ==================================================
// GENERIC TEXT RENDERING SYSTEM IN TEXT SAFE AREA
// ==================================================
export interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextOptions {
  maxFontSize?: number;
  minFontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  maxLines?: number;
  lineHeightMultiplier?: number;
  transform?: 'uppercase' | 'none';
}

export function drawTextInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: TextBox,
  options: TextOptions = {}
) {
  if (!text || !text.trim()) return;

  const {
    maxFontSize = 36,
    minFontSize = 10,
    fontWeight = '800',
    fontFamily = 'sans-serif',
    color = '#fef3c7',
    textAlign = 'left',
    verticalAlign = 'middle',
    maxLines = 4,
    lineHeightMultiplier = 1.15,
    transform = 'none',
  } = options;

  const processedText = transform === 'uppercase' ? text.toUpperCase().trim() : text.trim();

  ctx.save();
  ctx.fillStyle = color;

  let optimalFontSize = maxFontSize;
  let wrappedLines: string[] = [];
  let lineHeight = optimalFontSize * lineHeightMultiplier;

  // Helper to split text into wrapped lines for a given font size
  const wrapTextForFontSize = (fontSize: number) => {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const words = processedText.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > box.width && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Iteratively decrease font size until text fits inside box width & height
  for (let sz = maxFontSize; sz >= minFontSize; sz -= 1) {
    const lines = wrapTextForFontSize(sz);
    ctx.font = `${fontWeight} ${sz}px ${fontFamily}`;
    const totalHeight = lines.length * (sz * lineHeightMultiplier);

    const hasOverflowLine = lines.some((l) => ctx.measureText(l).width > box.width);

    if (lines.length <= maxLines && totalHeight <= box.height && !hasOverflowLine) {
      optimalFontSize = sz;
      wrappedLines = lines;
      lineHeight = sz * lineHeightMultiplier;
      break;
    }

    if (sz === minFontSize) {
      optimalFontSize = minFontSize;
      wrappedLines = lines.slice(0, maxLines);
      lineHeight = minFontSize * lineHeightMultiplier;
    }
  }

  if (wrappedLines.length === 0) {
    ctx.restore();
    return;
  }

  ctx.font = `${fontWeight} ${optimalFontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  const totalTextHeight = wrappedLines.length * lineHeight;

  // Calculate start Y for vertical alignment
  let startY = box.y;
  if (verticalAlign === 'middle') {
    startY = box.y + (box.height - totalTextHeight) / 2;
  } else if (verticalAlign === 'bottom') {
    startY = box.y + box.height - totalTextHeight;
  }

  // Draw lines
  wrappedLines.forEach((line, index) => {
    const lineY = startY + index * lineHeight;
    const lineWidth = ctx.measureText(line).width;

    let lineX = box.x;
    if (textAlign === 'center') {
      lineX = box.x + (box.width - lineWidth) / 2;
    } else if (textAlign === 'right') {
      lineX = box.x + box.width - lineWidth;
    }

    ctx.fillText(line, lineX, lineY);
  });

  ctx.restore();
}

/**
 * Custom Chaos Level UI Progress Bar Renderer
 */
function drawChaosLevelUI(
  ctx: CanvasRenderingContext2D,
  box: TextBox,
  chaosValue: number,
  palette: ReturnType<typeof getThemePalette>
) {
  const level = Math.min(100, Math.max(0, chaosValue ?? 65));

  ctx.save();
  const totalBlocks = 10;
  const filledBlocks = Math.round((level / 100) * totalBlocks);

  const labelText = `${level}%`;
  ctx.font = '900 24px monospace';
  const labelWidth = ctx.measureText(labelText).width + 16;

  const blockAreaWidth = box.width - labelWidth;
  const blockW = Math.max(8, Math.floor((blockAreaWidth - (totalBlocks - 1) * 6) / totalBlocks));
  const blockH = 26;
  const startX = box.x;
  const startY = box.y + (box.height - blockH) / 2;

  // Draw Progress Blocks
  for (let i = 0; i < totalBlocks; i++) {
    const bx = startX + i * (blockW + 6);
    if (i < filledBlocks) {
      ctx.fillStyle = palette.redAccent;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    }
    drawRoundedRect(ctx, bx, startY, blockW, blockH, 4);
    ctx.fill();
  }

  // Draw Percentage Label
  ctx.fillStyle = palette.yellowText;
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, box.x + box.width, startY + blockH / 2);

  ctx.restore();
}

/**
 * DEBUG OVERLAY MODE (Mandatory feature)
 */
export function renderDebugLayoutBoxes(ctx: CanvasRenderingContext2D) {
  if (typeof window === 'undefined' || !(window as any).__LAYOUT_DEBUG__) return;

  ctx.save();
  ctx.font = 'bold 12px monospace';
  ctx.textBaseline = 'top';

  // Portrait box
  const p = CARD_LAYOUT.portrait;
  ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
  ctx.fillRect(p.x, p.y, p.width, p.height);
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x, p.y, p.width, p.height);
  ctx.fillStyle = '#ff00ff';
  ctx.fillText(`PORTRAIT: x:${p.x} y:${p.y} w:${p.width} h:${p.height}`, p.x + 4, p.y + 4);

  // Field boxes & Text Safe Areas
  Object.entries(CARD_LAYOUT.fields).forEach(([fieldName, field]) => {
    const sec = field.section;
    const safe = field.textSafeArea;

    // Outer Section Box (Yellow border)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(sec.x, sec.y, sec.width, sec.height);

    // Text Safe Area Box (Translucent Cyan Fill + Cyan Border)
    ctx.fillStyle = 'rgba(0, 255, 204, 0.18)';
    ctx.fillRect(safe.x, safe.y, safe.width, safe.height);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(safe.x, safe.y, safe.width, safe.height);

    // Label Above
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`${fieldName.toUpperCase()}`, safe.x + 4, safe.y + 2);
    ctx.fillText(`x:${safe.x} y:${safe.y} w:${safe.width} h:${safe.height}`, safe.x + 4, safe.y + 16);
  });

  ctx.restore();
}

// Global debug toggle function (Mandatory Requirement)
if (typeof window !== 'undefined') {
  const toggleFn = () => {
    (window as any).__LAYOUT_DEBUG__ = !(window as any).__LAYOUT_DEBUG__;
    console.log(`[LAYOUT DEBUG MODE]: ${(window as any).__LAYOUT_DEBUG__ ? 'ENABLED' : 'DISABLED'}`);
    return (window as any).__LAYOUT_DEBUG__;
  };

  (window as any).toggleLayoutDebug = toggleFn;
  (window as any).toggleTextLayoutDebug = toggleFn;
}

/**
 * Main render function for canvas export or live preview
 */
export async function renderGraphicOnCanvas(
  canvas: HTMLCanvasElement,
  config: CardConfig,
  userImage: HTMLImageElement | null,
  qrImage?: HTMLImageElement | null,
  isExport: boolean = false
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const frontTemplate = await getFrontTemplateImage();
  const backTemplate = await getBackTemplateImage();

  let qrImg = qrImage || null;
  if (!qrImg && config.format === 'badge' && (config.side === 'back' || config.side === 'both')) {
    qrImg = await getQrCodeImage(config.builder.qrUrl || '', config.builder.handle || '');
  }

  if (config.format === 'frame') {
    canvas.width = 1024;
    canvas.height = 1024;
    ctx.clearRect(0, 0, 1024, 1024);
    renderPfpFrame(ctx, 1024, 1024, config, userImage);
  } else {
    // Badge Mode - Resolution 1024 × 1536
    if (config.side === 'both') {
      canvas.width = 2128; // 1024 + 80 gap + 1024
      canvas.height = 1536;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGrad = ctx.createRadialGradient(1064, 768, 100, 1064, 768, 1400);
      bgGrad.addColorStop(0, '#101712');
      bgGrad.addColorStop(1, '#050806');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Front Card on Left
      ctx.save();
      ctx.translate(32, 0);
      renderFrontBadge(ctx, 1024, 1536, config, userImage, frontTemplate, isExport);
      ctx.restore();

      // Draw Back Card on Right
      ctx.save();
      ctx.translate(1072, 0);
      renderBackBadge(ctx, 1024, 1536, config, qrImg, backTemplate);
      ctx.restore();
    } else if (config.side === 'back') {
      canvas.width = 1024;
      canvas.height = 1536;
      ctx.clearRect(0, 0, 1024, 1536);
      renderBackBadge(ctx, 1024, 1536, config, qrImg, backTemplate);
    } else {
      // Front side
      canvas.width = 1024;
      canvas.height = 1536;
      ctx.clearRect(0, 0, 1024, 1536);
      renderFrontBadge(ctx, 1024, 1536, config, userImage, frontTemplate, isExport);
    }
  }
}

// Export renderCard alias for uniform invocation
export const renderCard = renderGraphicOnCanvas;

// Color Schemes for Badge Themes
function getThemePalette(themeStyle: string) {
  switch (themeStyle) {
    case 'goa_vintage':
    default:
      return {
        bgOuter: '#0c2217',
        bgInner: '#0e2b1d',
        cardBg: '#091c13',
        goldAccent: '#eab308',
        yellowText: '#facc15',
        redAccent: '#e11d48',
        creamText: '#fef3c7',
        cyanAccent: '#22d3ee',
        borderYellow: '#f59e0b',
        boxBg: '#123323',
        boxBorder: '#1c4d36',
        stampBg: '#be123c',
      };
    case 'goa_sunset':
      return {
        bgOuter: '#180a29',
        bgInner: '#291040',
        cardBg: '#120720',
        goldAccent: '#f97316',
        yellowText: '#fbbf24',
        redAccent: '#f43f5e',
        creamText: '#fff1f2',
        cyanAccent: '#38bdf8',
        borderYellow: '#f97316',
        boxBg: '#351652',
        boxBorder: '#52227d',
        stampBg: '#e11d48',
      };
    case 'cyber_ocean':
      return {
        bgOuter: '#040d1a',
        bgInner: '#0b2545',
        cardBg: '#06152a',
        goldAccent: '#38bdf8',
        yellowText: '#7dd3fc',
        redAccent: '#f43f5e',
        creamText: '#f0f9ff',
        cyanAccent: '#22d3ee',
        borderYellow: '#0284c7',
        boxBg: '#0f3866',
        boxBorder: '#1e528e',
        stampBg: '#0284c7',
      };
    case 'obsidian_gold':
      return {
        bgOuter: '#0a0a0a',
        bgInner: '#181510',
        cardBg: '#0e0c09',
        goldAccent: '#eab308',
        yellowText: '#fef08a',
        redAccent: '#dc2626',
        creamText: '#fafafa',
        cyanAccent: '#fef08a',
        borderYellow: '#ca8a04',
        boxBg: '#262018',
        boxBorder: '#3d3427',
        stampBg: '#991b1b',
      };
    case 'minimal_white':
      return {
        bgOuter: '#f1f5f9',
        bgInner: '#ffffff',
        cardBg: '#f8fafc',
        goldAccent: '#0284c7',
        yellowText: '#0369a1',
        redAccent: '#e11d48',
        creamText: '#0f172a',
        cyanAccent: '#0284c7',
        borderYellow: '#0284c7',
        boxBg: '#e2e8f0',
        boxBorder: '#cbd5e1',
        stampBg: '#e11d48',
      };
  }
}

/**
 * Format A: PFP Frame Renderer
 */
function renderPfpFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: CardConfig,
  userImage: HTMLImageElement | null
) {
  const palette = getThemePalette(config.themeStyle);
  const isLight = config.themeStyle === 'minimal_white';

  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, palette.bgInner);
  bgGrad.addColorStop(1, palette.bgOuter);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  drawBackgroundAccents(ctx, w, h, config.themeStyle);

  const centerX = w / 2;
  const centerY = h / 2;
  const radius = 410;

  ctx.save();
  ctx.beginPath();
  if (config.frameStyle === 'cyber_brackets' || config.frameStyle === 'minimal_hex') {
    drawRoundedOctagon(ctx, centerX, centerY, radius);
  } else {
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  }
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, centerX, centerY, radius * 2, radius * 2, config.photoTransform);
  } else {
    ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upload Your Photo', centerX, centerY);
  }
  ctx.restore();

  drawFrameBorderOverlay(ctx, centerX, centerY, radius, config);
}

/**
 * Format B - FRONT SIDE: High Fidelity Vintage Goa Poster ID Badge
 */
function renderFrontBadge(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: CardConfig,
  userImage: HTMLImageElement | null,
  templateImage?: HTMLImageElement | null,
  isExport: boolean = false
) {
  const p = getThemePalette(config.themeStyle);
  const b = config.builder;
  const f = CARD_LAYOUT.fields;

  // STEP 1: Draw front.png template background at 1024×1536
  if (templateImage) {
    ctx.drawImage(templateImage, 0, 0, w, h);
  } else {
    ctx.fillStyle = p.bgOuter;
    ctx.fillRect(0, 0, w, h);
    drawVintageBorderFrame(ctx, 0, 0, w, h, p);
  }

  // STEP 2 & 3: Clip to INNER portrait/photo region & draw FULL ORIGINAL PHOTO with cover fitting
  ctx.save();
  CARD_LAYOUT.portrait.path(ctx);
  ctx.clip();

  if (userImage) {
    drawCoverPhoto(ctx, userImage, CARD_LAYOUT.portrait, config.photoTransform);
  } else if (!templateImage) {
    ctx.fillStyle = p.boxBg;
    ctx.fillRect(CARD_LAYOUT.portrait.x, CARD_LAYOUT.portrait.y, CARD_LAYOUT.portrait.width, CARD_LAYOUT.portrait.height);
    ctx.fillStyle = p.creamText;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOUR PHOTO HERE', CARD_LAYOUT.portrait.x + CARD_LAYOUT.portrait.width / 2, CARD_LAYOUT.portrait.y + CARD_LAYOUT.portrait.height / 2);
  }
  ctx.restore();

  // STEP 5: Draw dynamic text inside textSafeAreas

  // 1. NAME
  drawTextInBox(ctx, b.name || 'BAUNA KUMAR', f.name.textSafeArea, {
    maxFontSize: 64,
    minFontSize: 18,
    fontWeight: '900',
    maxLines: 2,
    verticalAlign: f.name.verticalAlign,
    textAlign: f.name.align,
    transform: 'uppercase',
    color: p.creamText,
  });

  // 2. ROLE
  drawTextInBox(ctx, b.role || 'MEMBER', f.role.textSafeArea, {
    maxFontSize: 30,
    minFontSize: 12,
    fontWeight: '900',
    maxLines: 2,
    verticalAlign: f.role.verticalAlign,
    textAlign: f.role.align,
    transform: 'uppercase',
    color: p.yellowText,
  });

  // 3. BUILDER TITLE
  drawTextInBox(ctx, b.builderTitle || 'CREATIVE DEVELOPER', f.builderTitle.textSafeArea, {
    maxFontSize: 30,
    minFontSize: 12,
    fontWeight: '900',
    maxLines: 3,
    verticalAlign: f.builderTitle.verticalAlign,
    textAlign: f.builderTitle.align,
    color: p.yellowText,
  });

  // 4. CURRENTLY BUILDING
  drawTextInBox(ctx, b.currentlyBuilding || 'Awesome Next.js App', f.building.textSafeArea, {
    maxFontSize: 26,
    minFontSize: 11,
    fontWeight: '800',
    maxLines: 3,
    verticalAlign: f.building.verticalAlign,
    textAlign: f.building.align,
    color: p.creamText,
  });

  // 5. SIDE QUEST
  drawTextInBox(ctx, b.sideQuest || 'STARTUPS • TRAVEL • ANIME • FOOD', f.sideQuest.textSafeArea, {
    maxFontSize: 26,
    minFontSize: 11,
    fontWeight: '800',
    maxLines: 3,
    verticalAlign: f.sideQuest.verticalAlign,
    textAlign: f.sideQuest.align,
    color: p.creamText,
  });

  // 6. HHG26-ID STRIP (Pre-printed in template background)

  // 7. CHAOS LEVEL
  drawChaosLevelUI(ctx, f.chaos.textSafeArea, b.chaosLevel ?? 65, p);

  // 8. POWERED BY
  drawTextInBox(ctx, b.poweredBy || 'Chai + Jugaad + Decisions', f.poweredBy.textSafeArea, {
    maxFontSize: 26,
    minFontSize: 11,
    fontWeight: '800',
    maxLines: 2,
    verticalAlign: f.poweredBy.verticalAlign,
    textAlign: f.poweredBy.align,
    color: p.creamText,
  });

  // 9. MOST USED KEY
  if (b.mostUsedKey && b.mostUsedKey.trim()) {
    drawTextInBox(ctx, b.mostUsedKey, f.mostUsedKey.textSafeArea, {
      maxFontSize: 24,
      minFontSize: 11,
      fontWeight: '900',
      maxLines: 2,
      verticalAlign: f.mostUsedKey.verticalAlign,
      textAlign: f.mostUsedKey.align,
      color: p.yellowText,
    });
  }

  // 10. FAVOURITE ERROR
  if (b.favouriteError && b.favouriteError.trim()) {
    drawTextInBox(ctx, b.favouriteError, f.favoriteError.textSafeArea, {
      maxFontSize: 32,
      minFontSize: 12,
      fontWeight: '900',
      maxLines: 2,
      verticalAlign: f.favoriteError.verticalAlign,
      textAlign: f.favoriteError.align,
      color: p.redAccent,
    });
  }

  // STEP 6: Debug layout overlay
  if (!isExport) {
    renderDebugLayoutBoxes(ctx);
  }
}

/**
 * Format B - BACK SIDE: Vintage Goa Hacker House QR & Connect Pass
 */
function renderBackBadge(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: CardConfig,
  qrImage: HTMLImageElement | null,
  templateImage?: HTMLImageElement | null
) {
  const p = getThemePalette(config.themeStyle);
  const b = config.builder;

  if (templateImage) {
    ctx.drawImage(templateImage, 0, 0, w, h);
  } else {
    ctx.fillStyle = p.bgOuter;
    ctx.fillRect(0, 0, w, h);
    drawVintageBorderFrame(ctx, 0, 0, w, h, p);

    // Header & Headline (only for fallback when template image is not present)
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = '800 24px sans-serif';
    ctx.fillStyle = p.yellowText;
    ctx.fillText('HACKER HOUSE', w / 2, 60);

    ctx.font = '900 72px sans-serif';
    ctx.fillStyle = p.yellowText;
    ctx.fillText('GOA, INDIA', w / 2, 130);

    ctx.font = '800 24px sans-serif';
    ctx.fillStyle = p.creamText;
    ctx.fillText('28  -  31 OCT 2026', w / 2, 170);

    const headlineStr = b.backHeadline || 'चलो बनाते हैं बवाल वाले आईडियाज़';
    if (headlineStr && headlineStr.trim()) {
      ctx.font = '900 36px sans-serif';
      ctx.fillStyle = p.yellowText;
      ctx.fillText(`✨ ${headlineStr.trim()} ✨`, w / 2, 240);
    }
    ctx.restore();
  }

  // Draw QR Code to perfectly fill the template's red-dotted box region
  const cardX = 102;
  const cardY = 178;
  const cardW = 820;
  const cardH = 726;

  ctx.save();
  // Clean white card background covering the 'YOUR QR CODE HERE' template text
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 12;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fill();

  const qrSize = 630;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = cardY + (cardH - qrSize) / 2;

  if (qrImage) {
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  } else {
    ctx.fillStyle = '#1e1b18';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOUR QR CODE HERE', cardX + cardW / 2, cardY + cardH / 2);
  }
  ctx.restore();
}

function drawVintageBorderFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  p: ReturnType<typeof getThemePalette>
) {
  ctx.save();
  ctx.strokeStyle = p.goldAccent;
  ctx.lineWidth = 8;
  ctx.strokeRect(x + 16, y + 16, w - 32, h - 32);

  ctx.strokeStyle = p.redAccent;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 28, y + 28, w - 56, h - 56);
  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
}

function drawTransformedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  targetW: number,
  targetH: number,
  transform: CardConfig['photoTransform']
) {
  ctx.save();
  if (transform.filter && transform.filter !== 'none') {
    applyPhotoFilter(ctx, transform.filter);
  }

  ctx.translate(cx + transform.x, cy + transform.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);

  const imgAspect = img.width / img.height;
  const targetAspect = targetW / targetH;

  let renderW = targetW;
  let renderH = targetH;

  if (imgAspect > targetAspect) {
    renderW = targetH * imgAspect;
  } else {
    renderH = targetW / imgAspect;
  }

  ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
  ctx.restore();
}

function drawFrameBorderOverlay(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  config: CardConfig
) {
  const { frameStyle, themeStyle, builder } = config;
  const isLight = themeStyle === 'minimal_white';
  const accentColor = isLight ? '#0284c7' : '#00f2fe';

  ctx.save();
  if (frameStyle === 'classic_ring') {
    const ringGrad = ctx.createConicGradient(0, cx, cy);
    ringGrad.addColorStop(0, '#00f2fe');
    ringGrad.addColorStop(0.33, '#4facfe');
    ringGrad.addColorStop(0.66, '#f43f5e');
    ringGrad.addColorStop(1, '#00f2fe');

    ctx.lineWidth = 28;
    ctx.strokeStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.stroke();

    drawCurvedText(ctx, '🌴 HH GOA 2026 🌴', cx, cy, r + 18, Math.PI * 1.5, true, '#ffffff', '900 32px sans-serif');
    drawCurvedText(ctx, 'BUILDING IN GOA • OCT 2026', cx, cy, r + 18, Math.PI * 0.5, false, '#ffffff', '800 26px sans-serif');
    drawStatusPillBadge(ctx, cx, cy + r - 10, builder.statusTag || 'VERIFIED BUILDER', accentColor);
  } else {
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
    ctx.stroke();

    drawStatusPillBadge(ctx, cx, cy + r - 10, builder.statusTag || 'VERIFIED BUILDER', '#eab308');
  }
  ctx.restore();
}

function drawStatusPillBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string, bgColor: string) {
  ctx.save();
  ctx.font = '900 20px sans-serif';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const pillW = Math.max(240, textWidth + 50);
  const pillH = 48;

  ctx.fillStyle = bgColor;
  drawRoundedRect(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), cx, cy);

  ctx.restore();
}

function drawCurvedText(ctx: CanvasRenderingContext2D, str: string, cx: number, cy: number, radius: number, angle: number, above: boolean, color: string, font: string) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = above ? 'bottom' : 'top';

  const numChars = str.length;
  const charAngle = 0.045;
  const totalAngle = numChars * charAngle;
  const startAngle = angle - totalAngle / 2;

  for (let i = 0; i < numChars; i++) {
    const char = str[i];
    const currAngle = startAngle + i * charAngle;

    ctx.save();
    ctx.translate(cx + radius * Math.cos(currAngle), cy + radius * Math.sin(currAngle));
    ctx.rotate(currAngle + (above ? Math.PI / 2 : -Math.PI / 2));
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawBackgroundAccents(ctx: CanvasRenderingContext2D, w: number, h: number, theme: CardConfig['themeStyle']) {
  ctx.save();
  if (theme === 'cyber_ocean') {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawRoundedOctagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const cut = r * 0.25;
  ctx.beginPath();
  ctx.moveTo(cx - r + cut, cy - r);
  ctx.lineTo(cx + r - cut, cy - r);
  ctx.lineTo(cx + r, cy - r + cut);
  ctx.lineTo(cx + r, cy + r - cut);
  ctx.lineTo(cx + r - cut, cy + r);
  ctx.lineTo(cx - r + cut, cy + r);
  ctx.lineTo(cx - r, cy + r - cut);
  ctx.lineTo(cx - r, cy - r + cut);
  ctx.closePath();
}
