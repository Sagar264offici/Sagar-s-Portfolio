import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { usePortfolioStore } from "../store/portfolioStore";
import { isTouchDevice, qualitySettings } from "../lib/device";
import { UniverseScene } from "./UniverseScene";

export function UniverseCanvas() {
  const quality = usePortfolioStore((s) => s.quality);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const webgl = usePortfolioStore((s) => s.webgl);

  if (!webgl) return null;

  const settings = qualitySettings(quality, reduced);
  // Phones get a hard DPR cap — full-res pixels on a 120Hz panel cost more
  // than the scene's visual payoff there.
  const dprMax = isTouchDevice() ? 1.5 : reduced ? 1.5 : 2;

  return (
    <Canvas
      dpr={[1, dprMax]}
      camera={{ fov: 55, near: 0.1, far: 400, position: [0, 1.9, 20] }}
      gl={{
        antialias: settings.postprocessing ? false : true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        // Power-of-two textures + no depth pre-pass for faster rendering
        toneMapping: 0, // NoToneMapping — faster, and the scene is already dark
      }}
      onCreated={({ gl }) => gl.setClearColor("#01030a")}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <fog attach="fog" args={["#01030a", 45, 150]} />
      <UniverseScene />

      {settings.postprocessing && (
        <EffectComposer multisampling={reduced ? 0 : 2}>
          <Bloom
            intensity={settings.bloomIntensity * 0.85}
            luminanceThreshold={0.88}
            luminanceSmoothing={0.35}
            mipmapBlur
            radius={0.4}
          />
          <Vignette eskil={false} offset={0.22} darkness={0.85} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
