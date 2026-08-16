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

const KEYFRAMES: Keyframe[] = [
  { t: 0.0, pos: [0, 1.9, 20], look: [0, 0.3, 0] },
  { t: 0.08, pos: [5.5, 2.4, 13], look: [8.4, 1.9, -7.2] },
  { t: 0.16, pos: [4.6, 2.1, 7], look: [8.4, 1.9, -7.2] },
  { t: 0.25, pos: [1.6, 1.7, 12.5], look: [0, 0, 0] },
  { t: 0.37, pos: [-8.5, 2.8, 7.5], look: [0, 0.2, 0] },
  { t: 0.5, pos: [0, 3.6, 12.5], look: [0, 0, 0] },
  { t: 0.63, pos: [7, 2.6, -9.5], look: [0, 0, 0] },
  { t: 0.75, pos: [-7.5, 4.2, 6.5], look: [0, 0, 0] },
  { t: 0.86, pos: [4.2, 2.2, -12.5], look: [0, 0, 0] },
  { t: 0.95, pos: [0, 2.6, 16.5], look: [0, 0, 0] },
  { t: 1.0, pos: [0, 3.2, 18.5], look: [0, 0, 0] },
];

const FOCUS_OFFSET = new THREE.Vector3(0, 1.3, 3.2);

function sampleKeyframes(t: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  const p = clamp(t, 0, 1);
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].t) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = Math.max(0.0001, b.t - a.t);
  const local = smoothstep((p - a.t) / span);
  return {
    pos: new THREE.Vector3(lerp(a.pos[0], b.pos[0], local), lerp(a.pos[1], b.pos[1], local), lerp(a.pos[2], b.pos[2], local)),
    look: new THREE.Vector3(lerp(a.look[0], b.look[0], local), lerp(a.look[1], b.look[1], local), lerp(a.look[2], b.look[2], local)),
  };
}

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const pointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPos = useRef(new THREE.Vector3(0, 1.9, 20));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const focusPos = useRef<THREE.Vector3 | null>(null);
  const fov = useRef(55);

  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const focusedBody = usePortfolioStore((s) => s.focusedBody);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const progress = usePortfolioStore.getState().scrollProgress;

    // Mouse parallax (disabled in reduced motion, damped on touch so scrolls stay calm).
    const p = getPointer();
    const touchFactor = isTouchDevice() ? 0.2 : 1;
    pointer.current.x = reduced ? 0 : p.x * touchFactor;
    pointer.current.y = reduced ? 0 : p.y * touchFactor;

    let desiredPos: THREE.Vector3;
    let desiredLook: THREE.Vector3;
    const base = sampleKeyframes(progress);

    // Focus mode: fly toward a planet.
    const bodyPos = focusedBody ? getPlanetPosition(focusedBody) : undefined;
    if (focusedBody && bodyPos) {
      focusPos.current = bodyPos.clone();
      const dir = bodyPos.clone().normalize();
      desiredPos = bodyPos.clone().add(dir.multiplyScalar(2.4)).add(new THREE.Vector3(0, 1.2, 0.4));
      desiredLook = bodyPos.clone();
    } else {
      focusPos.current = null;
      desiredPos = base.pos.clone();
      desiredLook = base.look.clone();
      desiredPos.x += pointer.current.x * 0.9;
      desiredPos.y += -pointer.current.y * 0.6;
      desiredLook.x += pointer.current.x * 0.35;
      desiredLook.y += -pointer.current.y * 0.2;
    }

    const lambda = focusedBody ? 2.6 : 1.6;
    currentPos.current.lerp(desiredPos, 1 - Math.exp(-lambda * dt));
    currentLook.current.lerp(desiredLook, 1 - Math.exp(-lambda * dt));

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
