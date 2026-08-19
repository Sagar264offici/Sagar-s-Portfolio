import { motion } from "framer-motion";
import { skillCategories } from "../data/skills";
import { usePortfolioStore } from "../store/portfolioStore";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function Skills() {
  const setHoloCard = usePortfolioStore((s) => s.setHoloCard);
  const setFocusedBody = usePortfolioStore((s) => s.setFocusedBody);

  const built = skillCategories.find((c) => c.id === "built")!;
  const foundation = skillCategories.find((c) => c.id === "foundation")!;
  const exploring = skillCategories.find((c) => c.id === "exploring")!;

  const renderPanel = (cat: typeof built, delay: number) => (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay }}
      className="glass skill-panel corner-lines"
      style={{ borderColor: `color-mix(in srgb, ${cat.color} 28%, transparent)` }}
    >
      <div className="sp-head">
        <span className="orb" style={{ color: cat.color, background: cat.color }} />
        <h3>{cat.headline}</h3>
      </div>
      <p className="sp-blurb">{cat.blurb}</p>
      <div className="skill-list">
        {cat.skills.map((skill) => (
          <div
            key={skill.name}
            className="skill-row"
            role="button"
            tabIndex={0}
            data-cursor-label="INSPECT"
            onClick={() => {
              setHoloCard({ kind: "skill", id: skill.name });
              setFocusedBody(`skill:${cat.id}:${skill.name}`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHoloCard({ kind: "skill", id: skill.name });
                setFocusedBody(`skill:${cat.id}:${skill.name}`);
              }
            }}
          >
            <span className="sr-name">
              {skill.name}
              <span className="conf">{Math.round(skill.confidence * 100)}%</span>
            </span>
            <span className="sr-note">{skill.note}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <section id="skills" className="section" style={{ alignItems: "flex-start" }}>
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head">
          <span className="eyebrow">SKILL SOLAR SYSTEM</span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            What I've shipped with <span className="text-grad">vs what I'm learning</span>
          </h2>
          <p className="section-sub">
            In the 3D universe, orbit distance and size reflect how confident I am with each technology — not a test
            score, just an honest mapping. Skills I've used in real projects are brighter and closer. Skills I'm still
            learning are smaller and further out. Click any skill row to see the details.
          </p>
        </motion.div>

        <div className="skills-legend" aria-hidden>
          {skillCategories.map((c) => (
            <div key={c.id} className="lg-item">
              <span className="lg-dot" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
              {c.label}
            </div>
          ))}
          <div className="lg-item">
            <span className="lg-dot" style={{ background: "#7d8597", boxShadow: "0 0 10px rgba(125,133,151,0.6)" }} />
            Dwarf planets (no shipped project yet)
          </div>
        </div>

        <div className="skills-grid">
          {renderPanel(built, 0)}
          {renderPanel(foundation, 0.08)}
          {renderPanel(exploring, 0.16)}
        </div>
      </div>
    </section>
  );
}
