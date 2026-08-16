import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Loads a real solar-system GLB from /models and scales it to the planet's
 * target radius. The load is wrapped in Suspense + an error boundary so a
 * missing or corrupt file silently falls back to the procedural planet
 * instead of crashing the scene.
 */

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function useNormalizedScene(src: string, targetRadius: number): THREE.Object3D {
  const { scene } = useGLTF(src);
  return useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    // diameter of the target planet = 2 * radius; scale the model to fit
    const s = maxDim > 0 ? (targetRadius * 2) / maxDim : 1;
    clone.scale.setScalar(s);
    // shift so the model's center lands at the planet origin
    clone.position.copy(center).multiplyScalar(-s);
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene, targetRadius]);
}

function ModelBody({ src, targetRadius }: { src: string; targetRadius: number }) {
  const obj = useNormalizedScene(src, targetRadius);
  return <primitive object={obj} />;
}

export function ModelPlanet({
  src,
  targetRadius,
  fallback,
}: {
  src: string;
  targetRadius: number;
  fallback: ReactNode;
}) {
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <ModelBody src={src} targetRadius={targetRadius} />
      </Suspense>
    </ModelBoundary>
  );
}
