import { useState } from "react";
import { Github, Linkedin, Mail, Menu, TerminalSquare, Volume2, VolumeX, X } from "lucide-react";
import { usePortfolioStore, scrollToSection, SECTION_IDS } from "../store/portfolioStore";
import { audio } from "../lib/audio";
import { contactLinks } from "../data/contact";

const sectionLabels: Record<string, string> = {
  home: "HOME",
  about: "ABOUT",
  projects: "PROJECTS",
  skills: "SKILLS",
  github: "GITHUB",
  journey: "JOURNEY",
  hobbies: "HOBBIES",
  contact: "CONTACT",
};

function SoundToggle() {
  const soundOn = usePortfolioStore((s) => s.soundOn);
  const toggleSound = usePortfolioStore((s) => s.toggleSound);
  return (
    <button
      className={`nav-toggle ${soundOn ? "on" : ""}`}
      onClick={() => {
        toggleSound();
        const next = !usePortfolioStore.getState().soundOn;
        if (next) {
          void audio.enable();
          audio.blip("click");
        } else {
          audio.disable();
        }
      }}
      aria-label={soundOn ? "Mute sound" : "Enable sound"}
      title={soundOn ? "Sound on" : "Sound off"}
    >
      {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span className="nv-label">{soundOn ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}

function ModeToggle() {
  const professional = usePortfolioStore((s) => s.professionalMode);
  const toggle = usePortfolioStore((s) => s.toggleProfessionalMode);
  return (
    <button
      className={`nav-toggle ${professional ? "on" : ""}`}
      onClick={() => {
        toggle();
        audio.blip("click");
      }}
      aria-label="Toggle professional mode"
      title={professional ? "Switch to immersive mode" : "Switch to professional mode"}
    >
      <span className="sw" aria-hidden />
      <span className="nv-label">{professional ? "PROFESSIONAL" : "IMMERSIVE"}</span>
    </button>
  );
}

export function Navbar() {
  const active = usePortfolioStore((s) => s.activeSection);
  const setTerminalOpen = usePortfolioStore((s) => s.setTerminalOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="nav-top">
      <a
        href="#home"
        className="nav-brand"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("home");
        }}
        aria-label="Sagar Pathak — home"
      >
        <span className="mark" aria-hidden />
        SAGAR PATHAK
      </a>

      <nav className="nav-links" aria-label="Primary">
        {SECTION_IDS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`nav-link ${active === id ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(id);
              audio.blip("click");
            }}
          >
            {sectionLabels[id]}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <SoundToggle />
        <ModeToggle />
        <button
          className="nav-toggle"
          style={{ color: "var(--cyan)", borderColor: "rgba(34,211,238,0.35)" }}
          onClick={() => {
            setTerminalOpen(true);
            audio.blip("select");
          }}
          aria-label="Open terminal"
        >
          <TerminalSquare size={14} />
          <span className="nv-label">INSPECT SYSTEM</span>
        </button>
        <button
          className="nav-toggle mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="glass nav-mobile-menu"
          style={{
            position: "fixed",
            top: "calc(var(--nav-h) + 10px)",
            right: "16px",
            padding: "18px",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {SECTION_IDS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              style={{ padding: "10px 12px", textAlign: "left" }}
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                scrollToSection(id);
              }}
            >
              {sectionLabels[id]}
            </a>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {contactLinks
              .filter((c) => c.icon !== "whatsapp")
              .map((c) => {
                const Icon = c.icon === "github" ? Github : c.icon === "linkedin" ? Linkedin : Mail;
                return (
                  <a key={c.id} href={c.href} target={c.external ? "_blank" : undefined} rel="noopener noreferrer" className="nav-toggle" aria-label={c.label}>
                    <Icon size={14} />
                  </a>
                );
              })}
          </div>
        </div>
      )}
    </header>
  );
}
