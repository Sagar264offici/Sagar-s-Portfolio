import { useEffect } from "react";
import { ExternalLink, Github, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePortfolioStore } from "../store/portfolioStore";
import { getProjectById } from "../data/projects";
import { allSkills } from "../data/skills";
import { audio } from "../lib/audio";

export function HoloPanel() {
  const card = usePortfolioStore((s) => s.holoCard);
  const setHoloCard = usePortfolioStore((s) => s.setHoloCard);
  const setFocusedBody = usePortfolioStore((s) => s.setFocusedBody);
  const scrollToProjects = () => {
    setHoloCard(null);
    setFocusedBody(null);
    const el = document.getElementById("projects");
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(el!, { offset: 0, duration: 1.2 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoloCard(null);
        setFocusedBody(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, setHoloCard, setFocusedBody]);

  const close = () => {
    audio.blip("click");
    setHoloCard(null);
    setFocusedBody(null);
  };

  const project = card?.kind === "project" ? getProjectById(card.id) : undefined;
  const skill = card?.kind === "skill" ? allSkills.find((s) => s.name === card.id) : undefined;

  return (
    <AnimatePresence>
      {card && (project || skill) && (
        <motion.div
          className="project-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={project ? `Project: ${project.title}` : `Skill: ${skill?.name}`}
        >
          <motion.div
            className="pp-card corner-lines"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="pp-close" onClick={close} aria-label="Close">
              <X size={16} />
            </button>

            {project ? (
              <>
                <div className="pp-kicker">PROJECT WORLD — {project.category.toUpperCase()}</div>
                <h2>{project.title}</h2>
                <span className="pp-status">● {project.status}</span>
                <p className="muted" style={{ margin: 0, fontSize: "var(--text-base)", lineHeight: 1.7 }}>
                  {project.description}
                </p>

                <div className="pp-sections">
                  <div className="pp-block">
                    <h4>WHAT IT DOES</h4>
                    <p>{project.purpose}</p>
                  </div>
                  <div className="pp-block">
                    <h4>WHY I BUILT IT</h4>
                    <p>{project.whyBuilt}</p>
                  </div>
                  <div className="pp-block">
                    <h4>TECH STACK</h4>
                    <div className="proj-tags">
                      {project.technologies.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pp-block">
                    <h4>KEY FEATURES</h4>
                    <ul>
                      {project.capabilities.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pp-actions">
                  <a className="btn btn-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor-label="LAUNCH">
                    LAUNCH LIVE PROJECT <ExternalLink size={14} />
                  </a>
                  <a className="btn" href={project.githubUrl} target="_blank" rel="noopener noreferrer" data-cursor-label="CODE">
                    <Github size={14} /> OPEN SOURCE
                  </a>
                </div>
              </>
            ) : skill ? (
              <>
                <div className="pp-kicker">SKILL BODY — {skill.tier.toUpperCase()} TIER</div>
                <h2>{skill.name}</h2>
                <span className="pp-status" style={{ color: "var(--cyan)", borderColor: "rgba(34,211,238,0.35)" }}>
                  ● {skill.tier === "built" ? "BUILT WITH" : skill.tier === "foundation" ? "FOUNDATION" : "EXPLORING"}
                </span>
                <p className="muted" style={{ margin: 0, fontSize: "var(--text-base)", lineHeight: 1.7 }}>
                  {skill.note}
                </p>
                <div className="pp-sections">
                  <div className="pp-block">
                    <h4>CONFIDENCE</h4>
                <p>
                  Confidence level: <strong>{Math.round(skill.confidence * 100)}%</strong> — how comfortable I am with this
                  technology based on actual use, not a test score.
                </p>
                  </div>
                  <div className="pp-block">
                    <h4>SHIPPED IN</h4>
                    {skill.projects.length ? (
                      <ul>
                        {skill.projects.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Still learning — no shipped project using this yet.
                      </p>
                    )}
                  </div>
                </div>
                <div className="pp-actions">
                  <button className="btn btn-primary" onClick={scrollToProjects} data-cursor-label="GO">
                    VIEW PROJECTS
                  </button>
                  <a className="btn" href="https://github.com/Sagar264offici" target="_blank" rel="noopener noreferrer" data-cursor-label="CODE">
                    <Github size={14} /> VIEW GITHUB
                  </a>
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
