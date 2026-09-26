import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import "./WarpDrive.css";

// Lazy-load the heavy WebGPU component so it never blocks first paint.
// The .jsx module is untyped on purpose (tsc skips allowJs-off files).
// @ts-expect-error - untyped JSX WebGPU module
const AeroShardsLazy = lazy(() => import("./AeroShards.jsx"));

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        window.matchMedia?.("(pointer: coarse)").matches)
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = () => {
      setMobile(window.innerWidth < 768 || mq.matches);
    };
    window.addEventListener("resize", onChange, { passive: true });
    mq.addEventListener?.("change", onChange);
    onChange();
    return () => {
      window.removeEventListener("resize", onChange);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);
  return mobile;
}

function useNearViewport<T extends HTMLElement>(margin = "600px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, near };
}

function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.02 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/** Cheap CSS warp streaks — used when WebGPU is unavailable / failed / reduced-motion. */
function WarpFallback({ mobile }: { mobile: boolean }) {
  const streaks = mobile ? 14 : 28;
  return (
    <div className="warp-fallback" aria-hidden="true">
      {Array.from({ length: streaks }).map((_, i) => (
        <span
          key={i}
          className="warp-streak"
          style={{
            top: `${(i * 97) % 100}%`,
            animationDuration: `${2.2 + ((i * 37) % 20) / 10}s`,
            animationDelay: `${-((i * 53) % 30) / 10}s`,
            opacity: 0.12 + ((i * 29) % 10) / 60,
            width: `${60 + ((i * 41) % 120)}px`,
          }}
        />
      ))}
    </div>
  );
}

export function WarpDrive() {
  const isMobile = useIsMobile();
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const { ref: nearRef, near } = useNearViewport<HTMLElement>("700px");
  const { ref: viewRef, inView } = useInViewport<HTMLElement>();
  const [failed, setFailed] = useState(false);
  const [webgpu, setWebgpu] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgpu(
      typeof navigator !== "undefined" && !!(navigator as any).gpu
    );
  }, []);

  const showWebGPU =
    near && inView && !failed && webgpu && !reducedMotion;

  return (
    <section
      className="warp-drive"
      aria-label="Warp drive outro"
      ref={(el) => {
        (nearRef as any).current = el;
        (viewRef as any).current = el;
      }}
    >
      <div className="warp-drive__label mono" aria-hidden="true">
        <span className="warp-dot" />
        WARP DRIVE IDLE — END OF TRANSMISSION
      </div>

      <div
        className={`warp-drive__stage${isMobile ? " is-mobile" : ""}`}
        style={{ opacity: isMobile ? 0.38 : 0.52 }}
      >
        {showWebGPU ? (
          <Suspense fallback={<WarpFallback mobile={isMobile} />}>
            <AeroShardsLazy
              backgroundColor="#05060a"
              shardColor={isMobile ? "#4c5a7a" : "#5b6b8c"}
              accentColor="#22d3ee"
              placement="full"
              flow="stream"
              material="satin"
              detail={isMobile ? "bold" : "balanced"}
              effect="none"
              scale={1}
              spread={1}
              depth={0.8}
              speed={isMobile ? 1.0 : 1.35}
              spin={isMobile ? 0.5 : 0.7}
              interaction={isMobile ? "none" : "repel"}
              density={isMobile ? 0.55 : 0.9}
              shardSize={isMobile ? 0.9 : 1.0}
              stretch={isMobile ? 1.25 : 1.45}
              turbulence={0.7}
              glow={isMobile ? 0.5 : 0.7}
              edgeSoftness={2}
              bloom={isMobile ? 0.25 : 0.35}
              grain={isMobile ? 0 : 0.03}
              chromaticAberration={0.004}
              transitionDuration={1}
              interactionRadius={1.2}
              interactionStrength={0.35}
              rippleIntensity={isMobile ? 0 : 0.6}
              holdToGather={false}
              paused={!inView}
              onError={() => setFailed(true)}
            />
          </Suspense>
        ) : (
          <WarpFallback mobile={isMobile} />
        )}
        <div className="warp-drive__vignette" aria-hidden="true" />
      </div>
    </section>
  );
}
