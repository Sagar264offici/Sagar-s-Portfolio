import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, X } from "lucide-react";
import { usePortfolioStore, scrollToSection } from "../store/portfolioStore";
import { AstronomyGallery } from "./AstronomyGallery";

const FACTS = [
  "Space is the reason this portfolio is a solar system, not a page.",
  "The career sun is a metaphor — the orbit is real, the star is code.",
  "ORIGIN SIGNAL: born 7 July 2006 — hidden here, not on the homepage.",
  "Rishikesh → Uttarakhand → India: the coordinates of the builder.",
  "Next coordinates: 3D, Unity, Blender, deeper interactive experiments.",
];

export function AstronomyOverlay() {
  const open = usePortfolioStore((s) => s.astronomyOpen);
  const setOpen = usePortfolioStore((s) => s.setAstronomyOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Astronomy mode"
        >
          <motion.div
            className="modal-card corner-lines astro-card"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={15} />
            </button>

            <div className="astro-hero">
              <div className="a-planet" aria-hidden />
              <div className="eyebrow" style={{ justifyContent: "center" }}>
                <Moon size={12} /> ASTRONOMY MODE
              </div>
              <h2 style={{ margin: "10px 0 0", fontSize: "var(--text-2xl)" }}>The Sky Is a Hobby</h2>
              <p className="mono" style={{ color: "var(--text-3)", fontSize: 11, letterSpacing: "0.2em", margin: "8px 0 0", textTransform: "uppercase" }}>
                Observation log — Sagar's own captures
              </p>
            </div>

            {/* animated gallery */}
            <AstronomyGallery />

            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {FACTS.map((f) => (
                <li
                  key={f}
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                    padding: "12px 14px",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    background: "rgba(10,13,20,0.5)",
                  }}
                >
                  <span style={{ color: "var(--cyan)" }}>▸ </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="pp-actions" style={{ justifyContent: "center", marginTop: "var(--sp-5)" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setOpen(false);
                  scrollToSection("hobbies");
                }}
                data-cursor-label="ORBIT"
              >
                EXPLORE THE HOBBIES
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
