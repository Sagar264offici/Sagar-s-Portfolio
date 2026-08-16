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
      {/* the sun is a crisp disc — no aura, no corona */}
      <mesh ref={core}>
        <sphereGeometry args={[2.1, detail, detail]} />
        <meshBasicMaterial map={sunTex} color={secret ? "#ffe9d0" : "#ffffff"} />
      </mesh>

      {/* subtle lens flare only — the glamour, without the glow blob */}
      <LensFlare position={[0, 0, 0]} />

      {/* the light that lights the solar system — dim and neutral so space stays black */}
      <pointLight intensity={secret ? 18 : 11} distance={90} decay={2.6} color="#ffdfb0" />
      <pointLight intensity={3} distance={30} decay={2.2} color="#7fb2ff" position={[4, 3, 4]} />
    </group>
  );
}
