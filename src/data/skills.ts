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
    headline: "What I've shipped with",
    blurb: "Technologies I've actually used in real, deployed projects.",
    color: "#22d3ee",
    skills: [
      {
        name: "TypeScript",
        tier: "built",
        note: "Used in most of my recent projects. I like the type safety — it catches a lot of bugs early.",
        projects: ["SPDC Quiz Battle", "Daitya Legion", "Rishikesh Greens Cafe"],
        confidence: 0.85,
      },
      {
        name: "React",
        tier: "built",
        note: "Used in most of my web projects. Comfortable building components, handling state and managing interactions.",
        projects: ["SPDC Quiz Battle", "Daitya Legion", "Cricket Field Simulation"],
        confidence: 0.85,
      },
      {
        name: "Upstash Redis",
        tier: "built",
        note: "Used it for the quiz platform's real-time state. Serverless and works well with Vercel.",
        projects: ["SPDC Quiz Battle"],
        confidence: 0.7,
      },
      {
        name: "Linux",
        tier: "built",
        note: "My daily OS. Use it for development, tooling and general computing.",
        projects: [],
        confidence: 0.72,
      },
      {
        name: "Git",
        tier: "built",
        note: "Version control for every project. Use branches, commits and history regularly.",
        projects: ["All projects"],
        confidence: 0.8,
      },
      {
        name: "GitHub",
        tier: "built",
        note: "Where all my public projects live. Also use it for issues and collaboration.",
        projects: ["All projects"],
        confidence: 0.8,
      },
      {
        name: "Technical Documentation",
        tier: "built",
        note: "I try to document projects so other people can actually use them.",
        projects: [],
        confidence: 0.68,
      },
    ],
  },
  {
    id: "foundation",
    label: "FOUNDATION",
    headline: "The basics",
    blurb: "Core web technologies everything else is built on.",
    color: "#3b82f6",
    skills: [
      { name: "JavaScript", tier: "foundation", note: "One of the main things I use when building for the web.", projects: ["All projects"], confidence: 0.82 },
      { name: "HTML", tier: "foundation", note: "Semantic, accessible markup — the base of every page.", projects: ["All projects"], confidence: 0.85 },
      { name: "CSS", tier: "foundation", note: "Layout, responsive design and making things look right.", projects: ["All projects"], confidence: 0.82 },
      { name: "REST APIs", tier: "foundation", note: "Building and consuming APIs — used in the quiz platform.", projects: ["SPDC Quiz Battle"], confidence: 0.7 },
      { name: "Node.js", tier: "foundation", note: "JavaScript outside the browser. Use it for tooling and development.", projects: ["SPDC Quiz Battle"], confidence: 0.65 },
      { name: "Vercel", tier: "foundation", note: "Where most of my live projects are deployed.", projects: ["All live projects"], confidence: 0.78 },
      { name: "C", tier: "foundation", note: "Learned it during my degree. Basic systems-level programming.", projects: [], confidence: 0.55 },
      { name: "C++", tier: "foundation", note: "Used in academics and some experiments. Not my main language.", projects: [], confidence: 0.5 },
    ],
  },
  {
    id: "exploring",
    label: "EXPLORING",
    headline: "What I'm exploring",
    blurb: "Things I'm actively learning. None of these have been used in a shipped project yet.",
    color: "#8b5cf6",
    skills: [
      { name: "Flutter", tier: "exploring", note: "Building some cross-platform UI experiments. Still learning the framework.", projects: [], confidence: 0.35 },
      { name: "Dart", tier: "exploring", note: "The language behind Flutter. Learning it alongside the framework.", projects: [], confidence: 0.3 },
      { name: "Unity", tier: "exploring", note: "Game engine experiments. Some prototypes, nothing released yet.", projects: [], confidence: 0.3 },
      { name: "Blender", tier: "exploring", note: "3D modelling and scene building. Learning the basics.", projects: [], confidence: 0.3 },
    ],
  },
];

export const allSkills = skillCategories.flatMap((c) => c.skills);
