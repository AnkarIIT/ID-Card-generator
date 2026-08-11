import { CARD_LAYOUT, fitCutout, clipPortraitArch } from './portraitFitter.js';

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
    ctx.fillStyle = '#F5F5F7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${f.fontSize}px system-ui, sans-serif`;

    const centerX = f.x + f.w / 2;
    const centerY = f.y + f.h / 2;

    drawWrappedText(ctx, value, centerX, centerY, f.w - 20, f.fontSize * 1.3);
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

    if (state.cutout) {
        ctx.save();
        const pos = fitCutout(state.cutout);
        clipPortraitArch(ctx);
        ctx.clip();
        ctx.drawImage(state.cutout, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();
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
