export type SkillTier = "built" | "foundation" | "exploring";

export interface Skill {
  name: string;
  tier: SkillTier;
  note: string;
  projects: string[];
  confidence: number; // 0..1 — drives visual scale, honestly mapped
}

export interface SkillCategory {
  id: SkillTier;
  label: string;
  headline: string;
  blurb: string;
  color: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "built",
    label: "BUILT WITH",
    headline: "What I Build With",
    blurb: "Technologies I have shipped real, working projects with.",
    color: "#22d3ee",
    skills: [
      {
        name: "TypeScript",
        tier: "built",
        note: "Used across interactive web projects — typed, state-driven applications.",
        projects: ["SPDC Quiz Battle", "Daitya Legion", "Rishikesh Greens Cafe"],
        confidence: 0.85,
      },
      {
        name: "React",
        tier: "built",
        note: "My primary interface layer — components, state and interaction design.",
        projects: ["SPDC Quiz Battle", "Daitya Legion", "Cricket Field Simulation"],
        confidence: 0.85,
      },
      {
        name: "Upstash Redis",
        tier: "built",
        note: "Serverless realtime persistence — powers the quiz platform's live state.",
        projects: ["SPDC Quiz Battle"],
        confidence: 0.7,
      },
      {
        name: "Linux",
        tier: "built",
        note: "Daily driver and deployment environment for servers and tooling.",
        projects: [],
        confidence: 0.72,
      },
      {
        name: "Git",
        tier: "built",
        note: "Version control for every project — branches, history and collaboration.",
        projects: ["All projects"],
        confidence: 0.8,
      },
      {
        name: "GitHub",
        tier: "built",
        note: "Where my public engineering archive lives.",
        projects: ["All projects"],
        confidence: 0.8,
      },
      {
        name: "Technical Documentation",
        tier: "built",
        note: "I document systems so other people can actually use them.",
        projects: [],
        confidence: 0.68,
      },
    ],
  },
  {
    id: "foundation",
    label: "FOUNDATION",
    headline: "The Foundation Layer",
    blurb: "The core web fundamentals everything above is built on.",
    color: "#3b82f6",
    skills: [
      { name: "JavaScript", tier: "foundation", note: "The language of the web — used daily.", projects: ["All projects"], confidence: 0.82 },
      { name: "HTML", tier: "foundation", note: "Semantic, accessible structure.", projects: ["All projects"], confidence: 0.85 },
      { name: "CSS", tier: "foundation", note: "Layout, design systems and responsive styling.", projects: ["All projects"], confidence: 0.82 },
      { name: "REST APIs", tier: "foundation", note: "Building and consuming API-driven applications.", projects: ["SPDC Quiz Battle"], confidence: 0.7 },
      { name: "Node.js", tier: "foundation", note: "JavaScript beyond the browser — tooling and services.", projects: ["SPDC Quiz Battle"], confidence: 0.65 },
      { name: "Vercel", tier: "foundation", note: "My deployment pipeline for live projects.", projects: ["All live projects"], confidence: 0.78 },
      { name: "C", tier: "foundation", note: "Systems thinking from my academic foundation.", projects: [], confidence: 0.55 },
      { name: "C++", tier: "foundation", note: "Academic and experimental systems programming.", projects: [], confidence: 0.5 },
    ],
  },
  {
    id: "exploring",
    label: "EXPLORING",
    headline: "What I'm Exploring",
    blurb: "Tools I am actively learning. Honest label: not yet shipped with.",
    color: "#8b5cf6",
    skills: [
      { name: "Flutter", tier: "exploring", note: "Cross-platform UI experiments in progress.", projects: [], confidence: 0.35 },
      { name: "Dart", tier: "exploring", note: "Learning the language behind Flutter.", projects: [], confidence: 0.3 },
      { name: "Unity", tier: "exploring", note: "Game engine experiments — unreleased lab.", projects: [], confidence: 0.3 },
      { name: "Blender", tier: "exploring", note: "3D modelling and scene building.", projects: [], confidence: 0.3 },
    ],
  },
];

export const allSkills = skillCategories.flatMap((c) => c.skills);
