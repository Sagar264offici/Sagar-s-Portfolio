import * as THREE from "three";

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

/* ── Value noise helpers ───────────────────────────────── */
const rand = (x: number, y: number, seed: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = rand(xi, yi, seed);
  const b = rand(xi + 1, yi, seed);
  const c = rand(xi, yi + 1, seed);
  const d = rand(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}
function fbm(x: number, y: number, seed: number, octaves = 3): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    v += amp * noise(x * freq, y * freq, seed + i * 7);
    total += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return v / total;
}
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function blend(r: number, g: number, b: number): [number, number, number] {
  return [Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b))];
}

/* ── Sun with sunspots ─────────────────────────────────── */
export function createSunTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const img = ctx.createImageData(256, 256);
  const data = img.data;
  const spots: { x: number; y: number; r: number }[] = [];
  const rng = mulberry(1337);
  for (let i = 0; i < 7; i++) {
    spots.push({ x: rng(), y: rng(), r: 0.03 + rng() * 0.06 });
  }

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const u = (x / 256) * 6;
      const v = (y / 256) * 6;
      let n = fbm(u, v, 1);
      n = Math.pow(Math.max(0, n), 1.5);

      let r = 255;
      let g = 120 + n * 135;
      let b = 40 + n * 60;

      for (const s of spots) {
        const dx = (x / 256 - s.x) / s.r;
        const dy = (y / 256 - s.y) / (s.r * 1.7);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) {
          const k = (1 - d) * 0.85;
          r = Math.max(0, r - k * 190);
          g = Math.max(0, g - k * 150);
          b = Math.max(0, b - k * 110);
        }
      }

      const idx = (y * 256 + x) * 4;
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ── Planet surfaces — real solar-system looks ─────────── */
export type PlanetStyle =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "moon"
  | "rocky"
  | "icy";

interface Crater {
  x: number;
  y: number;
  r: number;
}

function rollCraters(rng: () => number, count: number, maxR: number): Crater[] {
  const out: Crater[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ x: rng(), y: rng(), r: 0.02 + rng() * maxR });
  }
  return out;
}

/** Draw a soft-edged ellipse splotch into the pixel buffer. */
function splotch(data: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, rx: number, ry: number, strength: number, tint: [number, number, number], mode: "darken" | "lighten" | "mix") {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x / w - cx) / rx;
      const dy = (y / h - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) {
        const k = (1 - d) * (1 - d) * strength;
        const idx = (y * w + x) * 4;
        if (mode === "darken") {
          data[idx] = Math.max(0, data[idx] - k * tint[0]);
          data[idx + 1] = Math.max(0, data[idx + 1] - k * tint[1]);
          data[idx + 2] = Math.max(0, data[idx + 2] - k * tint[2]);
        } else if (mode === "lighten") {
          data[idx] = Math.min(255, data[idx] + k * (tint[0] - data[idx]));
          data[idx + 1] = Math.min(255, data[idx + 1] + k * (tint[1] - data[idx + 1]));
          data[idx + 2] = Math.min(255, data[idx + 2] + k * (tint[2] - data[idx + 2]));
        } else {
          data[idx] = data[idx] * (1 - k) + tint[0] * k;
          data[idx + 1] = data[idx + 1] * (1 - k) + tint[1] * k;
          data[idx + 2] = data[idx + 2] * (1 - k) + tint[2] * k;
        }
      }
    }
  }
}

