import { CARD_LAYOUT, buildArchMask, fitCutout } from './portraitFitter.js';

export function drawText(ctx, field, value) {
    const f = CARD_LAYOUT.fields[field];
    if (!f) return;

    const text = String(value ?? '');
    if (!text.trim()) return;

    const padX = 14;
    const padY = 10;
    const maxWidth = f.w - padX * 2;
    const maxHeight = f.h - padY * 2;

    const wrap = (fontSize) => {
        ctx.font = `bold ${fontSize}px "Arial Black", system-ui, sans-serif`;
        const out = [];
        for (const para of text.split('\n')) {
            const words = para.split(/\s+/).filter(Boolean);
            let line = '';
            for (const word of words) {
                const test = line ? line + ' ' + word : word;
                if (ctx.measureText(test).width > maxWidth && line) {
                    out.push(line);
                    line = word;
                } else {
                    line = test;
                }
            }
            if (line) out.push(line);
        }
        return out;
    };

    let fontSize = f.fontSize;
    let lines = wrap(fontSize);
    let lineHeight = fontSize * 1.22;
    while ((lines.length * lineHeight > maxHeight) && fontSize > 10) {
        fontSize -= 2;
        lines = wrap(fontSize);
        lineHeight = fontSize * 1.22;
    }

    ctx.save();
    ctx.fillStyle = '#F5F5F7';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px "Arial Black", system-ui, sans-serif`;

    const x0 = f.x + padX;
    let y0 = f.y + padY + fontSize / 2;
    for (const line of lines) {
        ctx.fillText(line, x0, y0);
        y0 += lineHeight;
    }
    ctx.restore();
}

export function renderCard(canvas, state, templateImg) {
    const ctx = canvas.getContext('2d');
    canvas.width = CARD_LAYOUT.width;
    canvas.height = CARD_LAYOUT.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    }

    if (state.cutout && templateImg) {
        const arch = buildArchMask(templateImg);
        const portrait = CARD_LAYOUT.portrait;
        const pos = fitCutout(state.cutout, arch);

        const layer = document.createElement('canvas');
        layer.width = portrait.width;
        layer.height = portrait.height;
        const lctx = layer.getContext('2d');
        lctx.drawImage(state.cutout, pos.x - portrait.x, pos.y - portrait.y, pos.w, pos.h);
        lctx.globalCompositeOperation = 'destination-in';
        lctx.drawImage(arch.canvas, 0, 0);
        ctx.drawImage(layer, portrait.x, portrait.y);

        console.log('[CARD] cutout:', state.cutout.width + 'x' + state.cutout.height,
            '| subjectBounds:', state.bounds && JSON.stringify(state.bounds),
            '| archInterior:', JSON.stringify(arch.bounds),
            '| scale:', pos.scale.toFixed(4),
            '| drawRect:', JSON.stringify({ x: pos.x, y: pos.y, w: pos.w, h: pos.h }));
    }

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
}
