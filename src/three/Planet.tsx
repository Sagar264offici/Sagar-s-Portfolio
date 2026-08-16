import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import type { BodyDef } from "./bodyData";
import { registerPlanetPosition, unregisterPlanetPosition, registerOrbit, unregisterOrbit, getOrbitState } from "./planetRegistry";
import { createGlowTexture, createPlanetTexture, createRingTexture, createTrailTexture, hexToRgba, type PlanetStyle } from "./textures";
import { getRealTexture, onRealTextures, remapRingUvs } from "./realTextures";
import { ModelPlanet } from "./PlanetModel";
import { usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";
import { projectIcons } from "../components/icons";
import { TechLogoMark } from "../components/techLogos";

const TAU = Math.PI * 2;

/* Real solar-system looks, keyed by body. Project worlds each get a
   distinct planet identity; other bodies are picked from a real palette. */
const PROJECT_STYLES: Record<string, PlanetStyle> = {
  "project:spdc-quiz-battle": "jupiter",
  "project:rishikesh-greens-cafe": "earth",
  "project:daitya-legion": "mars",
  "project:dentist-clinic-prototype": "uranus",
  "project:cricket-field-simulation": "saturn",
};

const REAL_PALETTE: PlanetStyle[] = ["mercury", "venus", "mars", "uranus", "neptune", "pluto", "rocky", "icy"];

/* every style maps to a real pack texture — no planet looks procedural anymore.
   pluto/rocky/icy fall back to the closest real surface (grey-brown, cratered
   or frosty blue) instead of the generated fbm look. */
const REAL_KEY: Record<PlanetStyle, string> = {
  mercury: "mercury",
  venus: "venus",
  earth: "earth",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturn",
  uranus: "uranus",
  neptune: "neptune",
  pluto: "moon",
  moon: "moon",
  rocky: "mercury",
  icy: "neptune",
};

function hashIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

function styleFor(def: BodyDef): PlanetStyle {
  if (def.projectId) return PROJECT_STYLES[def.key] ?? "jupiter";
  switch (def.kind) {
    case "built":
      return REAL_PALETTE[hashIndex(def.key) % REAL_PALETTE.length];
    case "foundation":
      return def.dwarf ? "moon" : "rocky";
    case "exploring":
      return hashIndex(def.key) % 2 === 0 ? "pluto" : "icy";
    case "moon":
      return "moon";
    default:
      return "rocky";
  }
}

interface Props {
  def: BodyDef;
}

export function Planet({ def }: Props) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const scale = useRef(1);

  const setHoveredPlanet = usePortfolioStore((s) => s.setHoveredPlanet);
  const setHoloCard = usePortfolioStore((s) => s.setHoloCard);
  const setFocusedBody = usePortfolioStore((s) => s.setFocusedBody);
  const setAstronomyOpen = usePortfolioStore((s) => s.setAstronomyOpen);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const hovered = usePortfolioStore((s) => s.hoveredPlanet === def.key);
  const quality = usePortfolioStore((s) => s.quality);
  const trailsEnabled = quality === "ultra";

  const glowTex = useMemo(() => createGlowTexture(hexToRgba(def.color, 0.75), hexToRgba(def.color, 0)), [def.color]);
  const trailTex = useMemo(() => createTrailTexture(def.color), [def.color]);
  const style = useMemo(() => styleFor(def), [def]);
  const proceduralTex = useMemo(
    () => createPlanetTexture(style, def.seed, style === "rocky" || style === "icy" ? def.color : undefined),
    [style, def.seed, def.color]
  );
  const ringTex = useMemo(() => createRingTexture(), []);

  /* swap to the real 2K map the moment it loads; keep procedural until then */
  const [, setTexTick] = useState(0);
  useEffect(() => onRealTextures(() => setTexTick((t) => t + 1)), []);
  const realTex = getRealTexture(REAL_KEY[style]);
  const surfaceTex = realTex ?? proceduralTex;
  const isEarth = def.key === "project:rishikesh-greens-cafe";
  const realEarth = isEarth ? getRealTexture("earth") : undefined;
  const cloudsTex = isEarth && realEarth ? getRealTexture("earthClouds") : undefined;
  const isSaturn = def.key === "project:cricket-field-simulation";
  const realRingTex = isSaturn ? getRealTexture("saturnRing") : undefined;
  const cloudsRef = useRef<THREE.Mesh>(null);
  /* when the real ring strip is live, remap ring UVs to the radial profile */
  const realRingGeo = useMemo(() => {
    if (!realRingTex) return null;
    const g = new THREE.RingGeometry(def.size * 1.45, def.size * 2.3, 64);
    return remapRingUvs(g);
  }, [realRingTex, def.size]);
  const Icon = def.projectId ? projectIcons[def.projectId] : undefined;

  // every body bobs on its own rhythm so the system never reads as a train
  const bob = useMemo(() => {
    const amp = 0.25 + ((def.seed % 47) / 47) * 0.5; // 0.25..0.75
    const freq = 1.1 + ((def.seed % 31) / 31) * 1.2; // 1.1..2.3
    const phase = ((def.seed % 19) / 19) * TAU;
    return { amp, freq, phase };
  }, [def.seed]);

  useEffect(() => {
    registerOrbit(def.key, { key: def.key, angle: def.angle, ring: def.ring, size: def.size });
    return () => {
      unregisterOrbit(def.key);
      unregisterPlanetPosition(def.key);
    };
  }, [def.key, def.angle, def.ring, def.size]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const orbit = getOrbitState(def.key);
    if (!orbit) return;
    if (!reduced) orbit.angle += def.speed * delta;
    // manual spin: the ROTATE slider rotates the whole system on demand
    const spin = (usePortfolioStore.getState().orbitSpin / 360) * TAU;
    const a = orbit.angle + spin;
    g.position.set(Math.cos(a) * def.ring, Math.sin(a * bob.freq + bob.phase) * bob.amp, Math.sin(a) * def.ring);
    registerPlanetPosition(def.key, g.position);

    if (core.current) {
      core.current.rotation.y += delta * 0.08;
    }

    // real Earth's cloud layer drifts on its own slower rhythm
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.028;
    }

    // damp hover scale
    const targetScale = hovered ? 1.3 : 1;
    scale.current = THREE.MathUtils.damp(scale.current, targetScale, 8, delta);
    g.scale.setScalar(scale.current);
  });

  const segments = def.size > 0.5 ? 48 : 32;
  // the procedural sphere — used directly for skill/dwarf worlds and as the
  // automatic fallback when a real GLB model is missing
  const proceduralBody = (
    <mesh>
      <sphereGeometry args={[def.size, segments, segments]} />
      <meshStandardMaterial map={surfaceTex} emissive={def.color} emissiveIntensity={0.05} roughness={0.85} metalness={0.05} transparent={def.opacity < 1} opacity={def.opacity} />
    </mesh>
  );
  const showName = def.kind !== "project" && (def.kind === "moon" || hovered);
  // label sits higher on skill bodies so it clears the logo badge
  const labelY = def.skillName ? def.size + 1.05 : def.size + 0.5;
  // the badge is sized with the planet — big enough to read, never dominating
  const chipPx = Math.round(Math.min(54, Math.max(36, def.size * 17)));
  const logoPx = Math.round(chipPx * 0.5);

  const handleClick = () => {
    audio.blip("select");
    if (def.kind === "moon") {
      setAstronomyOpen(true);
      return;
    }
    if (def.projectId) {
      setHoloCard({ kind: "project", id: def.projectId });
      setFocusedBody(def.key);
    } else if (def.skillName) {
      setHoloCard({ kind: "skill", id: def.skillName });
      setFocusedBody(def.key);
    }
  };

  return (
    <group ref={group} rotation={[def.tilt, 0, 0]}>
      {/* comet trail (ultra only) */}
      {trailsEnabled && (
        <mesh position={[-def.size * 1.5, 0, 0]}>
          <planeGeometry args={[def.size * 3, def.size * 0.7]} />
          <meshBasicMaterial map={trailTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}

      {/* subtle atmosphere (smaller on dwarfs) */}
      <mesh scale={def.size * (def.dwarf ? 1.7 : 1.95)}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={def.dwarf ? 0.18 : 0.3} toneMapped={false} />
      </mesh>

      {/* planet body — real GLB model from public/models/ when present,
          procedural surface otherwise (missing/corrupt files fall back too) */}
      <group
        ref={core}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPlanet(def.key);
        }}
        onPointerOut={() => setHoveredPlanet(null)}
      >
        {def.model ? (
          <ModelPlanet src={`/models/${def.model}`} targetRadius={def.size} fallback={proceduralBody} />
        ) : (
          proceduralBody
        )}
      </group>

      {/* ring system on project worlds — the real Saturn ring strip when present */}
      {def.kind === "project" && (
        <mesh rotation={[Math.PI / 2 + 0.32, 0, 0.5]}>
          {realRingGeo ? (
            <primitive object={realRingGeo} attach="geometry" />
          ) : (
            <ringGeometry args={[def.size * 1.45, def.size * 2.3, 64]} />
          )}
          <meshBasicMaterial
            map={realRingTex ?? ringTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            opacity={realRingTex ? 1 : 0.95}
          />
        </mesh>
      )}

      {/* Earth's cloud layer — only when the real daymap is live */}
      {cloudsTex && (
        <mesh ref={cloudsRef} scale={1.012}>
          <sphereGeometry args={[def.size, segments, segments]} />
          <meshBasicMaterial map={cloudsTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
        </mesh>
      )}

      {/* floating icon chip for projects */}
      {def.kind === "project" && Icon && (
        <Html position={[0, def.size + 0.85, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
          <div className="planet-chip" style={{ color: def.color, borderColor: `${def.color}66` }}>
            {Icon(12)}
            <span>{def.name}</span>
          </div>
        </Html>
      )}

      {/* brand logo badge — sits on the planet's face, sized with the world */}
      {def.skillName && (
        <Html position={[0, 0, def.size * 0.55]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
          <div
            className="tech-chip"
            style={{
              width: chipPx,
              height: chipPx,
              borderColor: `${def.color}88`,
              boxShadow: `0 6px 22px rgba(0,0,0,0.65), 0 0 18px ${def.color}22, inset 0 0 12px rgba(0,0,0,0.5)`,
            }}
          >
            <TechLogoMark name={def.skillName} size={logoPx} />
          </div>
        </Html>
      )}

      {/* name label for non-project bodies (above the logo chip on skill bodies) */}
      {!Icon && (
        <Billboard position={[0, labelY, 0]}>
          <Text fontSize={0.16} color={hovered ? "#ffffff" : def.color} letterSpacing={0.08} anchorX="center" anchorY="middle" outlineWidth={0} fillOpacity={showName ? 1 : 0}>
            {def.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
