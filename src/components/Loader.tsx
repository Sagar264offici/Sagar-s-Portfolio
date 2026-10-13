import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { isTouchDevice } from "../lib/device";
import { ReactLogoLoader } from "./ReactLogoLoader";

export function Loader() {
  const boot = usePortfolioStore((s) => s.boot);
  const booted = usePortfolioStore((s) => s.booted);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (booted) return;
    // Phones boot fast: brief splash, then GitHub data streams in
    // behind the already-interactive page.
    if (isTouchDevice()) {
      const quick = window.setTimeout(() => {
        setHidden(true);
        boot();
      }, 400);
      return () => window.clearTimeout(quick);
    }

    // The universe now preloads in parallel, so a long artificial splash only
    // makes the finished background feel late.
    const finish = window.setTimeout(() => {
      setHidden(true);
      boot();
      window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
    }, 750);

    return () => {
      window.clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  return (
    <div className={`loader ${hidden ? "hidden" : ""}`} role="status" aria-live="polite">
      <div className="l-title">please hang on</div>
      <ReactLogoLoader size={150} reducedMotion={reducedMotion} />
      <button
        className="l-skip"
        onClick={() => {
          setHidden(true);
          boot();
        }}
      >
        SKIP
      </button>
    </div>
  );
}
