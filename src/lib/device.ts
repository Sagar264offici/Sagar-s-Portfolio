export type QualityTier = "low" | "medium" | "high" | "ultra";

export interface DeviceProfile {
  quality: QualityTier;
  webgl: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
  dpr: number;
}

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

export function isTouchDevice(): boolean {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function gpuScore(): number {
  // Very rough heuristic — heavier screens + more cores => higher score.
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  return cores * memory;
}

export function detectQuality(): QualityTier {
  if (typeof window === "undefined") return "medium";
  const score = gpuScore();
  const touch = isTouchDevice();
  if (touch || score <= 16) return "low";
  if (score <= 32) return "medium";
  if (score <= 64) return "high";
  return "ultra";
}

export function detectDevice(): DeviceProfile {
  return {
    quality: detectQuality(),
    webgl: detectWebGL(),
    isTouch: isTouchDevice(),
    reducedMotion: prefersReducedMotion(),
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  };
}

export interface QualitySettings {
  starCount: number;
  dustCount: number;
  planetSegments: number;
  bloom: boolean;
  bloomIntensity: number;
  shadows: boolean;
  postprocessing: boolean;
  trails: boolean;
  sunDetail: "low" | "high";
}

export function qualitySettings(quality: QualityTier, reduced: boolean): QualitySettings {
  if (reduced) {
    return {
      starCount: 500,
      dustCount: 0,
      planetSegments: 24,
      bloom: false,
      bloomIntensity: 0.4,
      shadows: false,
      postprocessing: false,
      trails: false,
      sunDetail: "low",
    };
  }
  switch (quality) {
    case "low":
      return {
        starCount: 700,
        dustCount: 300,
        planetSegments: 24,
        bloom: false,
        bloomIntensity: 0.4,
        shadows: false,
        postprocessing: false,
        trails: false,
        sunDetail: "low",
      };
    case "medium":
      return {
        starCount: 1200,
        dustCount: 800,
        planetSegments: 32,
        bloom: true,
        bloomIntensity: 0.55,
        shadows: false,
        postprocessing: true,
        trails: false,
        sunDetail: "high",
      };
    case "high":
      return {
        starCount: 1800,
        dustCount: 1400,
        planetSegments: 48,
        bloom: true,
        bloomIntensity: 0.75,
        shadows: false,
        postprocessing: true,
        trails: false,
        sunDetail: "high",
      };
    case "ultra":
      return {
        starCount: 2400,
        dustCount: 2000,
        planetSegments: 64,
        bloom: true,
        bloomIntensity: 0.9,
        shadows: false,
        postprocessing: true,
        trails: true,
        sunDetail: "high",
      };
  }
}
