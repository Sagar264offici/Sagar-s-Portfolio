import { projects } from "../data/projects";
import { skillCategories } from "../data/skills";

export type BodyKind = "project" | "built" | "foundation" | "exploring" | "moon";

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

/* ── ORBIT 3: the stacks actually used on those websites ──
   (every technology that has a shipped project) */
const stackSkills = [...skillCategories[0].skills, ...skillCategories[1].skills].filter(
  (s) => s.projects.length > 0
);

const stackBodies: BodyDef[] = stackSkills.map((skill, i) => ({
  key: `stack:${skill.name}`,
  name: skill.name,
  kind: "built" as const,
  ring: 16.5,
  angle: spread(i, stackSkills.length, 0.3),
  speed: 0.036 * (1 + hash(skill.name) * 0.7),
  size: 0.5 + 0.3 * skill.confidence,
  color: "#22d3ee",
  opacity: 1,
  tilt: (hash(skill.name) - 0.5) * 0.2,
  seed: seedOf(skill.name),
  dwarf: false,
  skillName: skill.name,
  note: "Used on the project sites",
}));

/* ── ORBIT 4: foundation / system skills ──
   (Linux, Git, GitHub, Technical Documentation, C, C++ — project-less ones are dwarfs) */
const foundationSkills = skillCategories[1].skills;
const coreSkills = [
  ...skillCategories[0].skills.filter((s) => s.name === "Linux" || s.name === "Git" || s.name === "GitHub" || s.name === "Technical Documentation"),
  ...foundationSkills.filter((s) => s.name === "C" || s.name === "C++"),
];

const foundationBodies: BodyDef[] = coreSkills.map((skill, i) => ({
  key: `foundation:${skill.name}`,
  name: skill.name,
  kind: "foundation" as const,
  ring: 22.5,
  angle: spread(i, coreSkills.length, 0.32),
  speed: 0.026 * (1 + hash(skill.name) * 0.7),
  size: skill.projects.length > 0 ? 0.48 + 0.2 * skill.confidence : 0.34 + hash(skill.name) * 0.06,
  color: skill.projects.length > 0 ? "#60a5fa" : "#7d8597",
  opacity: skill.projects.length > 0 ? 1 : 0.8,
  tilt: (hash(skill.name) - 0.5) * 0.24,
  seed: seedOf(skill.name),
  dwarf: skill.projects.length === 0,
  skillName: skill.name,
  note: skill.projects.length > 0 ? "Foundation" : "Dwarf — no shipped project yet",
}));

/* ── ORBIT 5 (outer): exploring — all rendered as dwarf planets ── */
const exploringSkills = skillCategories[2].skills;

const exploringBodies: BodyDef[] = exploringSkills.map((skill, i) => ({
  key: `exploring:${skill.name}`,
  name: skill.name,
  kind: "exploring" as const,
  ring: 29.5,
  angle: spread(i, exploringSkills.length, 0.4),
  speed: 0.018 * (1 + hash(skill.name) * 0.8),
  size: 0.26 + hash(skill.name) * 0.12,
  color: "#a78bfa",
  opacity: 0.85,
  tilt: (hash(skill.name) - 0.5) * 0.34,
  seed: seedOf(skill.name),
  dwarf: true,
  skillName: skill.name,
  note: "Exploring — dwarf planet",
}));

export const bodyDefs: BodyDef[] = [
  moonBody,
  ...projectBodies,
  ...stackBodies,
  ...foundationBodies,
  ...exploringBodies,
];

export function findBody(key: string): BodyDef | undefined {
  return bodyDefs.find((b) => b.key === key);
}

/** ring radius → orbit styling */
export const orbitKinds: { ring: number; kind: BodyKind; color: string }[] = [
  { ring: 7.5, kind: "moon", color: "#94a3b8" },
  { ring: 11.5, kind: "project", color: "#fb923c" },
  { ring: 16.5, kind: "built", color: "#22d3ee" },
  { ring: 22.5, kind: "foundation", color: "#3b82f6" },
  { ring: 29.5, kind: "exploring", color: "#8b5cf6" },
];
