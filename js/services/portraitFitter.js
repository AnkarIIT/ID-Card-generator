export const CARD_LAYOUT = {
    width: 1024,
    height: 1536,
    portrait: {
        x: 222,
        y: 78,
        width: 580,
        height: 750
    },
    photo: {
        x: 222,
        y: 78,
        width: 580,
        height: 750
    },
    fields: {
        name: { x: 55, y: 505, w: 430, h: 200, fontSize: 68 },
        role: { x: 55, y: 715, w: 430, h: 110, fontSize: 32 },
        stack: { x: 55, y: 835, w: 430, h: 155, fontSize: 20 },
        builderTitle: { x: 55, y: 985, w: 430, h: 155, fontSize: 40 },
        building: { x: 55, y: 1140, w: 430, h: 165, fontSize: 24 },
        sideQuest: { x: 55, y: 1305, w: 430, h: 135, fontSize: 22 },
        sleepStatus: { x: 535, y: 850, w: 420, h: 130, fontSize: 20 },
        chaos: { x: 535, y: 1010, w: 420, h: 115, fontSize: 18 },
        poweredBy: { x: 535, y: 1105, w: 420, h: 135, fontSize: 20 },
        mostUsedKey: { x: 535, y: 1240, w: 270, h: 110, fontSize: 24 },
        favoriteError: { x: 535, y: 1355, w: 270, h: 100, fontSize: 36 },
        id: { x: 540, y: 1470, w: 400, h: 50, fontSize: 24 }
    }
};

export function fitCutout(cutout) {
    const portrait = CARD_LAYOUT.portrait;
    const cw = cutout.width;
    const ch = cutout.height;

    const scale = Math.min(
        portrait.width * 0.85 / cw,
        portrait.height * 0.85 / ch
    );

    const renderedWidth = cw * scale;
    const renderedHeight = ch * scale;

    const x = portrait.x + (portrait.width - renderedWidth) / 2;
    const y = portrait.y + 50;

    return { x, y, w: renderedWidth, h: renderedHeight };
}

export function clipPortraitArch(ctx) {
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
