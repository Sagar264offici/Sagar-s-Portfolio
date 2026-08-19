import { useEffect, useRef, useState } from "react";
import { usePortfolioStore, scrollToSection } from "../store/portfolioStore";
import { audio } from "../lib/audio";
import { terminalCommands, whoamiOutput } from "../data/terminal";
import { primaryEmail, alternateEmail, whatsappTarget } from "../data/contact";
import { allSkills } from "../data/skills";
import { projects } from "../data/projects";

interface Line {
  id: number;
  text: string;
  cls?: string;
  isCmd?: boolean;
}

let lineId = 0;

const WELCOME: Line[] = [
  { id: lineId++, text: "SAGAR PATHAK — PORTFOLIO TERMINAL", cls: "t-out-cyan" },
  { id: lineId++, text: "Type 'help' to see available commands.", cls: "t-out-dim" },
  { id: lineId++, text: "PS: try 'sudo hire-sagar'", cls: "t-out-dim" },
];

export function Terminal() {
  const open = usePortfolioStore((s) => s.terminalOpen);
  const setTerminalOpen = usePortfolioStore((s) => s.setTerminalOpen);
  const setAstronomyOpen = usePortfolioStore((s) => s.setAstronomyOpen);
  const setSecretMode = usePortfolioStore((s) => s.setSecretMode);
  const emitSystemMessage = usePortfolioStore((s) => s.emitSystemMessage);
  const setRecruiterOpen = usePortfolioStore((s) => s.setRecruiterOpen);

  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLines(WELCOME);
      setInput("");
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTerminalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setTerminalOpen]);

  const push = (text: string, cls?: string, isCmd?: boolean) => {
    setLines((prev) => [...prev, { id: lineId++, text, cls, isCmd }]);
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    audio.blip("terminal");
    push(`sagar@portfolio:~$ ${cmd}`, "", true);
    if (!cmd) return;

    const out = (text: string, cls?: string) => push(text, cls);

    switch (cmd) {
      case "help":
        terminalCommands.forEach((c) => out(`  ${c.command.padEnd(14)}${c.description}`, "t-out-dim"));
        out("");
        out("  secret commands are listening…", "t-out-dim");
        break;
      case "whoami":
        whoamiOutput.forEach((l) => out(l, l === "Sagar Pathak" ? "t-out-cyan" : l === "Developer" || l === "Builder" || l === "Problem Solver" || l === "Student" || l === "Explorer" ? "t-out-green" : "t-out-dim"));
        break;
      case "skills":
        out("> Opening skill solar system…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => scrollToSection("skills"), 120);
        break;
      case "projects":
        out("> Traveling to project orbits…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => scrollToSection("projects"), 120);
        break;
      case "github":
        out("> Opening GitHub data archive…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => scrollToSection("github"), 120);
        break;
      case "education":
        out("BSc Information Technology — Final Year", "t-out-green");
        out("Sri Dev Suman Uttarakhand University");
        out("Swami Purnanand Degree College of Technical Education");
        out("Muni Ki Reti / Dhalwala, Rishikesh, Uttarakhand");
        out("");
        out("Class 12 — PCM (background)", "t-out-dim");
        break;
      case "contact":
        out(`Primary email: ${primaryEmail}`, "t-out-green");
        out(`Alternate email: ${alternateEmail}`, "t-out-green");
        out("LinkedIn: https://www.linkedin.com/in/sagarakanoone/", "t-out-cyan");
        out("GitHub: https://github.com/Sagar264offici", "t-out-cyan");
        out("WhatsApp: https://wa.me/… (number hidden by design)", "t-out-dim");
        out("");
        out("> Opening contact system…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => scrollToSection("contact"), 120);
        break;
      case "interests":
        out("BEYOND THE CODE:", "t-out-green");
        out("  • Programming / coding");
        out("  • Cricket");
        out("  • Chess");
        out("  • Astronomy / space");
        out("  • Studying and learning");
        break;
      case "status":
        out(`  Render quality : ${usePortfolioStore.getState().quality.toUpperCase()}`, "t-out-dim");
        out(`  Reduced motion: ${usePortfolioStore.getState().reducedMotion ? "ENABLED" : "DISABLED"}`, "t-out-dim");
        out(`  WebGL         : ${usePortfolioStore.getState().webgl ? "AVAILABLE" : "FALLBACK 2D"}`, "t-out-dim");
        out(`  Sound         : ${usePortfolioStore.getState().soundOn ? "ON" : "OFF"}`, "t-out-dim");
        out(`  GitHub data   : ${usePortfolioStore.getState().github.source.toUpperCase()}`, "t-out-dim");
        out(`  Projects live : ${projects.filter((p) => p.status !== "PROTOTYPE").length}/5`, "t-out-dim");
        out("All systems nominal.", "t-out-green");
        break;
      case "resume":
        out("> Opening recruiter terminal…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => setRecruiterOpen(true), 120);
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        out("Permission denied.", "t-out-amber");
        out("Nice try.", "t-out-amber");
        break;
      case "sudo hire-sagar":
        out("Validating credentials…", "t-out-dim");
        out("OFFER ACCEPTED 🎉", "t-out-green");
        out("Welcome aboard, Chief Explorer.", "t-out-green");
        out("(This is a portfolio easter egg — no contracts were harmed.)", "t-out-dim");
        break;
      case "moon":
        out("> Entering ASTRONOMY MODE…", "t-out-cyan");
        setTerminalOpen(false);
        window.setTimeout(() => setAstronomyOpen(true), 120);
        break;
      case "secret":
      case "konami":
        setSecretMode(!usePortfolioStore.getState().secretMode);
        emitSystemMessage(
          usePortfolioStore.getState().secretMode ? "DEVELOPER SECRET MODE: DEACTIVATED" : "DEVELOPER SECRET MODE: ACTIVATED"
        );
        out("SECRET MODE toggled. The neon breathes differently now.", "t-out-violet");
        break;
      case "hire":
        out("Sure. Run 'sudo hire-sagar'.", "t-out-dim");
        break;
      case "whatsapp":
        out("Opening WhatsApp…", "t-out-cyan");
        window.open(whatsappTarget, "_blank", "noopener,noreferrer");
        break;
      default:
        if (cmd.startsWith("skill ")) {
          const name = cmd.slice(6).trim();
          const skill = allSkills.find((s) => s.name.toLowerCase() === name.toLowerCase());
          if (skill) {
            out(`${skill.name.toUpperCase()} — ${skill.note}`, "t-out-green");
            out(`Confidence tier: ${skill.tier.toUpperCase()}`, "t-out-dim");
            if (skill.projects.length) out(`Shipped in: ${skill.projects.join(", ")}`, "t-out-cyan");
          } else {
            out(`No skill named '${name}'. Try 'skills'.`, "t-out-amber");
          }
        } else {
          out(`command not found: ${cmd}`, "t-out-amber");
          out("Type 'help' for available commands.", "t-out-dim");
        }
    }
  };

  return (
    <div
      className="terminal"
      style={{ display: open ? "flex" : "none" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setTerminalOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio terminal"
    >
      <div className="term-card">
        <div className="term-bar">
          <span className="t-dot" style={{ background: "#f87171" }} />
          <span className="t-dot" style={{ background: "#fbbf24" }} />
          <span className="t-dot" style={{ background: "#34d399" }} />
          <span className="t-title">sagar@portfolio — INSPECT SYSTEM</span>
          <button className="modal-close" onClick={() => setTerminalOpen(false)} aria-label="Close terminal" style={{ position: "static", width: 28, height: 28 }}>
            ✕
          </button>
        </div>
        <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
          {lines.map((l) =>
            l.isCmd ? (
              <div key={l.id} className="term-line">
                <span className="t-prompt">sagar@portfolio:~$ </span>
                <span className="t-cmd">{l.text.slice("sagar@portfolio:~$ ".length)}</span>
              </div>
            ) : (
              <div key={l.id} className={`term-line ${l.cls || ""}`}>
                {l.text}
              </div>
            )
          )}
        </div>
        <form
          className="term-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
            setInput("");
          }}
        >
          <span className="t-prompt">sagar@portfolio:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type 'help'"
            aria-label="Terminal command"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
