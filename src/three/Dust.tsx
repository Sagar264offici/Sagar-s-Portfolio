import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
  reduced?: boolean;
}

export function Dust({ count, reduced = false }: Props) {
  const ref = useRef<THREE.Points>(null);
  // Throttle GPU buffer uploads — update every 3rd frame for perf
  const frameRef = useRef(0);

  const [geometry, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 26;
      const y = (Math.random() - 0.5) * 16;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      spd[i] = 0.02 + Math.random() * 0.05;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return [g, spd] as const;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    frameRef.current++;
    // Only upload to GPU every 3rd frame — saves ~66% of buffer uploads
    const shouldUpdate = frameRef.current % 3 === 0;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const step = shouldUpdate ? 1 : 0.33; // partial movement when not uploading
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 6 * (shouldUpdate ? 1 : 0.5);
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    if (shouldUpdate) pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.06} color="#9fd8ff" transparent opacity={0.4} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}
