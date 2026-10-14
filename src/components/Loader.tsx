import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";

export function Loader() {
  const boot = usePortfolioStore((s) => s.boot);
  const booted = usePortfolioStore((s) => s.booted);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (booted) return;

    // The portfolio initializes behind this opaque intro. Reduced-motion users
    // get a shorter hold, while everyone sees the same clean first frame.
    const duration = reducedMotion ? 900 : 2700;
    const finish = window.setTimeout(() => {
      setHidden(true);
      boot();
      window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
    }, duration);

    return () => window.clearTimeout(finish);
  }, [booted, boot, reducedMotion]);

  return (
    <div
      className={"loader apple-hello-loader " + (hidden ? "hidden" : "")}
      role="status"
      aria-live="polite"
      aria-label="Welcome"
    >
      <div className="apple-hello-word" aria-label="hello">hello</div>
      <span className="apple-hello-caption" aria-hidden="true">SAGAR HORIZON</span>
    </div>
  );
}
