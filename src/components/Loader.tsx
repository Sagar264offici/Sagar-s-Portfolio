import { useEffect, useRef } from "react";
import { usePortfolioStore } from "../store/portfolioStore";

interface LoaderProps {
  ready: boolean;
}

/**
 * Controls the static HTML splash from index.html.
 * Keeping its visuals out of React lets it appear before the app bundle loads.
 */
export function Loader({ ready }: LoaderProps) {
  const boot = usePortfolioStore((s) => s.boot);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const readyRef = useRef(ready);
  const finishRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    readyRef.current = ready;
    const minimumElapsed = reducedMotion ? 600 : 2150;
    if (ready && performance.now() >= minimumElapsed) {
      finishRef.current?.();
    }
  }, [ready, reducedMotion]);

  useEffect(() => {
    const splash = document.getElementById("startup-splash");
    let finished = false;
    let removeTimer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      splash?.classList.add("is-leaving");
      removeTimer = window.setTimeout(() => splash?.remove(), 700);
      boot();
      window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
    };

    finishRef.current = finish;

    // The CSS animation begins during HTML parsing. Measure from navigation
    // start, then wait for the essential page shell and portrait to be ready.
    const minimumElapsed = reducedMotion ? 600 : 2150;
    const maximumElapsed = reducedMotion ? 3600 : 6000;
    const minTimer = window.setTimeout(() => {
      if (readyRef.current) finish();
    }, Math.max(0, minimumElapsed - performance.now()));
    const maxTimer = window.setTimeout(finish, Math.max(0, maximumElapsed - performance.now()));

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      finishRef.current = null;
    };
  }, [boot, reducedMotion]);

  return null;
}
