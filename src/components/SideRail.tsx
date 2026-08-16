import { SECTION_IDS, scrollToSection, usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";

const labels: Record<string, string> = {
  home: "HOME",
  about: "ABOUT",
  projects: "PROJECTS",
  skills: "SKILLS",
  github: "GITHUB",
  journey: "JOURNEY",
  hobbies: "HOBBIES",
  contact: "CONTACT",
};

export function SideRail() {
  const active = usePortfolioStore((s) => s.activeSection);
  const professional = usePortfolioStore((s) => s.professionalMode);

  if (professional) return null;

  return (
    <nav className="nav-rail" aria-label="Sections">
      {SECTION_IDS.map((id) => (
        <button
          key={id}
          className={`rail-dot ${active === id ? "active" : ""}`}
          onClick={() => {
            scrollToSection(id);
            audio.blip("click");
          }}
          aria-label={`Go to ${labels[id]}`}
        >
          <span className="rail-label">{labels[id]}</span>
        </button>
      ))}
    </nav>
  );
}
