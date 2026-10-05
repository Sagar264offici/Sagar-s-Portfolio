import { useEffect, useRef } from "react";

const RGB = "97,218,251"; // #61DAFB
const TAU = Math.PI * 2;
const RATIO = 0.38;
const ORBIT_ANGLES = [0, Math.PI / 3, (Math.PI * 2) / 3];
const PHASES = [0, 1 / 3, 2 / 3];
const SPEED = 0.2;
const SPIN = 0.1; // slow rotation of the whole logo (rad/s)
const N = 360;

const table: { len: number; x: number; y: number }[] = [{ len: 0, x: 1, y: 0 }];
let total = 0;
for (let i = 1; i <= N; i++) {
  const a = (i / N) * TAU;
  const x = Math.cos(a);
  const y = Math.sin(a) * RATIO;
  const prev = table[i - 1];
  total += Math.hypot(x - prev.x, y - prev.y);
  table.push({ len: total, x, y });
}

const pointAt = (u: number) => {
  const target = (((u % 1) + 1) % 1) * TAU;
  let lo = 0;
  let hi = N;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid].len <= target) lo = mid;
    else hi = mid;
  }
  const a = table[lo];
  const b = table[lo + 1];
  const f = (target - a.len) / (b.len - a.len || 1);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
};

interface Dust {
  a: number;
  r: number;
  s: number;
  size: number;
  tw: number;
  z: number;
}

export function ReactLogoLoader({ size = 150, reducedMotion = false }: { size?: number; reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = reducedMotion;

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let W = 0;
    let H = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const dust: Dust[] = reduced
      ? []
      : Array.from({ length: 20 }, () => ({
          a: Math.random() * TAU,
          r: 0.25 + Math.random() * 1.1,
          s: (Math.random() - 0.5) * 0.14,
          size: 0.6 + Math.random() * 1.5,
          tw: Math.random() * TAU,
          z: 0.3 + Math.random() * 1,
        }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const draw = (now: number) => {
      if (reduced) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#61DAFB";
        ctx.fillRect(0, 0, W, H);
        raf = requestAnimationFrame(draw);
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const k = 1 - Math.pow(0.001, dt);
      mouse.x += (mouse.tx - mouse.x) * k * 0.6;
      mouse.y += (mouse.ty - mouse.y) * k * 0.6;

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.44;
      const cxT = Math.cos(-mouse.y * 0.35);
      const sxT = Math.sin(-mouse.y * 0.35);
      const cyT = Math.cos(mouse.x * 0.4);
      const syT = Math.sin(mouse.x * 0.4);
      const spin = t * SPIN;

      const toScreen = (lx: number, ly: number, rot: number) => {
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        const x = (lx * c - ly * s) * R;
        const y = (lx * s + ly * c) * R;
        const y1 = y * cxT;
        const z1 = y * sxT;
        const x2 = x * cyT + z1 * syT;
        const z2 = -x * syT + z1 * cyT;
        const d = 700 / (700 - z2);
        return { x: cx + x2 * d, y: cy + y1 * d, d };
      };

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // ambient bloom
      const breathe = 1 + Math.sin(t * 1.2) * 0.06;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3 * breathe);
      bg.addColorStop(0, `rgba(${RGB},0.14)`);
      bg.addColorStop(0.45, `rgba(40,130,255,0.045)`);
      bg.addColorStop(1, `rgba(${RGB},0)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // orbit rings - simplified, fewer segments
      const lw = Math.max(1, R * 0.02);
      ORBIT_ANGLES.forEach((ang, o) => {
        const us = (PHASES[o] + t * SPEED) % 1;
        const start = Math.floor(us * N) % N;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const a = ((start + i) % N) / N * TAU;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R * RATIO;
          if (i === 0) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.strokeStyle = `rgba(${RGB},0.04)`;
        ctx.lineWidth = lw;
        ctx.stroke();
      });

      // electrons - fewer steps (30 vs 60)
      const coreR = R * 0.036;
      ORBIT_ANGLES.forEach((ang, i) => {
        const u = (PHASES[i] + t * SPEED) % 1;
        const steps = 30;
        for (let j = steps; j >= 1; j--) {
          const p = j / steps;
          const a = (u - p * 0.24 + TAU) % TAU;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R * RATIO;
          const s = toScreen(x, y, ang + spin);
          const alpha = Math.pow(1 - p, 2) * 0.55;
          const g = Math.round(255 - p * 37);
          ctx.fillStyle = `rgba(${g},${Math.min(255, g + 20)},255,${alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, coreR * (1 - p * 0.6) * s.d, 0, TAU);
          ctx.fill();
        }

        const hp = pointAt(u);
        const h = toScreen(hp.x, hp.y, ang + spin);
        const glowR = coreR * 7 * h.d;
        const glow = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, glowR);
        glow.addColorStop(0, "rgba(255,255,255,1)");
        glow.addColorStop(0.12, "rgba(220,250,255,0.9)");
        glow.addColorStop(0.32, `rgba(${RGB},0.5)`);
        glow.addColorStop(1, `rgba(${RGB},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(h.x, h.y, glowR, 0, TAU);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(h.x, h.y, coreR * 1.1 * h.d, 0, TAU);
        ctx.fill();
      });

      // nucleus
      const nR = R * 0.14 * (1 + Math.sin(t * 2.4) * 0.05);
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, nR * 3.4);
      aura.addColorStop(0, `rgba(${RGB},0.6)`);
      aura.addColorStop(0.4, `rgba(${RGB},0.18)`);
      aura.addColorStop(1, `rgba(${RGB},0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, nR * 3.4, 0, TAU);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.shadowColor = `rgba(${RGB},1)`;
      ctx.shadowBlur = 20;
      const disc = ctx.createRadialGradient(cx - nR * 0.25, cy - nR * 0.3, 0, cx, cy, nR);
      disc.addColorStop(0, "#ffffff");
      disc.addColorStop(0.4, "#c9f4ff");
      disc.addColorStop(1, "#61DAFB");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, nR, 0, TAU);
      ctx.fill();
      ctx.restore();
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [size, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        maxWidth: "60vw",
        maxHeight: "60vw",
        display: "block",
      }}
    />
  );
}