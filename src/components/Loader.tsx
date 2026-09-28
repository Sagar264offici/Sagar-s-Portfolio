import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { isTouchDevice } from "../lib/device";
import { ReactLogoLoader } from "./ReactLogoLoader";

export function Loader() {
  const boot = usePortfolioStore((s) => s.boot);
  const booted = usePortfolioStore((s) => s.booted);
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

    const finish = window.setTimeout(() => {
      setHidden(true);
      boot();
      window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
    }, 1500);

    return () => {
      window.clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  return (
    <div className={`loader ${hidden ? "hidden" : ""}`} role="status" aria-live="polite">
      <div className="l-title">please hang on</div>
      <ReactLogoLoader size={150} />
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
