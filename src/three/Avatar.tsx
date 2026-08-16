import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPointer } from "../hooks/usePointer";
import { usePortfolioStore } from "../store/portfolioStore";
import { clamp } from "../lib/utils";

const SKIN = "#d9a37f";
const SKIN_DARK = "#b9835f";
// Dark, wavy, center-parted — cropped shorter than the reference portrait.
// (The reference photo is used for likeness only and is never shipped.)
const HAIR = "#2a2426";
const OUTFIT = "#22252d";
const OUTFIT_DARK = "#191c22";
const GLASS = "#0b0c10";

interface EyeRefs {
  left: THREE.Group;
  right: THREE.Group;
}

export function Avatar() {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const strip = useRef<THREE.MeshStandardMaterial>(null);
  const eyes = useRef<EyeRefs | null>(null);
  const blinkTimer = useRef(2 + Math.random() * 3);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const secret = usePortfolioStore((s) => s.secretMode);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (root.current) {
      // gentle float
      root.current.position.y = Math.sin(t * 0.8) * 0.05;
    }
    if (torso.current) {
      // breathing
      const s = 1 + Math.sin(t * 1.4) * 0.012;
      torso.current.scale.set(1, s, 1);
    }
    if (head.current) {
      // head follows the pointer across the screen, with a little idle sway
      const p = getPointer();
      const idleY = Math.sin(t * 0.6) * 0.06;
      const idleX = Math.sin(t * 0.45) * 0.02;
      const targetYaw = reduced ? idleY : clamp(p.x * 0.55, -0.62, 0.62) + idleY;
      const targetPitch = reduced ? idleX : clamp(-p.y * 0.3, -0.34, 0.32) + idleX;
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, targetYaw, 4.5, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetPitch, 4.5, delta);
    }
    if (strip.current) {
      strip.current.emissiveIntensity = secret ? 2.2 : 1.1 + Math.sin(t * 2.4) * 0.5;
    }
    // blink
    blinkTimer.current -= delta;
    let blink = 1;
    if (blinkTimer.current < 0) {
      blink = Math.max(0, blinkTimer.current / 0.12);
      if (blinkTimer.current < -0.12) blinkTimer.current = 2 + Math.random() * 3.5;
    }
    if (eyes.current) {
      const s = Math.max(0.02, blink);
      eyes.current.left.scale.y = s;
      eyes.current.right.scale.y = s;
      // pupil drift toward pointer
      const p = getPointer();
      const dx = reduced ? 0 : p.x * 0.028;
      const dy = reduced ? 0 : p.y * 0.02;
      eyes.current.left.position.x = THREE.MathUtils.damp(eyes.current.left.position.x, -0.17 + dx, 4, delta);
      eyes.current.left.position.y = THREE.MathUtils.damp(eyes.current.left.position.y, 0.06 + dy, 4, delta);
      eyes.current.right.position.x = THREE.MathUtils.damp(eyes.current.right.position.x, 0.17 + dx, 4, delta);
      eyes.current.right.position.y = THREE.MathUtils.damp(eyes.current.right.position.y, 0.06 + dy, 4, delta);
    }
  });

  const eye = (x: number) => (
    <group ref={(g) => {
      if (!g) return;
      if (!eyes.current) eyes.current = { left: null!, right: null! };
      if (x < 0) eyes.current.left = g;
      else eyes.current.right = g;
    }} position={[x, 0.06, 0.44]}>
      {/* sclera */}
      <mesh>
        <sphereGeometry args={[0.088, 20, 20]} />
        <meshStandardMaterial color="#f4f6fb" roughness={0.35} />
      </mesh>
      {/* iris + pupil */}
      <mesh position={[0, 0, 0.055]}>
        <sphereGeometry args={[0.052, 16, 16]} />
        <meshStandardMaterial color="#4a3728" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.088]}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.2} />
      </mesh>
      {/* glint */}
      <mesh position={[0.016, 0.024, 0.098]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );

  return (
    <group ref={root}>
      {/* ── Torso / outfit ── */}
      <group ref={torso}>
        <mesh position={[0, -1.28, 0]}>
          <capsuleGeometry args={[0.42, 1.0, 6, 18]} />
          <meshStandardMaterial color={OUTFIT} roughness={0.65} metalness={0.35} />
        </mesh>
        {/* shoulders */}
        <mesh position={[-0.52, -1.02, 0]}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshStandardMaterial color={OUTFIT_DARK} roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0.52, -1.02, 0]}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshStandardMaterial color={OUTFIT_DARK} roughness={0.7} metalness={0.3} />
        </mesh>
        {/* collar */}
        <mesh position={[0, -0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.33, 0.05, 10, 24]} />
          <meshStandardMaterial color={OUTFIT_DARK} roughness={0.6} metalness={0.4} />
        </mesh>
        {/* chest UI strip */}
        <mesh position={[0, -1.24, 0.37]}>
          <boxGeometry args={[0.5, 0.06, 0.04]} />
          <meshStandardMaterial ref={strip} color="#0e7490" emissive="#22d3ee" emissiveIntensity={1.2} />
        </mesh>
        {/* small glyphs */}
        <mesh position={[-0.14, -1.5, 0.38]}>
          <boxGeometry args={[0.06, 0.06, 0.03]} />
          <meshStandardMaterial color="#3b0764" emissive="#a78bfa" emissiveIntensity={1.6} />
        </mesh>
        <mesh position={[0.16, -1.02, 0.38]}>
          <boxGeometry args={[0.05, 0.05, 0.03]} />
          <meshStandardMaterial color="#3b0764" emissive="#e879f9" emissiveIntensity={1.4} />
        </mesh>
      </group>

      {/* ── Neck ── */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.24, 16]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.8} />
      </mesh>

      {/* ── Head ── */}
      <group ref={head}>
        <mesh>
          <sphereGeometry args={[0.52, 40, 40]} />
          <meshStandardMaterial color={SKIN} roughness={0.72} />
        </mesh>
        {/* ears */}
        <mesh position={[-0.5, -0.02, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
        <mesh position={[0.5, -0.02, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
        {/* nose */}
        <mesh position={[0, -0.13, 0.47]}>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.8} />
        </mesh>
        {/* mouth */}
        <mesh position={[0, -0.3, 0.45]}>
          <boxGeometry args={[0.17, 0.028, 0.02]} />
          <meshStandardMaterial color="#7a4a3a" roughness={0.9} />
        </mesh>
        {/* brows */}
        <mesh position={[-0.17, 0.26, 0.44]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.15, 0.032, 0.02]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        <mesh position={[0.17, 0.26, 0.44]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.15, 0.032, 0.02]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>

        {/* eyes */}
        {eye(-0.17)}
        {eye(0.17)}

        {/* glasses — black frame, round */}
        {[-0.17, 0.17].map((x) => (
          <group key={x} position={[x, 0.03, 0.5]}>
            <mesh>
              <torusGeometry args={[0.145, 0.022, 10, 32]} />
              <meshStandardMaterial color={GLASS} roughness={0.25} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <circleGeometry args={[0.125, 28]} />
              <meshStandardMaterial color="#bfe9ff" transparent opacity={0.1} roughness={0.05} metalness={0.1} />
            </mesh>
          </group>
        ))}
        {/* bridge */}
        <mesh position={[0, 0.03, 0.5]}>
          <boxGeometry args={[0.11, 0.022, 0.02]} />
          <meshStandardMaterial color={GLASS} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* arms to ears */}
        <mesh position={[-0.29, 0.03, 0.34]}>
          <boxGeometry args={[0.018, 0.02, 0.3]} />
          <meshStandardMaterial color={GLASS} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0.29, 0.03, 0.34]}>
          <boxGeometry args={[0.018, 0.02, 0.3]} />
          <meshStandardMaterial color={GLASS} roughness={0.3} metalness={0.5} />
        </mesh>

        {/* hair — wavy short crop with a center part */}
        {/* back cap: covers crown and sides down to the ears */}
        <mesh position={[0, 0.15, -0.1]} scale={[1.02, 0.98, 0.96]}>
          <sphereGeometry args={[0.56, 32, 32]} />
          <meshStandardMaterial color={HAIR} roughness={0.85} />
        </mesh>
        {/* top / forehead dome: hairline sits above the brows */}
        <mesh position={[0, 0.42, 0.02]} scale={[1.05, 0.62, 0.9]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={HAIR} roughness={0.85} />
        </mesh>
        {/* center part — two curtain bumps at the hairline with a skin gap between them */}
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.33, 0.42]} scale={[0.9, 0.9, 0.9]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
        ))}
        {/* wavy fringe along the hairline (on the face plane so it reads) */}
        {[
          { x: -0.3, y: 0.3, z: 0.42, s: 0.09 },
          { x: 0.3, y: 0.3, z: 0.42, s: 0.09 },
          { x: -0.42, y: 0.24, z: 0.4, s: 0.08 },
          { x: 0.42, y: 0.24, z: 0.4, s: 0.08 },
          { x: -0.18, y: 0.35, z: 0.44, s: 0.07 },
          { x: 0.18, y: 0.35, z: 0.44, s: 0.07 },
        ].map((b) => (
          <mesh key={`${b.x}-${b.y}`} position={[b.x, b.y, b.z]} scale={[1, 0.9, 1]}>
            <sphereGeometry args={[b.s, 14, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
        ))}
        {/* slightly longer sides above the ears */}
        {[-0.49, 0.49].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.02]} scale={[0.7, 1.05, 0.85]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
