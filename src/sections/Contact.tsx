import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { WhatsAppIcon } from "../components/icons";
import { contactLinks, alternateEmailLink, alternateEmail } from "../data/contact";
import { ResumeGate } from "../components/ResumeGate";
import { audio } from "../lib/audio";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function iconFor(id: string) {
  switch (id) {
    case "github":
      return <Github size={19} />;
    case "linkedin":
      return <Linkedin size={19} />;
    case "mail":
      return <Mail size={19} />;
    case "whatsapp":
      return <WhatsAppIcon size={19} />;
    default:
      return null;
  }
}

export function Contact() {
  return (
    <section id="contact" className="section" style={{ alignItems: "flex-start" }}>
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            Let's <span className="text-grad">talk</span>
          </h2>
          <p className="section-sub">
            Want to talk about a project, internship, collaboration, or just something nerdy? You can reach me here.
          </p>
        </motion.div>

        <div className="contact-grid">
          {contactLinks.map((c, i) => (
            <motion.a
              key={c.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="glass contact-card corner-lines"
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel="noopener noreferrer"
              data-cursor-label={c.label.toUpperCase()}
              onClick={() => audio.blip("select")}
            >
              <span className="cc-icon">{iconFor(c.id)}</span>
              <span className="cc-label">{c.label}</span>
              <span className="cc-sub">{c.sub}</span>
            </motion.a>
          ))}
        </div>

        <motion.div {...fadeUp} style={{ marginTop: "var(--sp-6)", display: "flex", flexWrap: "wrap", gap: "var(--sp-4)", alignItems: "center" }}>
          <div className="glass corner-lines" style={{ padding: "var(--sp-5)", flex: "1 1 320px", maxWidth: 460 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              PAPERS
            </div>
            <p className="muted" style={{ margin: "0 0 14px", fontSize: "var(--text-sm)" }}>
              Résumé slot is live. Drop <span className="mono" style={{ color: "var(--cyan)" }}>/resume.pdf</span> into the
              project and the button upgrades itself automatically.
            </p>
            <ResumeGate />
          </div>

          <div className="glass corner-lines" style={{ padding: "var(--sp-5)", flex: "1 1 320px", maxWidth: 460 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              ALTERNATE EMAIL
            </div>
            <p className="muted" style={{ margin: "0 0 14px", fontSize: "var(--text-sm)" }}>
              Alternate email — in case the main one doesn't work:
            </p>
            <a className="btn" href={alternateEmailLink} data-cursor-label="SEND">
              <Mail size={13} /> {alternateEmail}
            </a>
          </div>

          <div className="glass corner-lines" style={{ padding: "var(--sp-5)", flex: "1 1 320px", maxWidth: 460 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              COORDINATES
            </div>
            <p className="mono" style={{ margin: 0, fontSize: 12, color: "var(--text-2)", letterSpacing: "0.1em", lineHeight: 2 }}>
              RISHIKESH <span style={{ color: "var(--cyan)" }}>→</span> UTTARAKHAND <span style={{ color: "var(--cyan)" }}>→</span> INDIA
              <br />
              <span style={{ color: "var(--text-3)", fontSize: 10 }}>NO HOUSE ADDRESS — DELIBERATE.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
