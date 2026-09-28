import { useEffect, useRef } from "react";

// React logo geometry: 3 identical ellipses rotated 0°, 60°, 120°
const RGB = "97,218,251"; // #61DAFB
const TAU = Math.PI * 2;
const RATIO = 0.38;
const ORBIT_ANGLES = [0, Math.PI / 3, (Math.PI * 2) / 3];
const PHASES = [0, 1 / 3, 2 / 3];
const SPEED = 0.2; // laps per second
const SPIN = 0.1; // slow rotation of the whole logo (rad/s)

// Arc-length table -> perfectly constant electron speed
const N = 720;
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
  const target = (((u % 1) + 1) % 1) * total;
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

export function ReactLogoLoader({ size = 150 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let W = 0;
    let H = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // drifting dust that gives the scene depth
    const dust: Dust[] = Array.from({ length: 60 }, () => ({
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
      ctx.globalCompositeOperation = "lighter"; // additive light

      // ---- ambient bloom (breathes) ----
      const breathe = 1 + Math.sin(t * 1.2) * 0.06;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3 * breathe);
      bg.addColorStop(0, `rgba(${RGB},0.14)`);
      bg.addColorStop(0.45, `rgba(40,130,255,0.045)`);
      bg.addColorStop(1, `rgba(${RGB},0)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ---- dust ----
      dust.forEach((p) => {
        p.a += p.s * dt;
        const x = cx + Math.cos(p.a) * p.r * R * 1.15 + mouse.x * p.z * 26;
        const y = cy + Math.sin(p.a) * p.r * R * 0.85 + mouse.y * p.z * 26;
        const tw = 0.5 + 0.5 * Math.sin(t * 1.6 + p.tw);
        ctx.fillStyle = `rgba(${RGB},${(0.08 + 0.32 * tw) * p.z})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * p.z, 0, TAU);
        ctx.fill();
      });

      // ---- nucleus ripples ----
      const nR = R * 0.14 * (1 + Math.sin(t * 2.4) * 0.05);
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.3 + i / 3) % 1;
        ctx.strokeStyle = `rgba(${RGB},${Math.pow(1 - p, 2) * 0.28})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, nR * (1.2 + p * 5), 0, TAU);
        ctx.stroke();
      }

      // ---- orbit rings: brighten right behind each electron ----
      const us = PHASES.map((ph) => ph + t * SPEED);
      const lw = Math.max(2, R * 0.02);
      ORBIT_ANGLES.forEach((ang, o) => {
        const pts: { x: number; y: number; d: number }[] = [];
        for (let i = 0; i <= N; i += 4) {
          const p = table[i];
          pts.push(toScreen(p.x, p.y, ang + spin));
        }
        for (let i = 1; i < pts.length; i++) {
          const seg = table[i * 4].len / total;
          const d = (((us[o] - seg) % 1) + 1) % 1;
          const a = 0.2 + 0.8 * Math.exp(-d * 4.5);
          ctx.beginPath();
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          ctx.lineTo(pts[i].x, pts[i].y);
          ctx.lineWidth = lw * 3.6;
          ctx.strokeStyle = `rgba(${RGB},${a * 0.09})`;
          ctx.stroke();
          ctx.lineWidth = lw;
          ctx.strokeStyle = `rgba(${RGB},${a * 0.85})`;
          ctx.stroke();
        }
      });

      // ---- electrons ----
      const coreR = R * 0.036;
      ORBIT_ANGLES.forEach((ang, i) => {
        const u = us[i];
        const steps = 60;
        for (let j = steps; j >= 1; j--) {
          const p = j / steps;
          const lp = pointAt(u - p * 0.24);
          const s = toScreen(lp.x, lp.y, ang + spin);
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

        // soft lens flare streak along the orbit direction
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(ang + spin);
        const fl = ctx.createLinearGradient(-glowR * 1.3, 0, glowR * 1.3, 0);
        fl.addColorStop(0, `rgba(${RGB},0)`);
        fl.addColorStop(0.5, `rgba(${RGB},0.35)`);
        fl.addColorStop(1, `rgba(${RGB},0)`);
        ctx.fillStyle = fl;
        ctx.fillRect(-glowR * 1.3, -1, glowR * 2.6, 2);
        ctx.restore();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(h.x, h.y, coreR * 1.1 * h.d, 0, TAU);
        ctx.fill();
      });

      // ---- nucleus ----
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
      ctx.shadowBlur = 30;
      const disc = ctx.createRadialGradient(cx - nR * 0.25, cy - nR * 0.3, 0, cx, cy, nR);
      disc.addColorStop(0, "#ffffff");
      disc.addColorStop(0.4, "#c9f4ff");
      disc.addColorStop(1, "#61DAFB");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, nR, 0, TAU);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

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
