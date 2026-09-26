import { useFrame } from "@react-three/fiber";
import { getOrbitStates } from "./planetRegistry";

const TAU = Math.PI * 2;

/* ── "Mesh collider" for the solar system ─────────────────
   Planets on the same orbit drift at different speeds and can
   catch up to each other. Every frame we sort each ring's bodies
   by angle and softly push any pair closer than their combined
   surface size apart — a cheap angular repulsion that keeps the
   system believable without ever letting two worlds overlap. */

// scratch map reused across frames — no per-frame allocation.
// Throttled: repulsion converges fine at 20Hz, full rate is wasted work.
const _byRing = new Map<number, ReturnType<typeof getOrbitStates>>();
let _tick = 0;

export function OrbitCollider() {
  useFrame(() => {
    _tick++;
    if (_tick % 3 !== 0) return;
    const states = getOrbitStates();
    _byRing.clear();
    for (const s of states) {
      const list = _byRing.get(s.ring);
      if (list) list.push(s);
      else _byRing.set(s.ring, [s]);
    }

    for (const list of _byRing.values()) {
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
