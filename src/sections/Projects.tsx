import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { projects } from "../data/projects";
import { usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function Projects() {
  const setHoloCard = usePortfolioStore((s) => s.setHoloCard);
  const setFocusedBody = usePortfolioStore((s) => s.setFocusedBody);

  const openDetail = (id: string) => {
    audio.blip("select");
    setHoloCard({ kind: "project", id });
    setFocusedBody(`project:${id}`);
  };

  return (
    <section id="projects" className="section" style={{ alignItems: "flex-start" }}>
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head">
          <span className="eyebrow">PROJECT UNIVERSE — MODE C: HR QUICK VIEW</span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            Five worlds, <span className="text-grad">already live</span>
          </h2>
          <p className="section-sub">
            These are the project planets orbiting the career sun. Click any card (or its planet in 3D) to open the
            holographic briefing.
          </p>
        </motion.div>

        <div className="proj-grid">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="glass proj-card corner-lines"
              onClick={() => openDetail(p.id)}
              data-cursor-label="OPEN"
            >
              <div className="pc-top">
                <span className="pc-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="chip tone-cyan">{p.category}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="proj-tags">
                {p.technologies.slice(0, 4).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="proj-actions" onClick={(e) => e.stopPropagation()}>
                <a
                  className="btn btn-sm btn-primary"
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="LAUNCH"
                  onClick={() => audio.blip("select")}
                >
                  <ExternalLink size={12} /> LIVE
                </a>
                <a
                  className="btn btn-sm"
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="CODE"
                  onClick={() => audio.blip("click")}
                >
                  <Github size={12} /> GITHUB
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
