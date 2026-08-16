import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createNebulaTexture } from "./textures";
import { usePortfolioStore } from "../store/portfolioStore";

interface CloudDef {
  pos: [number, number, number];
  scale: number;
  colorA: string;
  colorB: string;
  spin: number;
  opacity: number;
}

const CLOUDS: CloudDef[] = [
  { pos: [58, -10, -96], scale: 95, colorA: "#4c1d95", colorB: "#7c3aed", spin: 0.012, opacity: 0.34 },
  { pos: [-72, 16, -84], scale: 82, colorA: "#0e7490", colorB: "#155e75", spin: -0.009, opacity: 0.28 },
  { pos: [24, 30, -118], scale: 120, colorA: "#86198f", colorB: "#be185d", spin: 0.007, opacity: 0.26 },
  { pos: [-36, -22, -104], scale: 74, colorA: "#1e3a8a", colorB: "#3730a3", spin: 0.01, opacity: 0.3 },
  { pos: [88, 6, -70], scale: 60, colorA: "#134e4a", colorB: "#065f46", spin: -0.006, opacity: 0.22 },
];

export function Nebula() {
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const quality = usePortfolioStore((s) => s.quality);

  const clouds = useMemo(() => {
    // fewer clouds on weaker devices
    const skip = quality === "low" || quality === "medium" ? 2 : 0;
    return CLOUDS.slice(skip);
  }, [quality]);

  const texs = useMemo(() => clouds.map((c, i) => createNebulaTexture(900 + i * 31, c.colorA, c.colorB)), [clouds]);

  useFrame((state, delta) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((sprite, i) => {
      if (sprite && clouds[i]) {
        sprite.material.rotation += clouds[i].spin * delta * 6;
        // slow breathing drift
        sprite.position.x = clouds[i].pos[0] + Math.sin(t * 0.05 + i * 2.1) * 1.6;
        sprite.position.y = clouds[i].pos[1] + Math.cos(t * 0.04 + i * 1.3) * 1.2;
      }
    });
  });

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={c.pos}
          scale={[c.scale, c.scale, 1]}
        >
          <spriteMaterial
            map={texs[i]}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
            rotation={i * 1.7}
          />
        </sprite>
      ))}
    </group>
  );
}
