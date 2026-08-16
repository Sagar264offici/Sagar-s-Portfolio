export interface JourneyStep {
  id: string;
  year: string;
  title: string;
  detail: string;
  kind: "origin" | "education" | "build" | "current" | "next";
}

export const journey: JourneyStep[] = [
  {
    id: "born",
    year: "2006",
    title: "Origin",
    detail: "Born in Uttarakhand, India. Curious about how things work from the very start.",
    kind: "origin",
  },
  {
    id: "school",
    year: "School",
    title: "PCM Background",
    detail: "Completed Class 12 with Physics, Chemistry and Mathematics — the analytical foundation.",
    kind: "education",
  },
  {
    id: "bsc-it",
    year: "BSc IT",
    title: "Entered Information Technology",
    detail: "Started a Bachelor of Science in Information Technology at Sri Dev Suman Uttarakhand University.",
    kind: "education",
  },
  {
    id: "web-dev",
    year: "Then",
    title: "Web Development",
    detail: "Started building practical web experiences — real projects, real deployments, real users.",
    kind: "build",
  },
  {
    id: "experiments",
    year: "Now",
    title: "Interactive Experiments",
    detail: "Moved into simulations and interactive experiences — 3D, realtime, spatial.",
    kind: "build",
  },
  {
    id: "current",
    year: "Current",
    title: "Final Year",
    detail: "BSc Information Technology — final year. Building while learning.",
    kind: "current",
  },
  {
    id: "next",
    year: "Next",
    title: "Going Deeper",
    detail: "Advanced web development, 3D development, Unity, Blender and interactive experiences.",
    kind: "next",
  },
];
