import { useEffect } from "react";
import Lenis from "lenis";
import { usePortfolioStore, SECTION_IDS, type SectionId } from "../store/portfolioStore";
import { isTouchDevice } from "../lib/device";

/** Update scroll progress + active section from the current scroll position. */
function trackScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  usePortfolioStore.getState().setScrollProgress(progress);

  let active: SectionId = "home";
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
      active = id;
    }
  }
  usePortfolioStore.getState().setActiveSection(active);
}

export function useLenis(): void {
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const professionalMode = usePortfolioStore((s) => s.professionalMode);

  // Phones get pure native scrolling — Lenis's wheel smoothing is pointless on
  // touch, and its constant rAF loop only adds jank to the WebGL page.
  // Reduced-motion users get native scrolling too, and professional mode is
  // ALWAYS native so the calm recruiter layout can never fight the page.
  const nativeScroll = reducedMotion || isTouchDevice() || professionalMode;

  useEffect(() => {
    if (nativeScroll) {
      const onScroll = () => trackScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !professionalMode,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    lenis.on("scroll", trackScroll);
    trackScroll();

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, [nativeScroll, professionalMode]);
}
