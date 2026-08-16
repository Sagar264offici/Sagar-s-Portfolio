export interface TerminalCommand {
  command: string;
  description: string;
}

export const terminalCommands: TerminalCommand[] = [
  { command: "whoami", description: "Who is behind this universe?" },
  { command: "skills", description: "View the skill solar system" },
  { command: "projects", description: "Travel to the project orbits" },
  { command: "github", description: "Open the GitHub data archive" },
  { command: "education", description: "Academic trajectory" },
  { command: "contact", description: "Open the contact system" },
  { command: "interests", description: "The human side" },
  { command: "status", description: "System diagnostics" },
  { command: "clear", description: "Clear the terminal" },
  { command: "help", description: "List available commands" },
];

export const whoamiOutput = [
  "Sagar Pathak",
  "Developer",
  "Builder",
  "Problem Solver",
  "Student",
  "Explorer",
  "",
  "BSc Information Technology — Final Year",
  "Rishikesh, Uttarakhand, India",
];

export const secretCommands: string[] = ["sudo", "sudo hire-sagar", "moon", "secret", "konami"];
