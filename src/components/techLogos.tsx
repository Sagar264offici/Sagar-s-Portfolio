import { Braces, FileText } from "lucide-react";
import {
  siBlender,
  siC,
  siCplusplus,
  siCss,
  siDart,
  siFlutter,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siLinux,
  siNodedotjs,
  siReact,
  siTypescript,
  siUnity,
  siUpstash,
  siVercel,
} from "simple-icons";

interface BrandLogo {
  title: string;
  hex: string;
  path: string;
}

/* exact brand marks for every tech stack on the orbit map */
const brandIcons: Record<string, BrandLogo> = {
  TypeScript: siTypescript,
  React: siReact,
  "Upstash Redis": siUpstash,
  Linux: siLinux,
  Git: siGit,
  GitHub: siGithub,
  JavaScript: siJavascript,
  HTML: siHtml5,
  CSS: siCss,
  "Node.js": siNodedotjs,
  Vercel: siVercel,
  C: siC,
  "C++": siCplusplus,
  Flutter: siFlutter,
  Dart: siDart,
  Unity: siUnity,
  Blender: siBlender,
};

/* things that aren't a brand — clean glyph fallbacks */
const genericIcons: Record<string, "docs" | "api"> = {
  "Technical Documentation": "docs",
  "REST APIs": "api",
};

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 72;
}

/** Render a small brand mark for a tech name (auto-white when the brand color is too dark). */
export function TechLogoMark({ name, size = 14 }: { name: string; size?: number }) {
  const brand = brandIcons[name];
  if (brand) {
    const color = isDark(brand.hex) ? "#ffffff" : `#${brand.hex}`;
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} role="img" aria-label={brand.title}>
        <path d={brand.path} />
      </svg>
    );
  }
  const generic = genericIcons[name];
  if (generic === "docs") return <FileText size={size * 0.85} style={{ color: "var(--cyan)" }} aria-label={name} />;
  if (generic === "api") return <Braces size={size * 0.85} style={{ color: "var(--cyan)" }} aria-label={name} />;
  return null;
}
