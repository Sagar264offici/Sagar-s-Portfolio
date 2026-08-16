import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture, createSunTexture } from "./textures";
import { getRealTexture, onRealTextures } from "./realTextures";
import { LensFlare } from "./LensFlare";
import { usePortfolioStore } from "../store/portfolioStore";

export function CareerSun() {
  const proceduralSun = useMemo(() => createSunTexture(), []);
  const [, setTexTick] = useState(0);
  useEffect(() => onRealTextures(() => setTexTick((t) => t + 1)), []);
  /* the real 2K solar map once it loads — sunspots included, procedural until then */
  const sunTex = getRealTexture("sun") ?? proceduralSun;
  const glowTex = useMemo(() => createGlowTexture("rgba(255, 190, 110, 0.9)", "rgba(255, 120, 40, 0)"), []);
  const core = useRef<THREE.Mesh>(null);
  const quality = usePortfolioStore((s) => s.quality);
  const secret = usePortfolioStore((s) => s.secretMode);

  useFrame((state, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.04;
      core.current.rotation.z += delta * 0.01;
    }
  });

  const detail = quality === "low" ? 32 : 64;

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[2.1, detail, detail]} />
        <meshBasicMaterial map={sunTex} color={secret ? "#ffe9d0" : "#ffffff"} />
      </mesh>
      {/* tight corona — a whisper of glow at the limb, nothing more */}
      <mesh scale={1.6}>
        <sphereGeometry args={[2.1, 24, 24]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </mesh>

      {/* lens flare — the glamour comes from this now */}
      <LensFlare position={[0, 0, 0]} />

      {/* the light that lights the solar system — warm but faint, space stays black */}
      <pointLight intensity={secret ? 36 : 24} distance={100} decay={2.4} color="#ffcf96" />
      <pointLight intensity={4} distance={30} decay={2.2} color="#7fb2ff" position={[4, 3, 4]} />
    </group>
  );
}
