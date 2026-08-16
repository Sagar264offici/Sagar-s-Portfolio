import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePortfolioStore } from "../store/portfolioStore";
import { clamp, smoothstep } from "../lib/utils";

/* The station takes the avatar's old post: it glides from the hero's
   top-left corner to a station beside the About panel as you scroll. */

const HERO_POS = new THREE.Vector3(-10.2, 4.4, 1.4);
const ABOUT_POS = new THREE.Vector3(9, 2.05, -8);

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* Real GLB — fits the model's height to a fixed size and centers it. */
function StationModel({ src, height }: { src: string; height: number }) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = size.y > 0 ? height / size.y : 1;
    clone.scale.setScalar(s);
    clone.position.copy(center).multiplyScalar(-s);
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene, height]);
  return <primitive object={obj} />;
}

/* Procedural stand-in until the real GLB lands — a stylized station:
   a truss with central modules, solar arrays and a glowing cupola. */
function ProceduralStation() {
  return (
    <group>
      {/* central truss */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
        <meshStandardMaterial color="#8a93a3" roughness={0.4} metalness={0.9} />
      </mesh>
      {/* main core module */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.9, 18]} />
        <meshStandardMaterial color="#c7ccd6" roughness={0.45} metalness={0.75} />
      </mesh>
      {/* front module + cupola */}
      <mesh position={[0, 0, 0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.5, 16]} />
        <meshStandardMaterial color="#dfe3ea" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.82]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={1.6} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* rear module */}
      <mesh position={[0, 0, -0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.27, 0.24, 0.55, 16]} />
        <meshStandardMaterial color="#b6bcc7" roughness={0.45} metalness={0.8} />
      </mesh>
      {/* four solar arrays */}
      {[
        { x: 0.62, z: 0, tilt: -0.08 },
        { x: -0.62, z: 0, tilt: 0.08 },
        { x: 0.62, z: 0.35, tilt: 0.05 },
        { x: -0.62, z: 0.35, tilt: -0.05 },
      ].map((p, i) => (
        <group key={i} position={[0, 0, p.z]} rotation={[0, p.tilt, 0]}>
          <mesh position={[p.x * 1.25, 0, 0]}>
            <boxGeometry args={[0.04, 0.72, 0.82]} />
            <meshStandardMaterial color="#16202e" roughness={0.35} metalness={0.4} emissive="#0b3a5c" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[p.x * 1.25, 0, 0.46]}>
            <boxGeometry args={[0.04, 0.06, 0.08]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
      {/* status beacon */}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={2.4} />
      </mesh>
    </group>
  );
}

export function SpaceStation() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const reduced = usePortfolioStore((s) => s.reducedMotion);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = usePortfolioStore.getState().scrollProgress;
    const t = smoothstep(clamp(p / 0.12, 0, 1));
    const target = new THREE.Vector3().lerpVectors(HERO_POS, ABOUT_POS, t);
    // gentle float
    target.y += Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    g.position.lerp(target, 1 - Math.exp(-3.5 * delta));

    // the station slowly tumbles in place
    if (spin.current && !reduced) {
      spin.current.rotation.y += delta * 0.14;
      spin.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group ref={group} scale={1.5}>
      <group ref={spin}>
        <ModelBoundary fallback={<ProceduralStation />}>
          <Suspense fallback={<ProceduralStation />}>
            <StationModel src="/models/spacestation.glb" height={2.4} />
          </Suspense>
        </ModelBoundary>
      </group>
    </group>
  );
}
