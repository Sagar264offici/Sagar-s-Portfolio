import { create } from "zustand";
import { detectDevice, detectQuality, isTouchDevice, type QualityTier } from "../lib/device";

export type SectionId =
  | "home"
  | "about"
  | "projects"
  | "skills"
  | "github"
  | "journey"
  | "hobbies"
  | "contact";

export const SECTION_IDS: SectionId[] = [
  "home",
  "about",
  "projects",
  "skills",
  "github",
  "journey",
  "hobbies",
  "contact",
];

interface GithubState {
  user: { login: string; name: string; avatar_url: string; html_url: string; public_repos: number; bio: string; location: string } | null;
  repos: GithubRepo[];
  events: GithubEvent[];
  loading: boolean;
  source: "live" | "fallback" | "error";
  loadedAt: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
}

export interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: string;
}

interface PortfolioState {
  // boot / intro
  booted: boolean;
  introSeen: boolean;
  boot: () => void;
  markIntroSeen: () => void;

  // rendering
  quality: QualityTier;
  reducedMotion: boolean;
  webgl: boolean;
  professionalMode: boolean;
  secretMode: boolean;
  setProfessionalMode: (v: boolean) => void;
  toggleProfessionalMode: () => void;
  setSecretMode: (v: boolean) => void;
  toggleReducedMotion: () => void;
  setReducedMotion: (v: boolean) => void;

  // audio
  soundOn: boolean;
  toggleSound: () => void;
  setSound: (v: boolean) => void;

  // UI overlays
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  astronomyOpen: boolean;
  setAstronomyOpen: (v: boolean) => void;
  recruiterOpen: boolean;
  setRecruiterOpen: (v: boolean) => void;

  // manual orbit rotation
  /** 0..360 — rotates every planet around the career sun */
  orbitSpin: number;
  setOrbitSpin: (deg: number) => void;

  // selection / focus
  /** planet registry key the camera should fly to (or null to follow scroll) */
  focusedBody: string | null;
  setFocusedBody: (key: string | null) => void;
  /** holographic info card currently open */
  holoCard: { kind: "project" | "skill"; id: string } | null;
  setHoloCard: (card: { kind: "project" | "skill"; id: string } | null) => void;
  hoveredPlanet: string | null;
  setHoveredPlanet: (id: string | null) => void;

  // scroll
  scrollProgress: number;
  setScrollProgress: (v: number) => void;
  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;

  // github
  github: GithubState;
  setGithubUser: (u: GithubState["user"]) => void;
  setGithubRepos: (r: GithubRepo[]) => void;
  setGithubEvents: (e: GithubEvent[]) => void;
  setGithubLoading: (v: boolean) => void;
  setGithubSource: (s: GithubState["source"]) => void;

  // toast-ish feedback for terminal/easter eggs
  systemMessage: string | null;
  systemMessageKey: number;
  emitSystemMessage: (msg: string) => void;
  clearSystemMessage: () => void;
}

function readStoredFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

const initialReduced = readStoredFlag("sp-reduced-motion") || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  booted: false,
  introSeen: readStoredFlag("sp-intro-seen"),
  boot: () => set({ booted: true }),
  markIntroSeen: () => {
    try {
      localStorage.setItem("sp-intro-seen", "1");
    } catch {
      /* noop */
    }
    set({ introSeen: true });
  },

  quality: detectQuality(),
  reducedMotion: initialReduced,
  webgl: typeof window !== "undefined" ? (() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  })() : true,
  // recruiters mostly arrive on phones — default to the calm, scrollable
  // professional layout there; desktop keeps the full immersive universe.
  professionalMode: isTouchDevice() ? true : false,
  secretMode: readStoredFlag("sp-secret-mode"),
  setProfessionalMode: (v) => set({ professionalMode: v }),
  toggleProfessionalMode: () => set((s) => ({ professionalMode: !s.professionalMode })),
  setSecretMode: (v) => {
    try {
      localStorage.setItem("sp-secret-mode", v ? "1" : "0");
    } catch {
      /* noop */
    }
    set({ secretMode: v });
  },
  toggleReducedMotion: () =>
    set((s) => {
      try {
        localStorage.setItem("sp-reduced-motion", s.reducedMotion ? "0" : "1");
      } catch {
        /* noop */
      }
      return { reducedMotion: !s.reducedMotion };
    }),
  setReducedMotion: (v) => set({ reducedMotion: v }),

  soundOn: false,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setSound: (v) => set({ soundOn: v }),

  terminalOpen: false,
  setTerminalOpen: (v) => set({ terminalOpen: v }),
  astronomyOpen: false,
  setAstronomyOpen: (v) => set({ astronomyOpen: v }),
  recruiterOpen: false,
  setRecruiterOpen: (v) => set({ recruiterOpen: v }),

  orbitSpin: 0,
  setOrbitSpin: (deg) => set({ orbitSpin: Math.min(360, Math.max(0, deg)) }),

  focusedBody: null,
  setFocusedBody: (key) => set({ focusedBody: key }),
  holoCard: null,
  setHoloCard: (card) => set({ holoCard: card }),
  hoveredPlanet: null,
  setHoveredPlanet: (id) => set({ hoveredPlanet: id }),

  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),
  activeSection: "home",
  setActiveSection: (s) => set({ activeSection: s }),

  github: {
    user: null,
    repos: [],
    events: [],
    loading: true,
    source: "fallback",
    loadedAt: 0,
  },
  setGithubUser: (u) => set((s) => ({ github: { ...s.github, user: u } })),
  setGithubRepos: (r) => set((s) => ({ github: { ...s.github, repos: r } })),
  setGithubEvents: (e) => set((s) => ({ github: { ...s.github, events: e } })),
  setGithubLoading: (v) => set((s) => ({ github: { ...s.github, loading: v } })),
  setGithubSource: (src) => set((s) => ({ github: { ...s.github, source: src } })),

  systemMessage: null,
  systemMessageKey: 0,
  emitSystemMessage: (msg) => {
    const key = get().systemMessageKey + 1;
    set({ systemMessage: msg, systemMessageKey: key });
    setTimeout(() => {
      if (get().systemMessageKey === key) set({ systemMessage: null });
    }, 3600);
  },
  clearSystemMessage: () => set({ systemMessage: null }),
}));

export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (target: Element | number, opts?: object) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
