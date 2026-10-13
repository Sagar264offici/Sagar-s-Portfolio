import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CareerSun } from "./CareerSun";
import { OrbitRings } from "./OrbitRings";
import { Planet } from "./Planet";
import { Starfield } from "./Starfield";
import { Dust } from "./Dust";
import { SpaceStation } from "./SpaceStation";
import { CameraRig } from "./CameraRig";
import { BlackHole } from "./BlackHole";
import { Nebula } from "./Nebula";
import { OrbitCollider } from "./OrbitCollider";
import { bodyDefs } from "./bodyData";
import { usePortfolioStore } from "../store/portfolioStore";
import { qualitySettings } from "../lib/device";
import { clamp, smoothstep } from "../lib/utils";
import { registerTooltipCamera } from "../components/PlanetTooltip";
import { loadRealTexture, REAL_TEX } from "./realTextures";

function CameraProbe() {
  const camera = useThree((s) => s.camera);
  registerTooltipCamera(camera as THREE.Camera);
  return null;
}

export function UniverseScene() {
  const quality = usePortfolioStore((s) => s.quality);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const settings = qualitySettings(quality, reduced);

  useEffect(() => {
    // Keep the first paint lean: load the sun first, then progressively fill
    // in high-resolution planet maps after the page is already interactive.
    loadRealTexture("sun");
    const rest = Object.keys(REAL_TEX).filter((key) => key !== "sun");
    let index = 0;
    let cancelled = false;
    const schedule = () => {
      if (cancelled || index >= rest.length) return;
      loadRealTexture(rest[index++]);
      const idleWindow = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      };
      if (idleWindow.requestIdleCallback) {
        idleWindow.requestIdleCallback(schedule, { timeout: 1200 });
      } else {
        window.setTimeout(schedule, 350);
      }
    };
    schedule();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* near-black space — the sun is the only real light source */}
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#1c1530", "#020208", 0.15]} />
      <directionalLight position={[6, 9, 5]} intensity={0.6} color="#fff2e2" />
      <directionalLight position={[-7, 4, -6]} intensity={0.28} color="#7c5cff" />

      <Nebula />
      <Starfield count={settings.starCount} />
      <Dust count={settings.dustCount} reduced={reduced} />
      <CareerSun />
      <OrbitRings />
      {bodyDefs.map((def) => (
        <Planet key={def.key} def={def} />
      ))}

      <BlackHole position={[-48, 9, -54]} />

      {/* keep every world out of its neighbors — a mesh collider for the solar system */}
      <OrbitCollider />

      {/* the station — glides from the hero corner to a berth beside About */}
      <SpaceStation />

      <CameraRig />
      <CameraProbe />
    </>
  );
}
