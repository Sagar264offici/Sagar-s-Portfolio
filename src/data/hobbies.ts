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
    tagline: "More than just a game.",
    description:
      "I play cricket regularly and it's probably my biggest hobby outside of code. I even built a 3D cricket field simulation because apparently I can't stop thinking about cricket even when I'm coding. Drag the ball around in this mini field.",
    color: "#fbbf24",
    icon: "cricket",
    interactive: true,
  },
  {
    id: "chess",
    name: "Chess",
    tagline: "A game of bad moves and recoveries.",
    description: "I started playing because I liked the idea of a game where one bad move can ruin everything. It's taught me to think a few steps ahead — or at least try to. Tap a piece and move it on this board.",
    color: "#e6e9f2",
    icon: "chess",
    interactive: true,
  },
  {
    id: "astronomy",
    name: "Astronomy",
    tagline: "The sky is the best screen.",
    description:
      "I like looking at the night sky — planets, stars, the Milky Way. I've photographed Saturn and the moon with a telescope I set up in Uttarakhand. This site is a solar system partly because of that. Drag to spin the planet, or open Astronomy Mode for the full gallery.",
    color: "#22d3ee",
    icon: "astronomy",
    interactive: true,
  },
  {
    id: "coding",
    name: "Coding",
    tagline: "When the hobby builds things.",
    description: "Coding started as coursework and turned into something I do for fun too. Some of my projects exist just because I wanted to try something. Open the terminal and run some commands.",
    color: "#8b5cf6",
    icon: "coding",
    interactive: false,
  },
  {
    id: "study",
    name: "Studying",
    tagline: "Learning never stops.",
    description: "Final year BSc IT — still learning new things regularly. Currently interested in 3D web development, game engines and building more interactive projects.",
    color: "#e879f9",
    icon: "study",
    interactive: true,
  },
];
