export interface ContactLink {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: "github" | "linkedin" | "mail" | "whatsapp";
  external: boolean;
}

/**
 * Privacy + configuration notes:
 * 1. The WhatsApp number is stored ONLY as a wa.me target. It is never rendered
 *    as visible text anywhere in the UI. "Let's Connect" is the only label shown.
 * 2. WhatsApp target: +91 8755903705 (India). Stored only as a wa.me link.
 */
export const whatsappTarget = "https://wa.me/918755903705";

export const primaryEmail = "pathaksagar264@gmail.com";
export const alternateEmail = "nooneisusingthismail@gmail.com";

export const contactLinks: ContactLink[] = [
  {
    id: "github",
    label: "GitHub",
    sub: "Sagar264offici",
    href: "https://github.com/Sagar264offici",
    icon: "github",
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    sub: "sagarakanoone",
    href: "https://www.linkedin.com/in/sagarakanoone/",
    icon: "linkedin",
    external: true,
  },
  {
    id: "email",
    label: "Email",
    sub: primaryEmail,
    href: `mailto:${primaryEmail}`,
    icon: "mail",
    external: false,
  },
  {
    id: "whatsapp",
    label: "Let's Connect",
    sub: "WhatsApp — chat directly",
    href: whatsappTarget,
    icon: "whatsapp",
    external: true,
  },
];

export const alternateEmailLink = `mailto:${alternateEmail}`;
