import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolioStore } from "../store/portfolioStore";
import { getPlanetPosition } from "./planetRegistry";
import { getPointer } from "../hooks/usePointer";
import { isTouchDevice } from "../lib/device";
import { clamp, lerp, smoothstep } from "../lib/utils";

interface Keyframe {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
}

/* A wide, stable vantage — the camera never plunges toward the sun. The
   motion on scroll comes from the system's own slow rotation (scrollSpin in
   Planet.tsx), not from dollying into the star. */
const KEYFRAMES: Keyframe[] = [
  { t: 0.0, pos: [0, 1.9, 20], look: [0, 0.3, 0] },
  { t: 0.1, pos: [3.2, 2.2, 15.2], look: [8, 1.9, -7] },
  { t: 0.2, pos: [2.8, 2.0, 15], look: [8, 1.9, -7] },
  { t: 0.35, pos: [1, 1.9, 17], look: [0, 0.2, 0] },
  { t: 0.55, pos: [2.2, 2.4, 16.6], look: [0, 0.2, 0] },
  { t: 0.75, pos: [0.6, 2.2, 17.6], look: [0, 0.2, 0] },
  { t: 1.0, pos: [0, 2.2, 19], look: [0, 0.2, 0] },
];

const FOCUS_OFFSET = new THREE.Vector3(0, 1.3, 3.2);

function sampleKeyframes(t: number, pos: THREE.Vector3, look: THREE.Vector3): void {
  const p = clamp(t, 0, 1);
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].t) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = Math.max(0.0001, b.t - a.t);
  const local = smoothstep((p - a.t) / span);
  pos.set(lerp(a.pos[0], b.pos[0], local), lerp(a.pos[1], b.pos[1], local), lerp(a.pos[2], b.pos[2], local));
  look.set(lerp(a.look[0], b.look[0], local), lerp(a.look[1], b.look[1], local), lerp(a.look[2], b.look[2], local));
}

// Reusable scratch vectors to avoid per-frame allocations
const _desiredPos = new THREE.Vector3();
const _desiredLook = new THREE.Vector3();
const _rest = new THREE.Vector3(0, 2.2, 18);
const _dir = new THREE.Vector3();
const _basePos = new THREE.Vector3();
const _baseLook = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const pointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPos = useRef(new THREE.Vector3(0, 1.9, 20));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const focusPos = useRef<THREE.Vector3 | null>(null);
  const fov = useRef(55);

  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const focusedBody = usePortfolioStore((s) => s.focusedBody);
  const touch = isTouchDevice();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const progress = usePortfolioStore.getState().scrollProgress;

    // Mouse parallax (disabled in reduced motion, damped on touch so scrolls stay calm).
    const p = getPointer();
    const touchFactor = touch ? 0.2 : 1;
    pointer.current.x = reduced ? 0 : p.x * touchFactor;
    pointer.current.y = reduced ? 0 : p.y * touchFactor;

    sampleKeyframes(progress, _basePos, _baseLook);

    // Focus mode: fly toward a planet.
    const bodyPos = focusedBody ? getPlanetPosition(focusedBody) : undefined;
    if (focusedBody && bodyPos) {
      focusPos.current = bodyPos;
      _dir.copy(bodyPos).normalize();
      _desiredPos.copy(bodyPos).add(_dir.multiplyScalar(2.4));
      _desiredPos.y += 1.2;
      _desiredPos.z += 0.4;
      _desiredLook.copy(bodyPos);
    } else if (touch) {
      focusPos.current = null;
      _desiredPos.copy(_rest).lerp(_basePos, 0.45);
      _desiredPos.x += pointer.current.x * 0.25;
      _desiredPos.y += -pointer.current.y * 0.15;
      _desiredLook.set(_baseLook.x * 0.35, _baseLook.y * 0.3, _baseLook.z);
    } else {
      focusPos.current = null;
      _desiredPos.copy(_basePos);
      _desiredLook.copy(_baseLook);
      _desiredPos.x += pointer.current.x * 0.9;
      _desiredPos.y += -pointer.current.y * 0.6;
      _desiredLook.x += pointer.current.x * 0.35;
      _desiredLook.y += -pointer.current.y * 0.2;
    }

    // Slower lerp on touch so the background glides instead of snapping after the finger.
    const lambda = focusedBody ? 2.6 : touch ? 1.1 : 1.6;
    const lerpFactor = 1 - Math.exp(-lambda * dt);
    currentPos.current.lerp(_desiredPos, lerpFactor);
    currentLook.current.lerp(_desiredLook, lerpFactor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);

    // Subtle cinematic FOV: tighten on focus, widen slightly with scroll.
    const targetFov = focusedBody ? 42 : 55 + Math.sin(progress * Math.PI) * 3;
    fov.current = THREE.MathUtils.damp(fov.current, targetFov, 2, dt);
    if (Math.abs((camera as THREE.PerspectiveCamera).fov - fov.current) > 0.01) {
      (camera as THREE.PerspectiveCamera).fov = fov.current;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });

  return null;
}
