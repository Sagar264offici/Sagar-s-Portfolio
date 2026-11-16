import { projects } from "../data/projects";

export type BodyKind = "project" | "moon";

export interface BodyDef {
  key: string;
  name: string;
  kind: BodyKind;
  ring: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  tilt: number;
  /** fixed, deterministic texture seed — a planet always looks the same */
  seed: number;
  /** skills with no shipped project render as small, dim dwarf planets */
  dwarf: boolean;
  /** real GLB from public/models/ — used when present, procedural surface otherwise */
  model?: string;
  projectId?: string;
  skillName?: string;
  note?: string;
}

const TAU = Math.PI * 2;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h / 100000;
}

/** constant per-body seed — deterministic across reloads */
function seedOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h + 7;
}

/** even angular placement with tiny jitter so planets never visually collide */
function spread(index: number, total: number, jitter = 0.13): number {
  const base = (index / total) * TAU;
  const j = (hash(`j${index}-${total}`) - 0.5) * jitter * 2;
  return base + j;
}

const themeColors: Record<string, string> = {
  cyan: "#22d3ee",
  amber: "#fbbf24",
  magenta: "#e879f9",
  blue: "#60a5fa",
  violet: "#a78bfa",
  nightlight: "#4f6fff",
};

/* ── ORBIT 1 (inner): the moon of the career sun ── */
const moonBody: BodyDef = {
  key: "moon",
  name: "The Moon",
  kind: "moon",
  ring: 7.5,
  angle: 2.1,
  speed: 0.028,
  size: 0.34,
  color: "#cbd5e1",
  opacity: 1,
  tilt: 0.14,
  seed: seedOf("moon"),
  dwarf: false,
  model: "moon.glb",
  note: "Astronomy mode",
};

/* real 3D model per deployed project — the GLBs live in public/models/ */
const projectModels: Record<string, string> = {
  "spdc-quiz-battle": "jupiter.glb",
  "rishikesh-greens-cafe": "earth.glb",
  "daitya-legion": "mars.glb",
  "dentist-clinic-prototype": "uranus.glb",
  "cricket-field-simulation": "saturn.glb",
  nightlight: "neptune.glb",
  "sagar-web-package": "mercury.glb",
};

/* ── ORBIT 2: the deployed projects — ringed main worlds ── */
const projectBodies: BodyDef[] = projects.map((p, i) => ({
  key: `project:${p.id}`,
  name: p.title,
  kind: "project" as const,
  ring: 11.5,
  angle: spread(i, projects.length, 0.24),
  speed: 0.045 + hash(p.id) * 0.04,
  size: 0.85 + hash(p.id) * 0.2,
  color: themeColors[p.visualTheme] || themeColors.cyan,
  opacity: 1,
  tilt: (hash(p.id) - 0.5) * 0.22,
  seed: seedOf(p.id),
  dwarf: false,
  model: projectModels[p.id],
  projectId: p.id,
  note: p.category,
}));

/* Keep the 3D universe focused: the planets represent shipped work only.
   Skills and tools stay in the dedicated Skills section instead of filling
   every remaining orbit with tiny, overlapping bodies. */
export const bodyDefs: BodyDef[] = [moonBody, ...projectBodies];

export function findBody(key: string): BodyDef | undefined {
  return bodyDefs.find((b) => b.key === key);
}

/** ring radius → orbit styling */
export const orbitKinds: { ring: number; kind: BodyKind; color: string }[] = [
  { ring: 7.5, kind: "moon", color: "#94a3b8" },
  { ring: 11.5, kind: "project", color: "#fb923c" },
];
