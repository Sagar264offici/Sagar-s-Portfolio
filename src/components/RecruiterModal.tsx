import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Linkedin, Mail, X } from "lucide-react";
import { WhatsAppIcon } from "./icons";
import { usePortfolioStore } from "../store/portfolioStore";
import { ResumeGate } from "./ResumeGate";
import { contactLinks, primaryEmail } from "../data/contact";
import { audio } from "../lib/audio";

export function RecruiterModal() {
  const open = usePortfolioStore((s) => s.recruiterOpen);
  const setOpen = usePortfolioStore((s) => s.setRecruiterOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const iconFor = (id: string) => (id === "github" ? Github : id === "linkedin" ? Linkedin : id === "whatsapp" ? WhatsAppIcon : Mail);

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
          aria-label="Quick profile"
        >
          <motion.div
            className="modal-card corner-lines"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={15} />
            </button>
            <div className="eyebrow">QUICK PROFILE</div>
            <h2 style={{ margin: "10px 0 0", fontSize: "var(--text-2xl)" }}>Sagar Pathak</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Developer / Creative Technologist — BSc Information Technology, Final Year
            </p>

            <div className="qp-grid">
              <div className="qp-item">
                <div className="qp-k">ROLE</div>
                <div className="qp-v">Developer · Builder · Problem Solver · Creative Technologist</div>
              </div>
              <div className="qp-item">
                <div className="qp-k">EDUCATION</div>
                <div className="qp-v">BSc Information Technology — Final Year</div>
              </div>
              <div className="qp-item">
                <div className="qp-k">STRONG TECHNOLOGIES</div>
                <div className="qp-v small">TypeScript · React · Upstash Redis · Linux · Git / GitHub</div>
              </div>
              <div className="qp-item">
                <div className="qp-k">EXPLORING</div>
                <div className="qp-v small">Flutter · Unity · Blender</div>
              </div>
              <div className="qp-item">
                <div className="qp-k">PROJECTS</div>
                <div className="qp-v small">5 featured — all live with source on GitHub</div>
              </div>
              <div className="qp-item">
                <div className="qp-k">LOCATION</div>
                <div className="qp-v small">Rishikesh, Uttarakhand, India</div>
              </div>
            </div>

            <div className="qp-ctas">
              <ResumeGate />
              {contactLinks.map((c) => {
                const Icon = iconFor(c.id);
                return (
                  <a
                    key={c.id}
                    className="btn btn-sm"
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    data-cursor-label={c.label.toUpperCase()}
                    onClick={() => audio.blip("click")}
                  >
                    <Icon size={13} /> {c.label}
                  </a>
                );
              })}
            </div>

            <p className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", margin: "18px 0 0" }}>
              PRIMARY EMAIL: {primaryEmail}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
