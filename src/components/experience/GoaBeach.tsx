import React, { useEffect, useRef } from 'react';

interface GoaBeachProps {
  dim?: number;
  className?: string;
}

/**
 * Procedurally-drawn cinematic Goa beach scene.
 * Sky -> sun glow -> haze -> ocean -> sand -> palm silhouettes.
 * Slow parallax on pointer move, animated ocean shimmer.
 * No external assets — the beach is rendered in code.
 */
export const GoaBeach: React.FC<GoaBeachProps> = ({ dim = 0, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 });
  const dimRef = useRef(dim);
  dimRef.current = dim;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let DPR = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(rect.width, 1);
      H = Math.max(rect.height, 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);

    const onPointer = (e: PointerEvent) => {
      pointerRef.current.tx = e.clientX / window.innerWidth;
      pointerRef.current.ty = e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onPointer);

    // ── Deterministic pseudo-random for stable silhouettes ──
    const rand = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t * t * (3 - 2 * t);

    const drawPalm = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      lean: number,
      time: number
    ) => {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.fillStyle = '#0d0a12';
      c.strokeStyle = '#0d0a12';
      c.lineCap = 'round';

      // trunk — tapered, curved
      const trunkH = 170;
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(lean * 60, -trunkH * 0.55, lean * 110, -trunkH);
      c.stroke();
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(lean * 60, -trunkH * 0.55, lean * 110, -trunkH);
      c.stroke();

      const topX = lean * 110;
      const topY = -trunkH;
      const sway = Math.sin(time * 0.5 + x) * 3;

      // fronds
      const fronds = 7;
      for (let i = 0; i < fronds; i++) {
        const ang = -Math.PI + (i / (fronds - 1)) * Math.PI + Math.sin(time * 0.6 + i) * 0.04;
        const len = 78 + rand(i + 9) * 26;
        c.lineWidth = 7;
        c.beginPath();
        c.moveTo(topX, topY);
        c.quadraticCurveTo(
          topX + Math.cos(ang) * len * 0.5 + sway,
          topY + Math.sin(ang) * len * 0.5 - 22,
          topX + Math.cos(ang) * len,
          topY + Math.sin(ang) * len + 18
        );
        c.stroke();
      }
      // trunk rings
      c.strokeStyle = 'rgba(20,14,24,0.6)';
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        const ty = -trunkH * t * 0.92;
        const lw = Math.max(2, 8 * (1 - t));
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(lean * 60 * t - 2, ty);
        c.lineTo(lean * 60 * t + 2, ty);
        c.stroke();
      }
      c.restore();
    };

    const drawScene = (time: number) => {
      const p = pointerRef.current;
      p.x = lerp(p.x, p.tx, 0.04);
      p.y = lerp(p.y, p.ty, 0.04);
      const px = (p.x - 0.5) * 2; // -1..1
      const py = (p.y - 0.5) * 2;

      ctx.save();
      ctx.scale(DPR, DPR);
      ctx.clearRect(0, 0, W, H);
      ctx.translate(px * -6, py * -4);

      const horizon = H * 0.56;
      const skyH = horizon;

      // ── Sky ──
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, '#170d33');
      sky.addColorStop(0.42, '#4a1e5f');
      sky.addColorStop(0.72, '#c44a62');
      sky.addColorStop(1, '#ff9e6d');
      ctx.fillStyle = sky;
      ctx.fillRect(-10, -10, W + 20, skyH + 10);

      // ── Sun glow ──
      const sunX = W * (0.5 + px * 0.01);
      const sunY = horizon - H * 0.075;
      const glowR = Math.min(W, H) * 0.34;
      const sunR = Math.min(W, H) * 0.052;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
      sunGrad.addColorStop(0, 'rgba(255,214,150,0.95)');
      sunGrad.addColorStop(0.18, 'rgba(255,168,90,0.55)');
      sunGrad.addColorStop(0.55, 'rgba(255,120,80,0.12)');
      sunGrad.addColorStop(1, 'rgba(255,120,80,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, glowR, 0, Math.PI * 2);
      ctx.fill();

      const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
      sunCore.addColorStop(0, '#fff2d6');
      sunCore.addColorStop(0.7, '#ffd9a0');
      sunCore.addColorStop(1, '#ffb26b');
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // ── Haze bands ──
      ctx.fillStyle = 'rgba(255,170,130,0.16)';
      ctx.fillRect(-10, horizon - H * 0.05, W + 20, H * 0.05);
      ctx.fillStyle = 'rgba(120,60,110,0.18)';
      ctx.fillRect(-10, horizon - H * 0.11, W + 20, H * 0.06);

      // distant light specks (islands / boats)
      ctx.fillStyle = 'rgba(255,214,160,0.6)';
      for (let i = 0; i < 14; i++) {
        const lx = rand(i * 7 + 3) * W;
        const ly = horizon - H * 0.02 - rand(i * 13 + 1) * H * 0.03;
        const tw = 0.5 + 0.5 * Math.sin(time * 1.4 + i * 2.4);
        ctx.globalAlpha = 0.15 + 0.4 * tw;
        ctx.fillRect(lx, ly, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // ── Ocean ──
      const oceanTop = horizon;
      const ocean = ctx.createLinearGradient(0, oceanTop, 0, H);
      ocean.addColorStop(0, '#ff9e6d');
      ocean.addColorStop(0.12, '#b25a3c');
      ocean.addColorStop(0.35, '#2e5a4c');
      ocean.addColorStop(0.62, '#13493d');
      ocean.addColorStop(1, '#0c3329');
      ctx.fillStyle = ocean;
      ctx.fillRect(-10, oceanTop, W + 20, H - oceanTop + 10);

      // sun reflection on water
      const reflGrad = ctx.createLinearGradient(sunX - 60, oceanTop, sunX + 60, H);
      reflGrad.addColorStop(0, 'rgba(255,200,130,0.5)');
      reflGrad.addColorStop(1, 'rgba(255,200,130,0)');
      ctx.fillStyle = reflGrad;
      ctx.beginPath();
      ctx.moveTo(sunX - 60, oceanTop);
      ctx.lineTo(sunX + 60, oceanTop);
      ctx.lineTo(sunX + 160, H);
      ctx.lineTo(sunX - 160, H);
      ctx.closePath();
      ctx.fill();

      // wave shimmer lines
      ctx.strokeStyle = 'rgba(255,220,170,0.22)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 22; i++) {
        const wy = oceanTop + H * 0.018 + i * H * 0.03;
        const amp = 5 + rand(i) * 10;
        const sp = 0.4 + rand(i + 40) * 0.5;
        ctx.beginPath();
        for (let wx = -20; wx <= W + 20; wx += 16) {
          const waveY = wy + Math.sin(wx * 0.02 + time * sp + i) * amp;
          if (wx === -20) ctx.moveTo(wx, waveY);
          else ctx.lineTo(wx, waveY);
        }
        ctx.stroke();
      }

      // ── Sand ──
      const sandTop = H * 0.86;
      const sand = ctx.createLinearGradient(0, sandTop, 0, H);
      sand.addColorStop(0, '#e8c08a');
      sand.addColorStop(0.25, '#d9a46b');
      sand.addColorStop(0.7, '#7a4a38');
      sand.addColorStop(1, '#3a2020');
      ctx.fillStyle = sand;
      ctx.beginPath();
      ctx.moveTo(-10, H + 10);
      ctx.lineTo(-10, sandTop);
      ctx.quadraticCurveTo(W * 0.5, sandTop - 18, W + 10, sandTop);
      ctx.lineTo(W + 10, H + 10);
      ctx.closePath();
      ctx.fill();

      // wet sand band
      ctx.fillStyle = 'rgba(120,60,50,0.28)';
      ctx.beginPath();
      ctx.moveTo(-10, sandTop + 8);
      ctx.quadraticCurveTo(W * 0.5, sandTop - 8, W + 10, sandTop + 8);
      ctx.lineTo(W + 10, sandTop + 34);
      ctx.quadraticCurveTo(W * 0.5, sandTop + 20, -10, sandTop + 34);
      ctx.closePath();
      ctx.fill();

      // ── Palm silhouettes (foreground, parallax) ──
      const palms: { x: number; y: number; s: number; lean: number; depth: number }[] = [
        { x: W * 0.05, y: H * 1.02, s: 1.5, lean: 0.16, depth: 1.6 },
        { x: W * 0.13, y: H * 1.04, s: 1.05, lean: -0.1, depth: 1.2 },
        { x: W * 0.88, y: H * 1.01, s: 1.7, lean: -0.2, depth: 1.7 },
        { x: W * 0.95, y: H * 1.05, s: 1.2, lean: 0.12, depth: 1.3 },
        { x: W * 0.2, y: H * 1.02, s: 0.7, lean: 0.05, depth: 0.9 },
        { x: W * 0.79, y: H * 1.03, s: 0.85, lean: -0.05, depth: 1.0 },
      ];
      for (const palm of palms) {
        const par = (palm.depth - 1) * 14;
        ctx.save();
        ctx.translate(px * par, py * par * 0.5);
        drawPalm(ctx, palm.x, palm.y, palm.s, palm.lean, time);
        ctx.restore();
      }

      // distant palm on horizon (far, small)
      drawPalm(ctx, W * 0.24, horizon + 4, 0.32, -0.05, time);
      drawPalm(ctx, W * 0.7, horizon + 4, 0.3, 0.05, time);

      // ── Dim / transition darkening ──
      if (dimRef.current > 0) {
        ctx.fillStyle = `rgba(4, 7, 6, ${ease(dimRef.current) * 0.96})`;
        ctx.fillRect(-20, -20, W + 40, H + 40);
      }

      ctx.restore();
    };

    const loop = (t: number) => {
      drawScene(t / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
};
