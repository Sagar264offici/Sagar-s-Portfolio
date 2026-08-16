# Sagar Pathak — The Career Universe

An interactive 3D developer portfolio that presents Sagar's career as a solar system:
a career sun, orbiting project worlds, skill planets, a GitHub data archive, a working
terminal, easter eggs, and a generated 3D avatar. **Not** a template portfolio.

> "I build things that shouldn't be this interactive."

---

## Tech stack

- **Vite + React 18 + TypeScript** (strict)
- **Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing**
- **framer-motion** — DOM transitions
- **Lenis** — smooth scroll
- **zustand** — global state
- **lucide-react** — icons (WhatsApp uses its official SVG glyph)

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build → dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
  data/        # projects, skills, journey, hobbies, contact, terminal — single source of truth
  store/       # zustand global state
  lib/         # device detection, audio engine, GitHub API, utils
  hooks/       # lenis, konami, github, pointer
  three/       # the 3D universe: sun, planets, avatar, camera rig, canvas
  components/  # chrome: cursor, nav, terminal, modals, tooltips, mini-worlds
  sections/    # hero, about, projects, skills, github, journey, hobbies, contact
  styles/      # tokens + global + component design system
public/
  audio/       # ← drop-in slot for a licensed soundtrack
  resume/      # ← drop-in slot for the final résumé PDF
```

## Configuration points

| What | Where |
| --- | --- |
| WhatsApp number (placeholder — **replace**) | `src/data/contact.ts` → `whatsappTarget` |
| Emails | `src/data/contact.ts` |
| GitHub username | `src/lib/github.ts` → `GITHUB_USERNAME` |
| Projects / links / copy | `src/data/projects.ts` |
| Skills & confidence tiers | `src/data/skills.ts` |
| Résumé PDF | drop at `public/resume.pdf` — button auto-upgrades |
| Soundtrack | `public/audio/portfolio-theme.mp3` (currently the supplied Timeless instrumental; swap the file to change it) |
| Domain (sitemap / OG) | `public/sitemap.xml`, `index.html` (currently a placeholder domain) |

### Audio
Sound is **OFF by default**. The site ships with Sagar's supplied **Timeless
(Instrumental)** track at `public/audio/portfolio-theme.mp3`, looped when sound is
enabled. If that file is ever removed, an original Web Audio ambient pad (cosmic
synth, slow cinematic pulse) takes over automatically — the feature never breaks.
UI blips (hover/click/select/terminal) are quiet and gated by the same toggle.

### Résumé
The resume slot checks for `/resume.pdf` at runtime. Missing → **RESUME COMING SOON**;
present → **DOWNLOAD RESUME**. No code changes needed when the PDF is added.
(The check uses `content-type`, so SPA rewrites can't fake a PDF.)

## Features

- **Cinematic boot** — loader with real staged progress, skippable intro, remembered in localStorage
- **Career solar system** — sun, 5 project planets, skill orbits (built/foundation/exploring
  visually distinguished by proximity, size and brightness), clickable planets with holographic briefings
- **Generated 3D avatar** — black-frame glasses, short hair, graphite outfit, eye tracking,
  breathing idle; built from primitives — no photograph is used anywhere
- **GitHub intelligence** — live public API data (repos + activity), contribution wall,
  repo capsules, honest offline fallback
- **INSPECT SYSTEM terminal** — `whoami`, `skills`, `projects`, `github`, `education`,
  `contact`, `interests`, `status`, `clear`, `help`, and secrets
- **Easter eggs** — Konami code (secret mode), `sudo hire-sagar`, click the moon (astronomy mode)
- **Professional / recruiter mode** — cleaner, calmer layout + "FOR RECRUITERS" quick profile
- **Performance** — device-tiered quality (low/medium/high/ultra), capped DPR, no shadows,
  gated bloom, particle budgets, lazy section content
- **Accessibility** — keyboard navigation, focus rings, ARIA labels, semantic HTML,
  `prefers-reduced-motion` support, terminal and overlays close with Escape
- **WebGL fallback** — premium 2D canvas cosmos when WebGL is unavailable

## Deployment (Vercel)

1. Push the repo and import it in Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist/`.
3. `vercel.json` (included) provides the SPA rewrite and audio caching headers.

## Honesty rules

No fabricated experience, metrics or stats. Skills are tiered as **built with** vs
**exploring**, and the GitHub section labels live vs cached data. The phone number is
never rendered as visible text — WhatsApp is exposed only as a `wa.me` link labeled
**Let's Connect**.

---

© Sagar Pathak
