import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { QualityTier } from "../lib/device";

interface Props {
  size: number;
  hovered: boolean;
  quality: QualityTier;
  reduced: boolean;
}

/* ── Rain particle ring — thin veil of falling dots around the planet ── */
function RainParticles({ size, quality, reduced }: { size: number; quality: QualityTier; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = reduced ? 0 : quality === "low" ? 40 : quality === "medium" ? 80 : 140;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const r = size * 1.6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * size * 2.4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      vel[i] = 0.3 + Math.random() * 0.6;
    }
    return [pos, vel];
  }, [count, size]);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const r = size * 1.6;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= velocities[i] * delta * 2.8;
      if (arr[i * 3 + 1] < -size * 1.2) {
        arr[i * 3 + 1] = size * 1.2;
        const angle = Math.random() * Math.PI * 2;
        arr[i * 3] = Math.cos(angle) * r;
        arr[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#7b8cff"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Cloud-like atmosphere shell — two semi-transparent layers ── */
function CloudLayers({ size, hovered }: { size: number; hovered: boolean }) {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref1.current) ref1.current.rotation.y += delta * (hovered ? 0.06 : 0.025);
    if (ref2.current) ref2.current.rotation.y -= delta * (hovered ? 0.04 : 0.018);
  });

  return (
    <>
      {/* Layer 1: outer cloud veil */}
      <mesh ref={ref1} scale={size * 1.12}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshBasicMaterial
          color="#3a4a8a"
          transparent
          opacity={hovered ? 0.14 : 0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Layer 2: inner mist */}
      <mesh ref={ref2} scale={size * 1.06}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#5566cc"
          transparent
          opacity={hovered ? 0.08 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

/* ── Lightning flash — a brief pulse on a screen-space sprite ── */
function LightningFlash({ size, hovered, quality, reduced }: Props) {
  const ref = useRef<THREE.Mesh>(null);
  const timer = useRef(Math.random() * 6);
  const flash = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current || reduced || quality === "low") {
      if (ref.current) ref.current.visible = false;
      return;
    }
    timer.current -= delta;
    if (timer.current <= 0) {
      /* trigger a flash — shorter intervals when hovered */
      flash.current = hovered ? 0.7 : 0.45;
      timer.current = hovered ? 2.5 + Math.random() * 3 : 5 + Math.random() * 8;
    }
    if (flash.current > 0) {
      flash.current = Math.max(0, flash.current - delta * 3.5);
      ref.current.visible = true;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = flash.current * 0.18;
    } else {
      ref.current.visible = false;
    }
  });

  return (
    <mesh ref={ref} scale={size * 2.2} visible={false}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial
        color="#c0d0ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ── Audio wave orbital rings — subtle pulsing arcs ── */
function AudioWaveRings({ size, hovered }: { size: number; hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat1 = useRef<THREE.MeshBasicMaterial>(null);
  const mat2 = useRef<THREE.MeshBasicMaterial>(null);
  const phase = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) return;
    phase.current += delta * (hovered ? 1.8 : 0.9);
    group.current.rotation.y += delta * 0.15;
    group.current.rotation.z = Math.sin(phase.current * 0.4) * 0.08;

    /* pulsing opacity simulating waveform amplitude */
    const p1 = 0.06 + Math.sin(phase.current * 2.1) * 0.04 + (hovered ? 0.04 : 0);
    const p2 = 0.04 + Math.sin(phase.current * 1.7 + 1.2) * 0.03 + (hovered ? 0.03 : 0);
    if (mat1.current) mat1.current.opacity = p1;
    if (mat2.current) mat2.current.opacity = p2;
  });

  return (
    <group ref={group} rotation={[0.4, 0, 0.2]}>
      {/* Inner wave ring */}
      <mesh>
        <torusGeometry args={[size * 1.55, 0.012, 8, 64]} />
        <meshBasicMaterial
          ref={mat1}
          color="#6b7cff"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer wave ring — offset tilt */}
      <mesh rotation={[0.3, 0, 0.15]}>
        <torusGeometry args={[size * 1.85, 0.008, 8, 64]} />
        <meshBasicMaterial
          ref={mat2}
          color="#9b6fff"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── Floating ambient particles — tiny drifting light motes ── */
function FloatingLights({ size, quality, reduced }: { size: number; quality: QualityTier; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = reduced ? 0 : quality === "low" ? 15 : quality === "medium" ? 30 : 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = size * (1.3 + Math.random() * 1.2);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, size]);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.05;
  });

  if (count === 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#8899dd"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Main NightLight effects composition ── */
export function NightLightEffects({ size, hovered, quality, reduced }: Props) {
  return (
    <group>
      <CloudLayers size={size} hovered={hovered} />
      <RainParticles size={size} quality={quality} reduced={reduced} />
      <LightningFlash size={size} hovered={hovered} quality={quality} reduced={reduced} />
      <AudioWaveRings size={size} hovered={hovered} />
      <FloatingLights size={size} quality={quality} reduced={reduced} />
    </group>
  );
}
