import * as THREE from "three";

/* Real 2K planet maps from the 3dmigos texture pack dropped into
   public/models/Planets_Blendfile_Textures/. Each loads asynchronously;
   bodies render with their procedural surface until the real map arrives,
   and a missing/corrupt file silently keeps the procedural look. */

const BASE = "/models/Planets_Blendfile_Textures/Textures";

export const REAL_TEX: Record<string, string> = {
  sun: `${BASE}/Sun/2k_sun.jpg`,
  mercury: `${BASE}/Mercury/2k_mercury.jpg`,
  venus: `${BASE}/Venus/2k_venus_surface.jpg`,
  earth: `${BASE}/Erath/2k_earth_daymap.jpg`,
  earthClouds: `${BASE}/Erath/2k_earth_clouds.jpg`,
  moon: `${BASE}/Moon/2k_moon.jpg`,
  mars: `${BASE}/Mars/2k_mars.jpg`,
  jupiter: `${BASE}/Jupiter/2k_jupiter.jpg`,
  saturn: `${BASE}/Saturn/2k_saturn.jpg`,
  uranus: `${BASE}/Uranus/2k_uranus.jpg`,
  neptune: `${BASE}/Neptune/2k_neptune.jpg`,
  saturnRing: `${BASE}/Saturn/2k_saturn_ring_alpha.png`,
};

const loader = new THREE.TextureLoader();
const started = new Set<string>();
const cache = new Map<string, THREE.Texture | null>(); // null = failed
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function load(key: string) {
  const url = REAL_TEX[key];
  if (!url || started.has(key)) return;
  started.add(key);
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      cache.set(key, tex);
      emit();
    },
    undefined,
    () => {
      cache.set(key, null);
      emit();
    }
  );
}

/** Returns the real texture when loaded, null once it failed,
    undefined while still loading. Callers fall back procedurally. */
export function getRealTexture(key: string): THREE.Texture | null | undefined {
  load(key);
  return cache.get(key);
}

/** Re-render when any real texture finishes loading or fails. */
export function onRealTextures(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Remap a RingGeometry's UVs so texture X runs inner→outer radius
    (matches the 2048×125 Saturn ring strip) instead of planar. */
export function remapRingUvs(geo: THREE.RingGeometry): THREE.RingGeometry {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const { innerRadius, outerRadius } = geo.parameters;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - innerRadius) / (outerRadius - innerRadius), 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}
