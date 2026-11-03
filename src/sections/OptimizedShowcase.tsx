import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  Blocks,
  ExternalLink,
  Globe,
  Layers,
  Lock,
  Palette,
  Plug,
  Rocket,
  RotateCcw,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import OptimizedSpotlightCard from "../components/OptimizedSpotlightCard";
import { scrollToSection, usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";
import { useThrottledEvent } from "../hooks/usePerformance";
import "./Showcase.css";

export const LIVE_SITE_URL = "https://sagar-web-package.vercel.app/";
const IFRAME_TIMEOUT_MS = 9000;

type FrameState = "loading" | "live" | "fallback";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

const capabilities = [
  {
    icon: Atom,
    title: "React Development",
    copy: "Component-based, scalable frontend architecture.",
    color: "rgba(0, 229, 255, 0.12)",
  },
  {
    icon: Palette,
    title: "Modern UI / UX",
    copy: "Clear visual hierarchy and purposeful interface design.",
    color: "rgba(232, 121, 249, 0.10)",
  },
  {
    icon: Sparkles,
    title: "Motion & Interaction",
    copy: "Smooth animations and micro-interactions without sacrificing usability.",
    color: "rgba(139, 92, 246, 0.12)",
  },
  {
    icon: Smartphone,
    title: "Responsive Development",
    copy: "Layouts designed for desktop, tablet, and mobile.",
    color: "rgba(52, 211, 153, 0.10)",
  },
  {
    icon: Rocket,
    title: "Production Deployment",
    copy: "Real deployment and production-ready implementation.",
    color: "rgba(251, 191, 36, 0.10)",
  },
  {
    icon: Zap,
    title: "Performance",
    copy: "Performance-conscious frontend implementation.",
    color: "rgba(34, 211, 238, 0.12)",
  },
  {
    icon: Plug,
    title: "Integrations",
    copy: "Forms, maps, WhatsApp flows, analytics and other practical integrations.",
    color: "rgba(59, 130, 246, 0.12)",
  },
  {
    icon: Blocks,
    title: "Custom Experiences",
    copy: "Ability to move beyond templates and build custom interfaces.",
    color: "rgba(232, 121, 249, 0.10)",
  },
];

const facts = [
  { k: "PROJECT TYPE", v: "Web Development Package Platform", color: "rgba(34, 211, 238, 0.10)" },
  { k: "STATUS", v: "● Live", live: true, color: "rgba(52, 211, 153, 0.12)" },
  { k: "STACK", v: "React + TypeScript + Tailwind + Framer Motion + Canvas", color: "rgba(139, 92, 246, 0.10)" },
  { k: "DEPLOYMENT", v: "Production / Vercel", color: "rgba(251, 191, 36, 0.08)" },
  { k: "FOCUS", v: "Responsive UI • UX • Motion • Performance", color: "rgba(232, 121, 249, 0.08)" },
];

function openLive() {
  audio.blip("select");
  window.open(LIVE_SITE_URL, "_blank", "noopener,noreferrer");
}

/**
 * OptimizedShowcase: Zero jank parallax on browser frame
 * - Throttled mousemove to 60fps max
 * - Cached rect measurements
 * - GPU-accelerated transforms via CSS custom properties
 */
export function OptimizedShowcase() {
  const [frameState, setFrameState] = useState<FrameState>("loading");
  const [frameReady, setFrameReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const timer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const storeReduced = usePortfolioStore((s) => s.reducedMotion);
  const still = reduceMotion || storeReduced;
  const frameRef = useRef<HTMLDivElement>(null);

  // Cache for frame dimensions (invalidated on resize)
  const rectCacheRef = useRef<{
    rect: DOMRect | null;
    timestamp: number;
  }>({ rect: null, timestamp: 0 });

  // The live site is an enhancement, not critical content. Do not download
  // its separate React bundle/images during the initial page load.
  useEffect(() => {
    const target = frameRef.current?.parentElement;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setFrameReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // If the embed never confirms a load (X-Frame-Options / CSP / network),
  // settle into the designed fallback view — never a broken iframe.
  useEffect(() => {
    if (!frameReady || frameState !== "loading") return;
    timer.current = window.setTimeout(() => {
      setFrameState((s) => (s === "loading" ? "fallback" : s));
    }, IFRAME_TIMEOUT_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [frameReady, frameState, frameKey]);

  const handleLoad = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    // Small settle delay so the skeleton cross-fades instead of flashing.
    window.setTimeout(() => setFrameState("live"), 450);
  }, []);

  const handleError = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setFrameState("fallback");
  }, []);

  const retry = useCallback(() => {
    audio.blip("click");
    setFrameState("loading");
    setFrameKey((k) => k + 1);
  }, []);

  // Invalidate rect cache on resize
  useEffect(() => {
    const handleResize = () => {
      rectCacheRef.current.rect = null;
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Throttled parallax handler - no layout thrashing
  const handleFrameMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = frameRef.current;
      if (!el || still) return;
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

      // Batch layout reads - use cache to avoid repeated getBoundingClientRect
      const now = performance.now();
      if (!rectCacheRef.current.rect || now - rectCacheRef.current.timestamp > 500) {
        rectCacheRef.current.rect = el.getBoundingClientRect();
        rectCacheRef.current.timestamp = now;
      }

      const r = rectCacheRef.current.rect!;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      // Use parseInt to avoid excessive string allocations
      const pxValue = Math.round(px * 7 * 100) / 100;
      const pyValue = Math.round(py * 6 * 100) / 100;

      el.style.setProperty("--px", `${pxValue}px`);
      el.style.setProperty("--py", `${pyValue}px`);
    },
    [still]
  );

  // Apply throttle to prevent excessive calls
  const throttledHandleFrameMove = useThrottledEvent(handleFrameMove, 16); // ~60fps

  const resetFrameMove = useCallback(() => {
    frameRef.current?.style.setProperty("--px", "0px");
    frameRef.current?.style.setProperty("--py", "0px");
  }, []);

  const anim = (delay = 0) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-70px" },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  // Memoize capabilities grid to prevent re-renders
  const capabilitiesGrid = useMemo(
    () =>
      capabilities.map((cap, i) => (
        <motion.div
          key={i}
          {...anim(i * 0.05)}
          className="showcase-card"
          style={{ "--card-color": cap.color } as React.CSSProperties}
        >
          <div className="showcase-card-inner">
            <cap.icon size={28} className="card-icon" aria-hidden />
            <h3 className="card-title">{cap.title}</h3>
            <p className="card-copy">{cap.copy}</p>
          </div>
        </motion.div>
      )),
    [still]
  );

  return (
    <section id="showcase" className="section showcase" aria-label="Live website showcase">
      <div className="section-inner showcase-inner">
        <div className="showcase-glow" aria-hidden />

        {/* ── 02 · Section intro ─────────────────────────── */}
        <motion.div {...(still ? {} : fadeUp)} className="section-head showcase-head">
          <span className="eyebrow">LIVE WEBSITE • BUILT BY SAGAR</span>
          <h2 className="h-xl showcase-title">
            SEE WHAT I <span className="text-grad">CAN BUILD</span>
          </h2>
          <p className="section-sub">
            A real, live example of my web development work — combining modern UI, responsive
            design, interactive experiences, animations, and production deployment.
          </p>
          <p className="section-sub showcase-sub2">
            From focused business websites to custom interactive web experiences, I build
            websites designed to look good, feel fast, and work across devices.
          </p>
        </motion.div>

        {/* ── 03/04/05/06 · Browser showcase ─────────────── */}
        <motion.div
          {...(still
            ? {}
            : {
                initial: { opacity: 0, y: 44, scale: 0.96 },
                whileInView: { opacity: 1, y: 0, scale: 1 },
                viewport: { once: true, margin: "-70px" },
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
              })}
          className="browser-wrap"
          onMouseMove={throttledHandleFrameMove}
          onMouseLeave={resetFrameMove}
        >
          <div ref={frameRef} className="browser-frame">
            {/* browser chrome */}
            <div className="browser-bar">
              <span className="traffic" aria-hidden>
                <i className="t-red" />
                <i className="t-yellow" />
                <i className="t-green" />
              </span>
              <span className="address" title={LIVE_SITE_URL}>
                <Lock size={11} aria-hidden />
                <span className="address-url">sagar-web-package.vercel.app</span>
              </span>
              <button
                className="address-open"
                onClick={openLive}
                aria-label="Open live website in a new tab"
                data-cursor-label="OPEN"
              >
                <ExternalLink size={12} aria-hidden />
                <span>LIVE</span>
              </button>
            </div>

            {/* viewport */}
            <div className="browser-view">
              {frameState === "loading" && (
                <div className="browser-skeleton" aria-hidden>
                  <div className="sk-hero shimmer" />
                  <div className="sk-row">
                    <div className="sk-card shimmer" />
                    <div className="sk-card shimmer" />
                    <div className="sk-card shimmer" />
                  </div>
                  <div className="sk-lines shimmer" />
                  <p className="sk-label mono">
                    <span className="sk-pulse" /> LOADING LIVE EXPERIENCE…
                  </p>
                </div>
              )}

              {frameReady && frameState !== "fallback" && (
                <iframe
                  key={frameKey}
                  src={LIVE_SITE_URL}
                  title="Sagar Web Package — live website"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ opacity: frameState === "live" ? 1 : 0 }}
                  tabIndex={frameState === "live" ? 0 : -1}
                  aria-hidden={frameState !== "live"}
                />
              )}

              {frameState === "fallback" && (
                <div className="browser-fallback">
                  <span className="eyebrow">LIVE WEBSITE</span>
                  <h3>Sagar Web Package</h3>
                  <p>Explore the complete web-development package experience.</p>
                  <button className="btn btn-primary" onClick={openLive} data-cursor-label="LAUNCH">
                    OPEN LIVE WEBSITE <ArrowUpRight size={14} aria-hidden />
                  </button>
                  <div className="fallback-meta">
                    <span className="chip">
                      <span className="dot" /> LIVE • OPEN IN NEW TAB
                    </span>
                    <button className="fallback-retry mono" onClick={retry} data-cursor-label="RETRY">
                      <RotateCcw size={11} aria-hidden /> TRY EMBED AGAIN
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Capabilities Grid - Memoized */}
        <div className="capabilities-grid">{capabilitiesGrid}</div>

        {/* Facts Grid */}
        <div className="facts-grid">
          {facts.map((fact, i) => (
            <OptimizedSpotlightCard
              key={i}
              className="fact-card"
              spotlightColor={fact.color}
              style={{ "--card-color": fact.color } as React.CSSProperties}
            >
              <div className="fact-content">
                <span className="fact-label">{fact.k}</span>
                <p className="fact-value">
                  {fact.live && <span className="live-indicator" aria-hidden>●</span>}
                  {fact.v}
                </p>
              </div>
            </OptimizedSpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
