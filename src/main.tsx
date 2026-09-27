import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/experience-gate.css";
import "./components/SpotlightCard.css";
import "./sections/Showcase.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
