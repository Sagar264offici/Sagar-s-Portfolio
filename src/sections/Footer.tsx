import { Github, Linkedin, Mail } from "lucide-react";
import { WhatsAppIcon } from "../components/icons";
import { contactLinks } from "../data/contact";

function iconFor(id: string) {
  switch (id) {
    case "github":
      return <Github size={15} />;
    case "linkedin":
      return <Linkedin size={15} />;
    case "mail":
      return <Mail size={15} />;
    case "whatsapp":
      return <WhatsAppIcon size={15} />;
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="footer">
      <h2 className="f-name">SAGAR PATHAK</h2>
      <p className="f-tag">"I build things that shouldn't be this interactive."</p>
      <div className="f-links">
        {contactLinks.map((c) => (
          <a
            key={c.id}
            className="btn btn-icon"
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={c.label}
            data-cursor-label={c.label.toUpperCase()}
          >
            {iconFor(c.id)}
          </a>
        ))}
      </div>
      <div className="f-copy">© Sagar Pathak — Built from scratch, in Rishikesh</div>
    </footer>
  );
}
