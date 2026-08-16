import { useMemo } from "react";
import * as THREE from "three";
import { orbitKinds } from "./bodyData";

export function OrbitRings() {
  const rings = useMemo(() => [...orbitKinds].sort((a, b) => a.ring - b.ring), []);

  return (
    <group>
      {rings.map((r) => (
        <mesh key={r.ring} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r.ring - 0.02, r.ring + 0.02, 160]} />
          <meshBasicMaterial
            color={r.color}
            transparent
            opacity={r.kind === "project" ? 0.4 : r.kind === "moon" ? 0.22 : 0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
