import { useEffect } from "react";
import Lenis from "lenis";
import { usePortfolioStore, SECTION_IDS, type SectionId } from "../store/portfolioStore";

export function useLenis(): void {
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const professionalMode = usePortfolioStore((s) => s.professionalMode);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !professionalMode,
      touchMultiplier: 1.4,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const updateScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      usePortfolioStore.getState().setScrollProgress(progress);

      // Active section from element positions.
      let active: SectionId = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          active = id;
        }
      }
      usePortfolioStore.getState().setActiveSection(active);
    };

    lenis.on("scroll", updateScroll);
    updateScroll();

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, [reducedMotion, professionalMode]);

  // Native scroll tracking when lenis is disabled (reduced motion / pro mode).
  useEffect(() => {
    if (!reducedMotion) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      usePortfolioStore.getState().setScrollProgress(progress);
      let active: SectionId = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) active = id;
      }
      usePortfolioStore.getState().setActiveSection(active);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);
}
