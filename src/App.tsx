import { useEffect } from "react";
import { UserRound } from "lucide-react";
import { UniverseCanvas } from "./three/UniverseCanvas";
import { FallbackBackground } from "./components/FallbackBackground";
import { Loader } from "./components/Loader";
import { Intro } from "./components/Intro";
import { Cursor } from "./components/Cursor";
import { Navbar } from "./components/Navbar";
import { SideRail } from "./components/SideRail";
import { OrbitNav } from "./components/OrbitNav";
import { Hud } from "./components/Hud";
import { Terminal } from "./components/Terminal";
import { HoloPanel } from "./components/HoloPanel";
import { RecruiterModal } from "./components/RecruiterModal";
import { AstronomyOverlay } from "./components/AstronomyOverlay";
import { PlanetTooltip } from "./components/PlanetTooltip";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Projects } from "./sections/Projects";
import { Skills } from "./sections/Skills";
import { GitHubSection } from "./sections/GitHubSection";
import { Journey } from "./sections/Journey";
import { Hobbies } from "./sections/Hobbies";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { useLenis } from "./hooks/useLenis";
import { useKonami } from "./hooks/useKonami";
import { useGithubData } from "./hooks/useGithubData";
import { usePortfolioStore } from "./store/portfolioStore";
import { audio } from "./lib/audio";

export default function App() {
  const booted = usePortfolioStore((s) => s.booted);
  const introSeen = usePortfolioStore((s) => s.introSeen);
  const soundOn = usePortfolioStore((s) => s.soundOn);
  const professionalMode = usePortfolioStore((s) => s.professionalMode);
  const secretMode = usePortfolioStore((s) => s.secretMode);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const webgl = usePortfolioStore((s) => s.webgl);
  const setReducedMotion = usePortfolioStore((s) => s.setReducedMotion);
  const setRecruiterOpen = usePortfolioStore((s) => s.setRecruiterOpen);

  useLenis();
  useKonami();
  useGithubData();

  // Root data attributes for CSS modes.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pro = professionalMode ? "1" : "0";
    root.dataset.secret = secretMode ? "1" : "0";
    root.dataset.reduced = reducedMotion ? "1" : "0";
  }, [professionalMode, secretMode, reducedMotion]);

  // Follow prefers-reduced-motion unless the user explicitly overrode it.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stored = (() => {
      try {
        return localStorage.getItem("sp-reduced-motion");
      } catch {
        return null;
      }
    })();
    if (stored !== null) return;
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [setReducedMotion]);

  // Sound engine lifecycle.
  useEffect(() => {
    if (soundOn) void audio.enable();
    else audio.disable();
    return () => audio.disable();
  }, [soundOn]);

  // Quiet hover blips on interactive chrome.
  useEffect(() => {
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest?.(".btn, .nav-link, .nav-toggle, .rail-dot, .contact-card, .proj-card, .repo-card")) {
        audio.blip("hover");
      }
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  // Ensure we start at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Loader />
      {booted && <Intro />}

      <div className="canvas-wrap">{webgl ? <UniverseCanvas /> : <FallbackBackground />}</div>

      <Navbar />
      <SideRail />
      <OrbitNav />
      <Hud />

      <main className="scroll-content">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <GitHubSection />
        <Journey />
        <Hobbies />
        <Contact />
        <Footer />
      </main>

      <button
        className="float-hr"
        onClick={() => {
          setRecruiterOpen(true);
          audio.blip("select");
        }}
        data-cursor-label="PROFILE"
      >
        <UserRound size={13} /> FOR RECRUITERS
      </button>

      <Terminal />
      <HoloPanel />
      <RecruiterModal />
      <AstronomyOverlay />
      <PlanetTooltip />
      <Cursor />
    </>
  );
}
