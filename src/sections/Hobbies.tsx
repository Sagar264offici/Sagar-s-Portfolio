import { motion } from "framer-motion";
import { hobbies } from "../data/hobbies";
import { AstronomyWorld, ChessWorld, CodingWorld, CricketWorld, StudyWorld } from "../components/MiniWorlds";
import { usePortfolioStore } from "../store/portfolioStore";
import { scrollToSection } from "../store/portfolioStore";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function worldFor(id: string) {
  switch (id) {
    case "cricket":
      return <CricketWorld />;
    case "chess":
      return <ChessWorld />;
    case "astronomy":
      return <AstronomyWorld />;
    case "coding":
      return <CodingWorld />;
    case "study":
      return <StudyWorld />;
    default:
      return null;
  }
}

export function Hobbies() {
  const setTerminalOpen = usePortfolioStore((s) => s.setTerminalOpen);

  return (
    <section id="hobbies" className="section" style={{ alignItems: "flex-start" }}>
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head">
          <span className="eyebrow">BEYOND THE CODE</span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            Side universes, <span className="text-grad">fully playable</span>
          </h2>
          <p className="section-sub">
            A developer is a person first. These are the micro-worlds that make Sagar, Sagar.
          </p>
        </motion.div>

        <div className="hobby-grid">
          {hobbies.map((h, i) => (
            <motion.div
              key={h.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="glass hobby-card corner-lines"
            >
              <div className="hc-top">
                <span className="hc-icon" style={{ color: h.color }}>
                  {h.name.slice(0, 1)}
                </span>
                <div>
                  <h3>{h.name}</h3>
                  <div className="hc-tag">{h.tagline}</div>
                </div>
              </div>
              <p>{h.description}</p>
              {worldFor(h.id)}
              {h.id === "coding" && (
                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => setTerminalOpen(true)}
                    data-cursor-label="OPEN"
                  >
                    OPEN TERMINAL
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => scrollToSection("skills")}
                    data-cursor-label="SKILLS"
                  >
                    VIEW SKILLS
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Unreleased lab */}
        <motion.div {...fadeUp} className="glass corner-lines" style={{ marginTop: "var(--sp-6)", padding: "var(--sp-5)", borderColor: "rgba(139,92,246,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--violet)" }}>
                UNRELEASED LAB
              </span>
              <h3 style={{ margin: "8px 0 4px", fontSize: "var(--text-lg)" }}>Unity · Blender · 3D Experiments</h3>
              <p className="muted" style={{ margin: 0, fontSize: "var(--text-sm)", maxWidth: 560 }}>
                Active exploration. Not shipped projects — experiments in progress, labeled honestly. Watch this orbit.
              </p>
            </div>
            <span className="chip" style={{ borderColor: "rgba(139,92,246,0.4)", color: "var(--violet)" }}>
              EXPLORATION / LEARNING
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
