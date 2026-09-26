export type ProjectCategory =
  | "Interactive Web Application"
  | "Restaurant / Business Web Experience"
  | "Cricket Team / Community Web Experience"
  | "Clinic Management / Service Website Prototype"
  | "3D Interactive Simulation"
  | "Music Experience";

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
  icon: "quiz" | "cafe" | "legion" | "dentist" | "cricket" | "music" | "package" | "institute";
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
      "A real-time quiz platform I built for a college competition. Teams play together, scores update live, and the whole thing runs on React, TypeScript and Upstash Redis.",
    purpose:
      "Built this for an SPDC college quiz event. The idea was to have a live quiz where multiple teams compete at the same time — questions, scores and timers all update in real time.",
    whyBuilt:
      "Quizzes at college were always organized manually. I wanted to make something that handles the live state, tracks team answers and updates scores while everyone is playing. It was also a good excuse to work with Upstash Redis for serverless state management.",
    category: "Interactive Web Application",
    technologies: ["TypeScript", "React", "Upstash Redis", "Vercel", "State-Driven UI", "REST API"],
    liveUrl: "https://spdcquiz.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/QuizBattle",
    status: "LIVE",
    visualTheme: "cyan",
    icon: "quiz",
    featured: true,
    capabilities: ["Real-time quiz state", "Live score tracking", "Team-based play", "Upstash Redis for persistence"],
    emphasis: ["TypeScript", "React", "Upstash Redis", "real-time state", "REST API"],
  },
  {
    id: "rishikesh-greens-cafe",
    title: "Rishikesh Greens Cafe",
    slug: "rishikesh-greens-cafe",
    description:
      "A website concept for a cafe in Rishikesh. The main goal was simple: make the place look good online and make the important information easy to find.",
    purpose:
      "A responsive restaurant website for Rishikesh Greens Cafe. Menu, location, vibe — all on one page. Designed to look good on phones and desktops.",
    whyBuilt:
      "I wanted to practice building a real-world business website. A cafe is a good subject because the site needs to feel inviting while still being functional. It was also a chance to work on responsive layout and visual design.",
    category: "Restaurant / Business Web Experience",
    technologies: ["React", "TypeScript", "CSS", "Responsive Design", "Vercel"],
    liveUrl: "https://rishikesh-greens-cafe.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/01_Restraunt_Web_Project",
    status: "LIVE",
    visualTheme: "amber",
    icon: "cafe",
    featured: true,
    capabilities: ["Responsive layout", "Menu and info pages", "Mobile-friendly", "Clean visual design"],
    emphasis: ["React", "TypeScript", "CSS", "responsive design", "business website"],
  },
  {
    id: "daitya-legion",
    title: "Daitya Legion",
    slug: "daitya-legion",
    description:
      "A landing page for our cricket team. Heavy on branding and visual presentation — the kind of page that makes a local team look like they have their own website.",
    purpose:
      "A team landing page for Daitya Legion — our cricket team. Focused on identity, visual design and giving the team a proper web presence.",
    whyBuilt:
      "Our team didn't have a proper website, so I built one. It was a good project for working on branding, visual design and making something that represents a group of people rather than just a product.",
    category: "Cricket Team / Community Web Experience",
    technologies: ["React", "TypeScript", "CSS", "Branding", "Vercel"],
    liveUrl: "https://daitya-legion.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/Daitya_Legion_Landing_Page",
    status: "LIVE",
    visualTheme: "magenta",
    icon: "legion",
    featured: true,
    capabilities: ["Team identity and branding", "Animated landing page", "Visual design", "Responsive layout"],
    emphasis: ["React", "TypeScript", "CSS", "branding", "visual design"],
  },
  {
    id: "dentist-clinic-prototype",
    title: "Dentist Clinic Prototype",
    slug: "dentist-clinic-prototype",
    description:
      "A prototype for a dental clinic website. Services, appointment info and practice details — all organized so a patient can find what they need quickly.",
    purpose:
      "A clinic website prototype focused on services, appointments and practice information. Built with a calm, clean layout that prioritizes readability.",
    whyBuilt:
      "Healthcare websites have a different feel from other projects. Everything needs to look trustworthy and be easy to navigate. This was a good exercise in building something where clarity matters more than flash.",
    category: "Clinic Management / Service Website Prototype",
    technologies: ["React", "TypeScript", "CSS", "Responsive Layout", "Vercel"],
    liveUrl: "https://dentist-clinic-prototype.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/dentist-clinic-prototype",
    status: "PROTOTYPE",
    visualTheme: "blue",
    icon: "dentist",
    featured: true,
    capabilities: ["Service and appointment pages", "Clean information hierarchy", "Responsive layout", "Calm, readable design"],
    emphasis: ["React", "TypeScript", "CSS", "responsive layout", "prototype"],
  },
  {
    id: "cricket-field-simulation",
    title: "Cricket Field Simulation",
    slug: "cricket-field-simulation",
    description:
      "This started as a Three.js experiment. I wanted to see how far I could take a cricket field in 3D — so I added a controllable camera and made the field something you can move around instead of just looking at.",
    purpose:
      "A 3D cricket field you can explore. Players are positioned on the oval, the camera can be moved around, and you get a spatial view of the field instead of a flat diagram.",
    whyBuilt:
      "I've always liked cricket and I've been learning Three.js, so this was a natural combination. It started as a small experiment and grew into something where you can actually navigate the field in 3D. It pushed me to understand camera systems and spatial interaction.",
    category: "3D Interactive Simulation",
    technologies: ["Three.js", "3D Camera", "Spatial Interaction", "TypeScript", "Vercel"],
    liveUrl: "https://cricket-field-simulation.vercel.app/",
    githubUrl: "https://github.com/Sagar264offici/Cricket_Field_Simulation",
    status: "LIVE",
    visualTheme: "violet",
    icon: "cricket",
    featured: true,
    capabilities: ["3D cricket field", "Controllable camera", "Player positioning", "Spatial navigation"],
    emphasis: ["Three.js", "3D camera", "spatial interaction", "interactive visualization"],
  },
  {
    id: "nightlight",
    title: "NightLight",
    slug: "nightlight",
    description:
      "An immersive music experience built around atmosphere, emotion and sound.",
    purpose:
      "A fully immersive Android music experience with mood-aware recommendations, atmospheric visual design, and cinematic interaction — built to feel like listening inside a living, breathing night.",
    whyBuilt:
      "Music apps often feel clinical. I wanted to create something where the interface itself becomes part of the listening experience — rain, clouds, neon glow, and darkness as design language. NightLight is my most atmospheric project: a music player that reacts to mood and atmosphere rather than just playing tracks.",
    category: "Music Experience",
    technologies: ["Android", "Java", "Media3", "TypeScript", "Hono", "MongoDB"],
    liveUrl: "https://nightlight-music.vercel.app/",
    githubUrl: "",
    status: "LIVE",
    visualTheme: "nightlight",
    icon: "music",
    featured: true,
    capabilities: [
      "Immersive music player",
      "Smart shuffle",
      "Mood-aware recommendations",
      "Lyrics experience",
      "Background playback",
      "Playlist importing",
      "Listen-together sessions",
      "Atmospheric visual design",
    ],
    emphasis: ["Android", "Media3", "atmospheric UI", "mood engine", "cinematic interaction"],
  },
  {
    id: "web-development-packages",
    title: "Web Development Packages",
    slug: "web-development-packages",
    description:
      "A package catalogue for website development. Five fixed-scope packages — Starter through Custom Platform — with a line-by-line comparison, infrastructure scope, delivery model and a quote flow. One-time builds with full source handover.",
    purpose:
      "A catalogue site presenting five website development packages with exactly what each tier includes, how delivery and handover work, and how to request a written quote.",
    whyBuilt:
      "Service pricing is usually vague. This puts every package, price, inclusion and delivery term in writing — comparison table, infrastructure scope and handover terms included.",
    category: "Interactive Web Application",
    technologies: ["React", "TypeScript", "Responsive Design", "Vercel"],
    liveUrl: "https://web-dev-package.vercel.app/",
    githubUrl: "",
    status: "LIVE",
    visualTheme: "violet",
    icon: "package",
    featured: true,
    capabilities: ["Five fixed-scope packages", "Line-by-line comparison table", "Infrastructure and handover scope", "Quote enquiry flow"],
    emphasis: ["React", "TypeScript", "comparison table", "fixed-scope packages"],
  },
  {
    id: "vikas-it-institute",
    title: "Vikas IT Institute",
    slug: "vikas-it-institute",
    description:
      "A bilingual Hindi/English website for Vikas IT Institute in Rishikesh — computer courses, programming, web development and digital-skills training, with course listings and a search-ready structure.",
    purpose:
      "The institute's web presence: courses, training programs and institute information in Hindi and English, built as a modern single-page experience.",
    whyBuilt:
      "A local institute needs a site students and parents can actually read — in their own language. Bilingual interface, course catalogue and enquiry paths, optimized for phones.",
    category: "Interactive Web Application",
    technologies: ["React", "TypeScript", "Vite", "Responsive Design", "Vercel"],
    liveUrl: "https://vikas-institute.vercel.app/",
    githubUrl: "",
    status: "LIVE",
    visualTheme: "blue",
    icon: "institute",
    featured: true,
    capabilities: ["Bilingual Hindi/English interface", "Course catalogue and programs", "SEO metadata and structured data", "Mobile-first responsive layout"],
    emphasis: ["React", "bilingual UI", "course catalogue", "SEO"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
