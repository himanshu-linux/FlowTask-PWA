(function () {
  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const CX = SIZE / 2, CY = SIZE / 2;
  const FPS = 15; // Throttle to 15fps — saves 75% CPU vs 60fps
  const FRAME_INTERVAL = 1000 / FPS;
  let lastTime = 0;

  let t = 0; // global time ticker

  // Smooth easing helpers
  const ease = x => 0.5 - Math.cos(Math.PI * x) / 2;
  const sin  = x => Math.sin(x);
  const cos  = x => Math.cos(x);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawRoundedRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function glow(color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
  }

  function clearGlow() {
    ctx.shadowBlur  = 0;
    ctx.shadowColor = 'transparent';
  }

  function drawArc(cx, cy, r, startAngle, endAngle, lw, color, blur) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';
    glow(color, blur);
    ctx.stroke();
    clearGlow();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // ── 1. Background ──────────────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(CX, CY, 4, CX, CY, 36);
    bgGrad.addColorStop(0, '#1a0a3c');
    bgGrad.addColorStop(1, '#06040f');
    drawRoundedRect(ctx, 0, 0, SIZE, SIZE, 14, bgGrad);

    // ── 2. Subtle background haze glow ─────────────────────────────
    ctx.save();
    const haze = ctx.createRadialGradient(CX, CY, 0, CX, CY, 24);
    haze.addColorStop(0, 'rgba(99,102,241,0.18)');
    haze.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle  = haze;
    ctx.beginPath();
    ctx.arc(CX, CY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 3. Outer rotating gradient arc (thick glow ring) ───────────
    const outerSpeed = t * 1.1;
    const arcLen     = lerp(1.1, 2.2, (sin(t * 0.7) + 1) / 2); // breathing arc length
    
    ctx.save();
    const outerGrad = ctx.createLinearGradient(
      CX + cos(outerSpeed) * 26, CY + sin(outerSpeed) * 26,
      CX + cos(outerSpeed + Math.PI) * 26, CY + sin(outerSpeed + Math.PI) * 26
    );
    outerGrad.addColorStop(0,   'rgba(56, 189, 248, 0)');
    outerGrad.addColorStop(0.3, '#38bdf8');
    outerGrad.addColorStop(0.7, '#818cf8');
    outerGrad.addColorStop(1,   'rgba(129, 140, 248, 0)');

    drawArc(CX, CY, 26, outerSpeed, outerSpeed + arcLen, 3.5, outerGrad, 12);
    ctx.restore();

    // ── 4. Middle counter-rotating arc ─────────────────────────────
    const midSpeed = -t * 0.8;
    const midGrad  = ctx.createLinearGradient(
      CX + cos(midSpeed) * 20, CY + sin(midSpeed) * 20,
      CX + cos(midSpeed + Math.PI) * 20, CY + sin(midSpeed + Math.PI) * 20
    );
    midGrad.addColorStop(0, 'rgba(240, 171, 252, 0)');
    midGrad.addColorStop(0.4, '#e879f9');
    midGrad.addColorStop(1, 'rgba(240, 171, 252, 0)');

    drawArc(CX, CY, 20, midSpeed, midSpeed + 1.4, 2.5, midGrad, 10);

    // ── 5. Inner bright core dot (pulsing) ─────────────────────────
    const pulse   = sin(t * 2.5) * 0.5 + 0.5; // 0..1
    const coreR   = lerp(3.5, 5.5, ease(pulse));
    const coreAlpha = lerp(0.7, 1.0, ease(pulse));

    ctx.beginPath();
    ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreR);
    coreGrad.addColorStop(0, `rgba(255,255,255,${coreAlpha})`);
    coreGrad.addColorStop(0.5, `rgba(56,189,248,${coreAlpha * 0.9})`);
    coreGrad.addColorStop(1, `rgba(56,189,248,0)`);
    ctx.fillStyle = coreGrad;
    glow('#38bdf8', lerp(8, 20, ease(pulse)));
    ctx.fill();
    clearGlow();

    // ── 6. Animated checkmark (draw → hold → fade) ─────────────────
    const cycle   = (t * 0.45) % (Math.PI * 2);
    const drawPct = Math.max(0, Math.min(1, (sin(cycle - 0.5) + 1) / 2)); // smooth 0→1
    const opacity = 0.5 + drawPct * 0.5;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.setLineDash([]);
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.lineWidth   = 4.5;

    const ckGrad = ctx.createLinearGradient(15, 35, 50, 21);
    ckGrad.addColorStop(0, '#00f5ff');
    ckGrad.addColorStop(1, '#818cf8');
    ctx.strokeStyle = ckGrad;
    glow('#00f5ff', 14);

    // Split into two segments
    const seg1 = 0.35; // first 35% of progress = first arm
    if (drawPct > 0) {
      ctx.beginPath();
      if (drawPct <= seg1) {
        const tp = drawPct / seg1;
        ctx.moveTo(15, 35);
        ctx.lineTo(lerp(15, 27, tp), lerp(35, 46, tp));
      } else {
        const tp = (drawPct - seg1) / (1 - seg1);
        ctx.moveTo(15, 35);
        ctx.lineTo(27, 46);
        ctx.lineTo(lerp(27, 50, tp), lerp(46, 21, tp));
      }
      ctx.stroke();
    }
    clearGlow();
    ctx.restore();

    // ── Update & apply ─────────────────────────────────────────────
    t += 0.035;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = canvas.toDataURL();

    requestAnimationFrame(loop);
  }

  // Throttle loop: only call drawFrame at 15fps
  function loop(timestamp) {
    if (timestamp - lastTime >= FRAME_INTERVAL) {
      lastTime = timestamp;
      drawFrame();
    } else {
      requestAnimationFrame(loop);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(loop));
  } else {
    requestAnimationFrame(loop);
  }
})();
