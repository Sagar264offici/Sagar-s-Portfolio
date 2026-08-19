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
    title: "Born in Uttarakhand",
    detail: "Grew up in Rishikesh. Was always curious about how things work.",
    kind: "origin",
  },
  {
    id: "school",
    year: "School",
    title: "Class 12 — PCM",
    detail: "Finished school with Physics, Chemistry and Math. Didn't know yet that I'd end up building websites.",
    kind: "education",
  },
  {
    id: "bsc-it",
    year: "BSc IT",
    title: "Started BSc IT",
    detail: "Enrolled in BSc Information Technology at Sri Dev Suman Uttarakhand University. This is where things started clicking.",
    kind: "education",
  },
  {
    id: "web-dev",
    year: "Then",
    title: "Started building for the web",
    detail: "Got into web development and started building real projects. Deployed them, shared them, learned from the process.",
    kind: "build",
  },
  {
    id: "experiments",
    year: "Now",
    title: "3D and interactive experiments",
    detail: "Moved into Three.js, simulations and spatial interactions. Still experimenting and figuring out what direction to take.",
    kind: "build",
  },
  {
    id: "current",
    year: "Current",
    title: "Final year of BSc IT",
    detail: "Wrapping up my degree. Building projects alongside coursework.",
    kind: "current",
  },
  {
    id: "next",
    year: "Next",
    title: "Still figuring it out",
    detail: "Want to go deeper into web development, 3D work, game engines and interactive experiences. No clear plan yet, just building and learning.",
    kind: "next",
  },
];
