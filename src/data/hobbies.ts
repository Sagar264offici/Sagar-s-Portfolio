export interface Hobby {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  icon: string; // key into the HobbyMiniWorld renderer
  interactive: boolean;
}

export const hobbies: Hobby[] = [
  {
    id: "cricket",
    name: "Cricket",
    tagline: "Field geometry, played out loud.",
    description:
      "I even built a 3D cricket field simulation — spatial thinking meets sport. This mini-field lets you drag the ball across the oval.",
    color: "#fbbf24",
    icon: "cricket",
    interactive: true,
  },
  {
    id: "chess",
    name: "Chess",
    tagline: "Pattern recognition, offline.",
    description: "The original strategy game. Tap a piece, tap a square — the board lets you play a quick move.",
    color: "#e6e9f2",
    icon: "chess",
    interactive: true,
  },
  {
    id: "astronomy",
    name: "Astronomy",
    tagline: "The original career sun.",
    description:
      "Space is why the whole site orbits. Drag to spin this mini planet — the moon in the sky opens full Astronomy Mode.",
    color: "#22d3ee",
    icon: "astronomy",
    interactive: true,
  },
  {
    id: "coding",
    name: "Coding",
    tagline: "The terminal is a hobby too.",
    description: "Open the terminal (INSPECT SYSTEM) and actually run things — it's a hobby that builds things.",
    color: "#8b5cf6",
    icon: "coding",
    interactive: false,
  },
  {
    id: "study",
    name: "Studying",
    tagline: "Knowledge nodes, orbiting.",
    description: "BSc IT final year — learning notes orbit like satellites: 3D, game engines, systems thinking.",
    color: "#e879f9",
    icon: "study",
    interactive: true,
  },
];
