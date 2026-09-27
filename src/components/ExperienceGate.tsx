import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Orbit, Sparkles, ChevronRight, MousePointerClick } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";

interface Props {
  open: boolean;
  onDone: () => void;
}

const BOOT_LINES = ["ESTABLISHING UPLINK", "CALIBRATING UNIVERSE", "READY"];

export function ExperienceGate({ open, onDone }: Props) {
  const setProfessionalMode = usePortfolioStore((s) => s.setProfessionalMode);
  const emitSystemMessage = usePortfolioStore((s) => s.emitSystemMessage);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const [bootStep, setBootStep] = useState(0);
  const [leaving, setLeaving] = useState<"pro" | "universe" | null>(null);

  // Cinematic boot-line sequence, then reveal the two choices.
  useEffect(() => {
    if (!open) return;
    setBootStep(0);
    setLeaving(null);
    if (reducedMotion) {
      setBootStep(BOOT_LINES.length);
      return;
    }
    const timers = BOOT_LINES.map((_, i) => window.setTimeout(() => setBootStep(i + 1), 350 + i * 450));
    return () => timers.forEach(window.clearTimeout);
  }, [open, reducedMotion]);

  // Lock scroll while the gate is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open ]);

  const choose = useCallback(
    (mode: "pro" | "universe") => {
      if (leaving) return;
      setLeaving(mode);
      setProfessionalMode(mode === "pro");
      audio.blip("select");
      emitSystemMessage(mode === "pro" ? "PROFESSIONAL MODE — CLEAR TEXT ENGAGED" : "UNIVERSE MODE — IMMERSIVE EXPERIENCE ENGAGED");
      window.setTimeout(() => {
        window.scrollTo(0, 0);
        onDone();
      }, reducedMotion ? 60 : 850);
    },
    [leaving, setProfessionalMode, emitSystemMessage, onDone, reducedMotion]
  );

  // Keyboard shortcuts: 1 = Professional, 2 = Universe, Enter = Universe.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") choose("pro");
      else if (e.key === "2" || e.key === "Enter") choose("universe");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, choose]);

  const ready = bootStep >= BOOT_LINES.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`exp-gate ${leaving ? `is-leaving-${leaving}` : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Choose your viewing experience"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "brightness(1.6) blur(6px)" }}
          transition={{ duration: reducedMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── animated backdrop ── */}
          <div className="exp-bg" aria-hidden>
            <div className="exp-nebula n1" />
            <div className="exp-nebula n2" />
            <div className="exp-nebula n3" />
            <div className="exp-stars s1" />
            <div className="exp-stars s2" />
            <div className="exp-grid" />
            <div className="exp-ring r1" />
            <div className="exp-ring r2" />
            <div className="exp-ring r3" />
            <div className="exp-warp" />
          </div>

          <motion.div
            className="exp-inner"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: reducedMotion ? 0 : 0.09, delayChildren: 0.15 } } }}
          >
            {/* boot lines */}
            <motion.div className="exp-boot" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
              {BOOT_LINES.map((line, i) => (
                <span key={line} className={`exp-boot-line ${i < bootStep ? "on" : ""} ${i === BOOT_LINES.length - 1 && ready ? "ready" : ""}`}>
                  {i < bootStep ? line : "···"}
                  {i < bootStep && i < BOOT_LINES.length - 1 && <i className="exp-boot-tick">✓</i>}
                </span>
              ))}
            </motion.div>

            <motion.p
              className="exp-eyebrow"
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            >
              <Sparkles size={13} /> Sagar Pathak — Portfolio System
            </motion.p>

            <motion.h1
              className="exp-title"
              variants={{ hidden: { opacity: 0, y: 26, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8 } } }}
            >
              Choose your
              <span className="exp-title-grad"> experience</span>
            </motion.h1>

            <motion.p
              className="exp-sub"
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            >
              Two ways to explore — pick the one that suits you right now. You can switch anytime from the navbar.
            </motion.p>

            {/* ── the two options ── */}
            <div className="exp-cards">
              <motion.button
                type="button"
                className={`exp-card pro ${leaving === "pro" ? "picked" : ""} ${leaving === "universe" ? "dimmed" : ""}`}
                onClick={() => choose("pro")}
                onMouseEnter={() => audio.blip("hover")}
                variants={{
                  hidden: { opacity: 0, y: 34, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
                }}
                whileHover={reducedMotion ? undefined : { y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Enter Professional Mode — clear text visibility"
              >
                <span className="exp-card-glow" aria-hidden />
                <span className="exp-card-top">
                  <span className="exp-ico pro-ico">
                    <Briefcase size={22} />
                  </span>
                  <span className="exp-tag tag-pro">Recommended for recruiters</span>
                </span>
                <span className="exp-card-name">Professional Mode</span>
                <span className="exp-card-desc">
                  Clean &amp; focused — maximum text clarity, calm background, faster reading. Best for hiring review.
                </span>
                <span className="exp-card-points">
                  <span>✓ Sharp text visibility</span>
                  <span>✓ Distraction-free layout</span>
                  <span>✓ Fast on any device</span>
                </span>
                <span className="exp-cta">
                  Enter Professional <ChevronRight size={15} />
                </span>
                <span className="exp-key">press 1</span>
              </motion.button>

              <motion.button
                type="button"
                className={`exp-card uni ${leaving === "universe" ? "picked" : ""} ${leaving === "pro" ? "dimmed" : ""}`}
                onClick={() => choose("universe")}
                onMouseEnter={() => audio.blip("hover")}
                variants={{
                  hidden: { opacity: 0, y: 34, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
                }}
                whileHover={reducedMotion ? undefined : { y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Enter Universe Mode — immersive 3D experience"
              >
                <span className="exp-card-glow" aria-hidden />
                <span className="exp-card-top">
                  <span className="exp-ico uni-ico">
                    <Orbit size={22} />
                  </span>
                  <span className="exp-tag tag-uni">Cinematic · default design</span>
                </span>
                <span className="exp-card-name">Universe Mode</span>
                <span className="exp-card-desc">
                  The full immersive website as designed — 3D planets, orbits, warp travel &amp; cinematic scroll.
                </span>
                <span className="exp-card-points">
                  <span>✦ Interactive 3D universe</span>
                  <span>✦ Warp &amp; orbit effects</span>
                  <span>✦ Full cinematic journey</span>
                </span>
                <span className="exp-cta">
                  Enter Universe <ChevronRight size={15} />
                </span>
                <span className="exp-key">press 2</span>
              </motion.button>
            </div>

            <motion.p
              className="exp-hint"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } } }}
            >
              <MousePointerClick size={13} /> Tip — switch anytime with the IMMERSIVE / PROFESSIONAL toggle in the top bar
            </motion.p>
          </motion.div>

          {/* warp flash on select */}
          {leaving && <div className="exp-flash" aria-hidden />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
