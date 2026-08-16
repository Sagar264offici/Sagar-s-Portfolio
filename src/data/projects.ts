export type ProjectCategory =
  | "Interactive Web Application"
  | "Restaurant / Business Web Experience"
  | "Cricket Team / Community Web Experience"
  | "Clinic Management / Service Website Prototype"
  | "3D Interactive Simulation";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  purpose: string;
  whyBuilt: string;
  category: ProjectCategory;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  status: "LIVE" | "PROTOTYPE" | "EXPERIMENT";
  visualTheme: string;
  /** icon key rendered on the floating 3D planet chip */
  icon: "quiz" | "cafe" | "legion" | "dentist" | "cricket";
  featured: boolean;
  capabilities: string[];
  emphasis: string[];
}

export const projects: Project[] = [
  {
    id: "spdc-quiz-battle",
    title: "SPDC Quiz Battle",
    slug: "spdc-quiz-battle",
    description:
      "A highly interactive real-time quiz platform built with TypeScript, React and Upstash Redis — a state-driven battle arena where every answer is an event.",
    purpose:
      "A competitive quiz platform designed to make learning feel like a live match: questions, scores and momentum all update in real time.",
    whyBuilt:
      "I wanted to prove that a quiz could be engineered like a real-time application — with a state machine, an Upstash-backed realtime layer and a UI that reacts instantly to every interaction.",
    category: "Interactive Web Application",
    technologies: ["TypeScript", "React", "Upstash Redis", "Vercel", "State-Driven UI", "REST API"],
    liveUrl: "https://spdcquiz.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/QuizBattle",
    status: "LIVE",
    visualTheme: "cyan",
    icon: "quiz",
    featured: true,
    capabilities: ["Realtime interaction", "State-driven UI", "Upstash Redis persistence", "Web application architecture"],
    emphasis: ["TypeScript", "React", "Upstash Redis", "realtime interaction", "state-driven UI", "web application architecture"],
  },
  {
    id: "rishikesh-greens-cafe",
    title: "Rishikesh Greens Cafe",
    slug: "rishikesh-greens-cafe",
    description:
      "A product-oriented restaurant web experience — a modern, responsive frontend that sells the atmosphere before the food.",
    purpose:
      "A business-facing website for a cafe in Rishikesh: menu-first design, warm visual identity and a responsive layout built to convert visitors into customers.",
    whyBuilt:
      "Restaurants live on presentation. I treated the cafe itself as a product and built an interface that communicates its character before a single dish is ordered.",
    category: "Restaurant / Business Web Experience",
    technologies: ["React", "TypeScript", "CSS", "Responsive Design", "Vercel"],
    liveUrl: "https://rishikesh-greens-cafe.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/01_Restraunt_Web_Project",
    status: "LIVE",
    visualTheme: "amber",
    icon: "cafe",
    featured: true,
    capabilities: ["Product-oriented UI", "Restaurant experience", "Responsive frontend", "Modern interface"],
    emphasis: ["product-oriented UI", "restaurant experience", "responsive frontend", "modern interface", "deployment"],
  },
  {
    id: "daitya-legion",
    title: "Daitya Legion",
    slug: "daitya-legion",
    description:
      "A cricket team landing page — heavy branding, visual design and an interactive presentation for a crew that plays as one.",
    purpose:
      "A landing experience for our cricket team: identity-first design, animated presentation and a community-oriented web presence.",
    whyBuilt:
      "Cricket teams live and die on identity. I wanted to show that I can build branding-forward experiences that make a team feel like a unit on and off the pitch.",
    category: "Cricket Team / Community Web Experience",
    technologies: ["React", "TypeScript", "CSS", "Branding", "Vercel"],
    liveUrl: "https://daitya-legion.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/Daitya_Legion_Landing_Page",
    status: "LIVE",
    visualTheme: "magenta",
    icon: "legion",
    featured: true,
    capabilities: ["Team branding", "Visual design", "Interactive presentation", "Community-oriented web experience"],
    emphasis: ["team branding", "visual design", "interactive presentation", "community-oriented web experience"],
  },
  {
    id: "dentist-clinic-prototype",
    title: "Dentist Clinic Prototype",
    slug: "dentist-clinic-prototype",
    description:
      "A clinic management / service website prototype — structured information architecture and a calm, trustworthy service-oriented UX.",
    purpose:
      "A prototype for a dental clinic: services, appointments and practice information organized so patients can find exactly what they need in seconds.",
    whyBuilt:
      "Healthcare interfaces need trust more than flash. This project is about restrained layout, clear hierarchy and making a service feel dependable.",
    category: "Clinic Management / Service Website Prototype",
    technologies: ["React", "TypeScript", "CSS", "Responsive Layout", "Vercel"],
    liveUrl: "https://dentist-clinic-prototype.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/dentist-clinic-prototype",
    status: "PROTOTYPE",
    visualTheme: "blue",
    icon: "dentist",
    featured: true,
    capabilities: ["Product interface", "Service-oriented UX", "Responsive layout", "Structured information architecture"],
    emphasis: ["product interface", "service-oriented UX", "responsive layout", "structured information architecture"],
  },
  {
    id: "cricket-field-simulation",
    title: "Cricket Field Simulation",
    slug: "cricket-field-simulation",
    description:
      "A 3D interactive cricket field visualization — spatial interaction, a controllable camera and a field you can actually explore.",
    purpose:
      "A 3D cricket field you can fly around: players positioned on the oval, spatial navigation and a view that turns a sport into geometry.",
    whyBuilt:
      "I am not limited to CRUD and dashboards. This project exists to prove I can build spatial, interactive 3D experiences — not just pages.",
    category: "3D Interactive Simulation",
    technologies: ["Three.js", "3D Camera", "Spatial Interaction", "TypeScript", "Vercel"],
    liveUrl: "https://cricket-field-simulation.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/Cricket_Field_Simulation",
    status: "LIVE",
    visualTheme: "violet",
    icon: "cricket",
    featured: true,
    capabilities: ["Interactive field visualization", "3D camera", "Spatial interaction", "Sports visualization"],
    emphasis: ["interactive field visualization", "3D camera", "spatial interaction", "sports visualization"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
