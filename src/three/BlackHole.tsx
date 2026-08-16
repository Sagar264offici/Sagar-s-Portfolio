import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture } from "./textures";

export function BlackHole({ position = [-40, 7, -44] as [number, number, number] }) {
  const disk = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const diskTex = useMemo(() => createGlowTexture("rgba(255, 214, 170, 0.9)", "rgba(160, 120, 90, 0)"), []);
  const glowTex = useMemo(() => createGlowTexture("rgba(180, 150, 220, 0.2)", "rgba(60, 40, 90, 0)"), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (disk.current) {
      disk.current.rotation.z += delta * 0.12;
      disk.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.1) * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.z -= delta * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#000000" fog={false} />
      </mesh>
      {/* accretion disk */}
      <mesh ref={disk} rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[3.4, 7.2, 80]} />
        <meshBasicMaterial map={diskTex} transparent side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
      {/* hot inner ring */}
      <mesh ref={inner} rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[3.2, 3.6, 64]} />
        <meshBasicMaterial color="#ffe9d2" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
      {/* faint gravitational glow — quiet so it reads as distant detail */}
      <mesh scale={8}>
        <sphereGeometry args={[1.7, 20, 20]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} opacity={0.4} />
      </mesh>
    </group>
  );
}
