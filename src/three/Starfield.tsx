import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createStarTexture } from "./textures";

interface Props {
  count: number;
}

function makeGeometry(count: number, minR: number, maxR: number, warm = false): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const s = Math.sqrt(1 - u * u);
    positions[i * 3] = r * s * Math.cos(theta);
    positions[i * 3 + 1] = r * u;
    positions[i * 3 + 2] = r * s * Math.sin(theta);
    const pick = Math.random();
    if (pick > 0.94) c.set("#c9b8ff");
    else if (pick > 0.82) c.set("#ffe9c9");
    else if (warm && pick > 0.72) c.set("#bfe0ff");
    else c.set("#ffffff");
    const dim = 0.45 + Math.random() * 0.55;
    colors[i * 3] = c.r * dim;
    colors[i * 3 + 1] = c.g * dim;
    colors[i * 3 + 2] = c.b * dim;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

export function Starfield({ count }: Props) {
  const farRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const nearRef = useRef<THREE.Points>(null);
  const dotTex = useMemo(() => createStarTexture(), []);

  const farGeo = useMemo(() => makeGeometry(count, 120, 190), [count]);
  const midGeo = useMemo(() => makeGeometry(Math.max(120, Math.floor(count / 2)), 85, 160, true), [count]);
  const nearGeo = useMemo(() => makeGeometry(Math.max(60, Math.floor(count / 3)), 60, 105), [count]);

  useFrame((_, delta) => {
    if (farRef.current) {
      farRef.current.rotation.y += delta * 0.003;
      farRef.current.rotation.x += delta * 0.0008;
    }
    if (midRef.current) {
      midRef.current.rotation.y += delta * 0.005;
      midRef.current.rotation.x -= delta * 0.0012;
    }
    if (nearRef.current) {
      nearRef.current.rotation.y -= delta * 0.008;
    }
  });

  const material = (size: number, opacity: number) => ({
    map: dotTex,
    size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return (
    <group>
      <points ref={farRef} geometry={farGeo} frustumCulled={false}>
        <pointsMaterial {...material(1.2, 0.5)} />
      </points>
      <points ref={midRef} geometry={midGeo} frustumCulled={false}>
        <pointsMaterial {...material(1.8, 0.58)} />
      </points>
      {/* near layer: sparse bigger stars that drift faster for parallax depth */}
      <points ref={nearRef} geometry={nearGeo} frustumCulled={false}>
        <pointsMaterial {...material(3.2, 0.5)} />
      </points>
    </group>
  );
}
