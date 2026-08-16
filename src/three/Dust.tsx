import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
}

export function Dust({ count }: Props) {
  const ref = useRef<THREE.Points>(null);
  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.02 + Math.random() * 0.05;
    return arr;
  }, [count]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 26;
      const y = (Math.random() - 0.5) * 16;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 6;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.06} color="#9fd8ff" transparent opacity={0.4} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}
