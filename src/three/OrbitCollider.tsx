import { useFrame } from "@react-three/fiber";
import { getOrbitStates } from "./planetRegistry";

const TAU = Math.PI * 2;

/* ── "Mesh collider" for the solar system ─────────────────
   Planets on the same orbit drift at different speeds and can
   catch up to each other. Every frame we sort each ring's bodies
   by angle and softly push any pair closer than their combined
   surface size apart — a cheap angular repulsion that keeps the
   system believable without ever letting two worlds overlap. */
export function OrbitCollider() {
  useFrame(() => {
    const states = getOrbitStates();
    const byRing = new Map<number, typeof states>();
    for (const s of states) {
      const list = byRing.get(s.ring);
      if (list) list.push(s);
      else byRing.set(s.ring, [s]);
    }

    for (const list of byRing.values()) {
      if (list.length < 2) continue;
      let maxSize = 0;
      for (const s of list) maxSize = Math.max(maxSize, s.size);
      const ring = list[0].ring;
      // angular gap that guarantees surface clearance (size + a margin)
      const minSep = ((maxSize * 2 + 0.9) / ring) * 1.15;
      list.sort((a, b) => a.angle - b.angle);
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        const b = list[(i + 1) % list.length];
        let d = b.angle - a.angle;
        if (i === list.length - 1) d += TAU; // wrap the ring
        if (d < minSep) {
          const push = (minSep - d) * 0.5 * 0.4;
          a.angle -= push;
          b.angle += push;
        }
      }
    }
  });
  return null;
}
