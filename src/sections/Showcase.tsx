import { useCallback, useEffect, useRef, useState } from "react";
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
import SpotlightCard from "../components/SpotlightCard";
import { scrollToSection, usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";
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

export function Showcase() {
  const [frameState, setFrameState] = useState<FrameState>("loading");
  const [frameReady, setFrameReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const timer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const storeReduced = usePortfolioStore((s) => s.reducedMotion);
  const still = reduceMotion || storeReduced;
  const frameRef = useRef<HTMLDivElement>(null);

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

  // Restrained parallax on the browser frame (fine pointer + motion OK only).
  const handleFrameMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = frameRef.current;
      if (!el || still) return;
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", `${(px * 7).toFixed(2)}px`);
      el.style.setProperty("--py", `${(py * 6).toFixed(2)}px`);
    },
    [still]
  );

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
          onMouseMove={handleFrameMove}
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

              {/* floating hover CTA — also the click target to open live */}
              <button
                className="browser-cta"
                onClick={openLive}
                aria-label="Explore live website in a new tab"
                data-cursor-label="EXPLORE"
                tabIndex={frameState === "loading" ? -1 : 0}
              >
                EXPLORE LIVE <ArrowUpRight size={15} aria-hidden />
              </button>
            </div>
          </div>

          <div className="browser-caption">
            <span className="mono browser-name">
              <Globe size={12} aria-hidden /> SAGAR WEB PACKAGE
            </span>
            <a
              href={LIVE_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line mono"
              data-cursor-label="VISIT"
            >
              {LIVE_SITE_URL.replace("https://", "")} ↗
            </a>
          </div>
        </motion.div>

        {/* ── 11 · Project facts ─────────────────────────── */}
        <div className="facts-strip" role="list" aria-label="Project facts">
          {facts.map((f, i) => (
            <motion.div key={f.k} {...anim(i * 0.06)} role="listitem" style={{ display: "contents" }}>
              <SpotlightCard className="fact-card" spotlightColor={f.color}>
                <span className="fact-k mono">{f.k}</span>
                <span className={`fact-v ${f.live ? "fact-live" : ""}`}>{f.v}</span>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* ── 12 · Visual statement ──────────────────────── */}
        <motion.p {...anim(0)} className="showcase-statement" aria-label="Don't just see my projects. See what I can build.">
          DON&rsquo;T JUST SEE MY PROJECTS.
          <span className="stmt-accent"> SEE WHAT I CAN BUILD.</span>
        </motion.p>

        {/* ── 09/10 · Capabilities ───────────────────────── */}
        <motion.div {...anim(0)} className="cap-head">
          <span className="eyebrow">WHAT THIS DEMONSTRATES</span>
          <p className="section-sub">
            More than a static page — this is an example of how I approach real-world
            web development.
          </p>
        </motion.div>

        <div className="cap-grid">
          {capabilities.map((c, i) => (
            <motion.div key={c.title} {...anim(i * 0.05)} style={{ display: "contents" }}>
              <SpotlightCard className="capability-card" spotlightColor={c.color}>
                <span className="cap-icon" aria-hidden>
                  <c.icon size={17} />
                </span>
                <h3>{c.title}</h3>
                <p>{c.copy}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Demonstrated vs. capabilities */}
        <motion.div {...anim(0)} className="scope-split">
          <div className="glass corner-lines scope-card">
            <span className="eyebrow">DEMONSTRATED BY THIS WEBSITE</span>
            <ul>
              <li>Professional business-style websites</li>
              <li>Landing pages &amp; multi-page websites</li>
              <li>Portfolio &amp; creator websites</li>
              <li>Responsive UI with motion &amp; production deployment</li>
            </ul>
          </div>
          <div className="glass corner-lines scope-card">
            <span className="eyebrow">CAPABILITIES I CAN BUILD</span>
            <ul>
              <li>Institute &amp; creator platforms, dashboards</li>
              <li>Auth systems &amp; database-backed apps</li>
              <li>Booking systems, payments &amp; API integrations</li>
              <li>Automation workflows &amp; CMS-backed websites</li>
            </ul>
          </div>
        </motion.div>

        <p className="scope-note mono">
          <Layers size={11} aria-hidden /> Package &amp; pricing details live on the external
          website — this showcase is proof of skill, not a pricing page.
        </p>

        {/* ── 13 · CTA ───────────────────────────────────── */}
        <motion.div {...anim(0)} className="showcase-cta-wrap">
          <SpotlightCard className="showcase-cta" spotlightColor="rgba(34, 211, 238, 0.10)">
            <span className="eyebrow">LIKE WHAT YOU SEE?</span>
            <h2>
              LET&rsquo;S BUILD <span className="text-grad">SOMETHING REAL.</span>
            </h2>
            <p>
              Whether you need a focused business website, a polished portfolio, or a custom
              web application, let&rsquo;s turn the idea into a working product.
            </p>
            <div className="cta-row">
              <button
                className="btn btn-primary"
                onClick={() => {
                  audio.blip("select");
                  scrollToSection("contact");
                }}
                data-cursor-label="HIRE"
              >
                LET&rsquo;S WORK TOGETHER <ArrowRight size={14} aria-hidden />
              </button>
              <button
                className="btn"
                onClick={() => {
                  audio.blip("click");
                  scrollToSection("projects");
                }}
                data-cursor-label="VIEW"
              >
                VIEW MY PROJECTS <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