export function createPlanetTexture(style: PlanetStyle, seed: number, base?: string): THREE.CanvasTexture {
  const SIZE = 256;
  const [canvas, ctx] = makeCanvas(SIZE);
  const img = ctx.createImageData(SIZE, SIZE);
  const data = img.data;
  const rng = mulberry(seed * 7919 + 13);

  const craters = rollCraters(
    rng,
    style === "mercury" ? 26 : style === "moon" ? 22 : style === "pluto" ? 10 : style === "rocky" ? 8 : style === "mars" ? 6 : 0,
    style === "mercury" ? 0.06 : style === "moon" ? 0.07 : 0.05
  );

  // fixed features (Jupiter's Great Red Spot, Neptune's storm, Mars' dark Syrtis, Pluto's heart)
  const spotX = 0.3 + rng() * 0.4;
  const spotY = 0.35 + rng() * 0.3;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE;
      const v = y / SIZE;
      let r = 0;
      let g = 0;
      let b = 0;

      switch (style) {
        case "mercury": {
          const n = fbm(u * 6, v * 6, seed, 4);
          const light = 0.5 + n * 0.75;
          r = 158 * light;
          g = 149 * light;
          b = 138 * light;
          const pat = fbm(u * 3 + 5, v * 3, seed + 3, 3);
          if (pat > 0.62) {
            r *= 0.82;
            g *= 0.86;
            b *= 0.92;
          } else if (pat < 0.38) {
            r = r * 0.7 + 96 * 0.3;
            g = g * 0.7 + 84 * 0.3;
            b = b * 0.7 + 76 * 0.3;
          }
          break;
        }
        case "venus": {
          const swirl = fbm(u * 4, v * 4, seed, 4);
          const bands = Math.sin(v * Math.PI * 5 + swirl * 4.2);
          const light = 0.78 + 0.3 * (0.5 + 0.5 * bands);
          r = (230 + swirl * 22) * light;
          g = (198 + swirl * 20) * light;
          b = (130 + swirl * 26) * light;
          break;
        }
        case "earth": {
          // oceans
          r = 26;
          g = 62;
          b = 148;
          const cont = fbm(u * 3.1, v * 3.1, seed, 5);
          if (cont > 0.56) {
            const land = fbm(u * 5 + 11, v * 5 + 3, seed + 9, 4);
            const green = fbm(u * 6 + 2, v * 6, seed + 13, 3);
            if (green > 0.5) {
              r = 52 + land * 34;
              g = 104 + land * 44;
              b = 52 + land * 22;
            } else {
              r = 128 + land * 34;
              g = 102 + land * 30;
              b = 66 + land * 22;
            }
            // polar ice near the top/bottom of land
            if (v < 0.09 || v > 0.91) {
              r = 236;
              g = 238;
              b = 242;
            }
          }
          const cl = fbm(u * 7 + 31, v * 7 + 7, seed + 7, 3);
          if (cl > 0.63) {
            const k = (cl - 0.63) * 1.9;
            r = r * (1 - k) + 244 * k;
            g = g * (1 - k) + 246 * k;
            b = b * (1 - k) + 248 * k;
          }
          break;
        }
        case "mars": {
          const n = fbm(u * 5, v * 5, seed, 4);
          const light = 0.52 + n * 0.8;
          r = (190 - n * 26) * light;
          g = (84 - n * 16) * light;
          b = (52 - n * 12) * light;
          const dark = fbm(u * 3.4 + 4, v * 3.4, seed + 5, 3);
          if (dark > 0.58) {
            r *= 0.62;
            g *= 0.62;
            b *= 0.66;
          }
          if (v < 0.05 || v > 0.95) {
            r = 240;
            g = 236;
            b = 228;
          }
          break;
        }
        case "jupiter": {
          const band = Math.sin(v * Math.PI * 11 + fbm(u * 3, v * 5, seed, 3) * 4);
          const bandIdx = Math.floor((v * 11 + 0.5) % 11);
          let br = 196;
          let bg = 168;
          let bb = 134;
          if (bandIdx % 3 === 0) {
            br = 226;
            bg = 212;
            bb = 186;
          } else if (bandIdx % 3 === 1) {
            br = 164;
            bg = 132;
            bb = 100;
          } else {
            br = 214;
            bg = 192;
            bb = 158;
          }
          const light = 0.62 + 0.38 * (0.5 + 0.5 * band);
          r = br * light;
          g = bg * light;
          b = bb * light;
          // Great Red Spot
          const sdx = (u - 0.64) / 0.085;
          const sdy = (v - 0.62) / 0.05;
          const sd = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sd < 1) {
            const k = (1 - sd) * 0.9;
            r = r * (1 - k) + (192 - (1 - sd) * 40) * k;
            g = g * (1 - k) + (86 - (1 - sd) * 20) * k;
            b = b * (1 - k) + 62 * k;
          }
          break;
        }
        case "saturn": {
          const bands = Math.sin(v * Math.PI * 9 + fbm(u * 2.4, v * 4, seed, 3) * 2.2);
          const light = 0.66 + 0.32 * (0.5 + 0.5 * bands);
          r = 232 * light;
          g = 217 * light;
          b = 178 * light;
          const stripe = Math.sin(v * Math.PI * 42 + fbm(u * 8, v * 8, seed + 5, 2) * 6) * 0.05;
          r += stripe * 60;
          g += stripe * 55;
          b += stripe * 40;
          break;
        }
        case "uranus": {
          r = 134;
          g = 208;
          b = 214;
          const band = Math.sin(u * Math.PI * 8 + fbm(v * 4, u * 4, seed, 3) * 3) * 0.05;
          r += band * 40;
          g += band * 40;
          b += band * 36;
          if (v < 0.1 || v > 0.9) {
            const k = Math.min(1, (v < 0.1 ? 0.1 - v : v - 0.9) * 14);
            r = r * (1 - k) + 208 * k;
            g = g * (1 - k) + 234 * k;
            b = b * (1 - k) + 236 * k;
          }
          break;
        }
        case "neptune": {
          const band = Math.sin(v * Math.PI * 5 + fbm(u * 3, v * 3, seed, 3) * 2.4);
          const light = 0.86 + 0.16 * (0.5 + 0.5 * band);
          r = 52 * light;
          g = 94 * light;
          b = 222 * light;
          const sdx = (u - 0.72) / 0.05;
          const sdy = (v - 0.38) / 0.035;
          const sd = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sd < 1) {
            const k = (1 - sd) * 0.85;
            r = r * (1 - k) + 236 * k;
            g = g * (1 - k) + 242 * k;
            b = b * (1 - k) + 248 * k;
          }
          break;
        }
        case "pluto": {
          const n = fbm(u * 5, v * 5, seed, 4);
          const light = 0.5 + n * 0.7;
          r = 172 * light;
          g = 142 * light;
          b = 114 * light;
          const dark = fbm(u * 3.6 + 7, v * 3.6, seed + 5, 3);
          if (dark > 0.6) {
            r *= 0.55;
            g *= 0.58;
            b *= 0.62;
          }
          // Tombaugh heart
          const hdx = (u - 0.62) / 0.1;
          const hdy = (v - 0.34) / 0.075;
          const hd = Math.sqrt(hdx * hdx + hdy * hdy);
          if (hd < 1) {
            const k = (1 - hd) * (1 - hd) * 0.95;
            r = r * (1 - k) + 240 * k;
            g = g * (1 - k) + 236 * k;
            b = b * (1 - k) + 226 * k;
          }
          break;
        }
        case "moon": {
          const n = fbm(u * 5, v * 5, seed, 4);
          const light = 0.55 + n * 0.7;
          r = 166 * light;
          g = 166 * light;
          b = 174 * light;
          break;
        }
        case "rocky": {
          const [br, bg, bb] = base ? hexToRgb(base) : [148, 148, 158];
          const n = fbm(u * 5, v * 5, seed, 4);
          const light = 0.5 + n * 0.8;
          r = br * light;
          g = bg * light;
          b = bb * light;
          break;
        }
        case "icy": {
          const [br, bg, bb] = base ? hexToRgb(base) : [150, 160, 190];
          const n = fbm(u * 5, v * 5, seed, 4);
          const light = 0.5 + n * 0.7;
          r = br * 0.85 * light + 216 * 0.22;
          g = bg * 0.85 * light + 230 * 0.22;
          b = bb * 0.85 * light + 250 * 0.28;
          break;
        }
      }

      const idx = (y * SIZE + x) * 4;
      const [cr, cg, cb] = blend(r, g, b);
      data[idx] = cr;
      data[idx + 1] = cg;
      data[idx + 2] = cb;
      data[idx + 3] = 255;
    }
  }

  // crater pass — drawn after so rims read over any surface
  for (const c of craters) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const u = x / SIZE;
        const v = y / SIZE;
        const dx = u - c.x;
        const dy = v - c.y;
        const d = Math.sqrt(dx * dx + dy * dy) / c.r;
        if (d < 1) {
          const idx = (y * SIZE + x) * 4;
          const rim = Math.sin(d * Math.PI) * 0.5;
          const k = (1 - d) * 0.55 - rim * 0.22;
          data[idx] = Math.max(0, data[idx] - k * 110);
          data[idx + 1] = Math.max(0, data[idx + 1] - k * 110);
          data[idx + 2] = Math.max(0, data[idx + 2] - k * 110);
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/* ── Saturn-style ring bands (real tan) ────────────────── */
export function createRingTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const bands: { from: number; to: number; alpha: number; light: number }[] = [
    { from: 0.34, to: 0.44, alpha: 0.18, light: 0.75 },
    { from: 0.44, to: 0.56, alpha: 0.95, light: 0.95 },
    { from: 0.56, to: 0.6, alpha: 0.35, light: 0.8 },
    { from: 0.6, to: 0.74, alpha: 0.8, light: 0.9 },
    { from: 0.74, to: 0.8, alpha: 0.3, light: 0.78 },
    { from: 0.8, to: 0.96, alpha: 0.55, light: 0.86 },
  ];
  ctx.clearRect(0, 0, 256, 256);
  for (const bnd of bands) {
    const r0 = bnd.from * 128;
    const r1 = bnd.to * 128;
    const light = bnd.light;
    const grad = ctx.createRadialGradient(128, 128, r0, 128, 128, r1);
    grad.addColorStop(0, `rgba(${Math.round(216 * light)}, ${Math.round(190 * light)}, ${Math.round(150 * light)}, ${bnd.alpha})`);
    grad.addColorStop(1, `rgba(${Math.round(216 * light)}, ${Math.round(190 * light)}, ${Math.round(150 * light)}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, r1, 0, Math.PI * 2);
    ctx.arc(128, 128, r0, 0, Math.PI * 2, true);
    ctx.fill();
  }
  // Cassini gap
  const gap = ctx.createRadialGradient(128, 128, 116, 128, 128, 124);
  gap.addColorStop(0, "rgba(0,0,0,0.92)");
  gap.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gap;
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.arc(128, 128, 116, 0, Math.PI * 2, true);
  ctx.fill();
  // fine streak noise inside the dense bands
  const rng = mulberry(42);
  for (let i = 0; i < 46; i++) {
    const a = (rng() * 0.5 + 0.44) * 2 * Math.PI;
    const rr = (0.44 + rng() * 0.12) * 128;
    ctx.fillStyle = `rgba(240, 224, 196, ${0.04 + rng() * 0.08})`;
    ctx.beginPath();
    ctx.arc(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr, 1 + rng() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Soft radial glow sprite ───────────────────────────── */
export function createGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.35)"));
  grad.addColorStop(1, outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Nebula cloud — clustered fbm blobs ────────────────── */
export function createNebulaTexture(seed: number, colorA: string, colorB: string): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const rng = mulberry(seed);
  ctx.clearRect(0, 0, 256, 256);

  const bg = ctx.createRadialGradient(128, 128, 6, 128, 128, 148);
  bg.addColorStop(0, hexToRgba(colorA, 0.42));
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 40; i++) {
    const x = rng() * 256;
    const y = rng() * 256;
    const r = 16 + rng() * 54;
    const col = rng() > 0.45 ? colorA : colorB;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexToRgba(col, 0.1 + rng() * 0.12));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  for (let i = 0; i < 12; i++) {
    const x = rng() * 256;
    const y = rng() * 256;
    const r = 3 + rng() * 8;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.3)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Thin gradient streak (comet trail) ────────────────── */
export function createTrailTexture(color: string): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(128);
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, color.replace(/[\d.]+\)$/, "0)"));
  grad.addColorStop(0.6, color.replace(/[\d.]+\)$/, "0.5)"));
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Anamorphic streak for the sun's lens flare ────────── */
export function createStreakTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  ctx.clearRect(0, 0, 256, 256);
  const h = ctx.createLinearGradient(0, 128, 256, 128);
  h.addColorStop(0, "rgba(255, 220, 170, 0)");
  h.addColorStop(0.42, "rgba(255, 236, 205, 0.26)");
  h.addColorStop(0.5, "rgba(255, 246, 228, 0.85)");
  h.addColorStop(0.58, "rgba(255, 236, 205, 0.26)");
  h.addColorStop(1, "rgba(255, 220, 170, 0)");
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 256, 256);
  // vertical falloff so the streak is thin
  const v = ctx.createLinearGradient(128, 0, 128, 256);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.5, "rgba(255,255,255,1)");
  v.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalCompositeOperation = "source-over";
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Round star sprite ─────────────────────────────────── */
export function createStarTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(64);
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
