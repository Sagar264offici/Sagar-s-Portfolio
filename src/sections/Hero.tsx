import { motion } from "framer-motion";
import { ChevronDown, TerminalSquare } from "lucide-react";
import { usePortfolioStore, scrollToSection } from "../store/portfolioStore";
import { audio } from "../lib/audio";

const roles = ["Developer", "Builder", "Problem Solver", "Creative Technologist"];

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const setTerminalOpen = usePortfolioStore((s) => s.setTerminalOpen);
  const professional = usePortfolioStore((s) => s.professionalMode);

  return (
    <section id="home" className="hero">
      <div className="hero-copy">
        <motion.div {...fade(0.15)} className="tag">
          INTERACTIVE PORTFOLIO — THE CAREER UNIVERSE
        </motion.div>

        <motion.h1 {...fade(0.25)} className="hero-name">
          SAGAR
          <span className="ln">PATHAK</span>
        </motion.h1>

        <motion.p {...fade(0.4)} className="hero-tagline">
          I build things that <span className="text-grad">shouldn't be this interactive.</span>
        </motion.p>

        <motion.div {...fade(0.5)} className="hero-roles">
          {roles.map((r) => (
            <span key={r} className="chip">
              {r}
            </span>
          ))}
        </motion.div>

        <motion.p {...fade(0.6)} className="hero-desc">
          BSc Information Technology student building interactive web experiences, experiments, simulations and
          digital products from Rishikesh, Uttarakhand.
        </motion.p>

        <motion.div {...fade(0.7)} className="hero-ctas">
          <button
            className="btn btn-primary"
            data-cursor-label="ENTER"
            onClick={() => {
              audio.blip("select");
              scrollToSection("about");
            }}
          >
            ENTER MY UNIVERSE
          </button>
          <button
            className="btn"
            data-cursor-label="BUILD"
            onClick={() => {
              audio.blip("click");
              scrollToSection("projects");
            }}
          >
            SEE WHAT I BUILT
          </button>
          <button
            className="btn btn-amber"
            data-cursor-label="INSPECT"
            onClick={() => {
              audio.blip("select");
              setTerminalOpen(true);
            }}
          >
            <TerminalSquare size={14} /> INSPECT SYSTEM
          </button>
        </motion.div>
      </div>

      {!professional && (
        <div className="hero-scroll-hint" aria-hidden>
          <span>SCROLL TO TRAVEL</span>
          <div className="line" />
          <ChevronDown size={14} style={{ color: "var(--cyan)", animation: "floaty 2.2s ease-in-out infinite" }} />
        </div>
      )}
    </section>
  );
}
