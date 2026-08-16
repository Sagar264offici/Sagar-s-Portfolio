import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture, createStreakTexture, hexToRgba } from "./textures";
import { usePortfolioStore } from "../store/portfolioStore";

/* Ghost orbs travel along the axis from the sun to the screen center —
   the classic lens-flare signature. Fraction = how far along that axis. */
const GHOSTS = [
  { frac: 0.24, size: 0.3, opacity: 0.26, color: "#9fd8ff" },
  { frac: 0.4, size: 0.17, opacity: 0.14, color: "#d8c8ff" },
  { frac: 0.56, size: 0.1, opacity: 0.12, color: "#9fd8ff" },
  { frac: 0.72, size: 0.06, opacity: 0.08, color: "#bfe8ff" },
];

export function LensFlare({ position = [0, 0, 0] as [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const ghosts = useRef<(THREE.Sprite | null)[]>([]);
  const quality = usePortfolioStore((s) => s.quality);
  const reduced = usePortfolioStore((s) => s.reducedMotion);

  const coreTex = useMemo(() => createGlowTexture("rgba(255, 252, 246, 0.9)", "rgba(255, 240, 220, 0)"), []);
  const streakTex = useMemo(() => createStreakTexture(), []);
  const ghostTexs = useMemo(() => GHOSTS.map((g) => createGlowTexture(hexToRgba(g.color, 0.85), hexToRgba(g.color, 0))), []);

  const sunWorld = useMemo(() => new THREE.Vector3(...position), [position]);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const camera = state.camera;

    // project the sun to screen space
    proj.copy(sunWorld).project(camera);

    // hidden when the sun is behind the camera
    const behind = proj.z > 1;
    const distFromCenter = Math.hypot(proj.x, proj.y);
    const strength = Math.max(0, 1 - distFromCenter * 1.7);
    const lowTier = quality === "low";
    const visible = !behind && strength > 0.02 && !reduced;
    g.visible = visible;
    if (!visible) return;

    // core glow + anamorphic streak sit on the sun
    const core = g.children[0] as THREE.Sprite;
    const streak = g.children[1] as THREE.Sprite;
    core.material.opacity = 0.14 + strength * 0.12;
    streak.material.opacity = 0.05 + strength * 0.1;
    // streak aligns with the axis toward the screen center
    (streak.material as unknown as { rotation: number }).rotation = Math.atan2(-proj.y, -proj.x);

    // ghosts along the sun → screen-center axis
    for (let i = 0; i < GHOSTS.length; i++) {
      const s = ghosts.current[i];
      if (!s) continue;
      if (lowTier && i > 0) {
        s.visible = false;
        continue;
      }
      const f = GHOSTS[i].frac;
      ndc.set(proj.x + -proj.x * f, proj.y + -proj.y * f, proj.z);
      ndc.unproject(camera);
      s.position.copy(ndc);
      const dist = camera.position.distanceTo(ndc);
      s.scale.setScalar(GHOSTS[i].size * dist * 0.16);
      s.material.opacity = GHOSTS[i].opacity * strength;
      s.visible = strength > 0.06;
    }
  });

  return (
    <group ref={group} position={position} visible={false}>
      {/* tight core — starlight, not a glow blob */}
      <sprite scale={[1.6, 1.6, 1]}>
        <spriteMaterial map={coreTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0.3} />
      </sprite>
      {/* anamorphic streak */}
      <sprite scale={[5.5, 0.55, 1]}>
        <spriteMaterial map={streakTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0.16} />
      </sprite>
      {GHOSTS.map((gh, i) => (
        <sprite
          key={i}
          ref={(el) => {
            ghosts.current[i] = el;
          }}
          scale={[gh.size, gh.size, 1]}
        >
          <spriteMaterial map={ghostTexs[i]} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}
