import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { isTouchDevice } from "../lib/device";

interface Stage {
  id: string;
  label: string;
  done: boolean;
  pct: number;
}

const STAGES = ["ENGINE", "ASSETS", "PROJECT DATA", "GITHUB", "AUDIO", "INTERFACE"];

export function Loader() {
  const boot = usePortfolioStore((s) => s.boot);
  const booted = usePortfolioStore((s) => s.booted);
  const [stages, setStages] = useState<Stage[]>(STAGES.map((id) => ({ id, label: id, done: false, pct: 0 })));
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (booted) return;
    // Phones boot fast: show a brief splash, then let GitHub data
    // stream in behind the already-interactive page.
    if (isTouchDevice()) {
      const quick = window.setTimeout(() => {
        setHidden(true);
        boot();
      }, 400);
      return () => window.clearTimeout(quick);
    }
    const timers: number[] = [];

    // Each stage completes after its own micro-delay (engine first, github tied to real fetch).
    STAGES.forEach((label, i) => {
      const t = window.setTimeout(
        () => {
          setStages((prev) => prev.map((s) => (s.id === label ? { ...s, done: true, pct: 100 } : s)));
        },
        140 + i * 190
      );
      timers.push(t);
    });

    // Github stage finishes when real data lands (or fallback resolves), whichever first.
    const githubCheck = window.setInterval(() => {
      const loading = usePortfolioStore.getState().github.loading;
      if (!loading) {
        setStages((prev) => prev.map((s) => (s.id === "GITHUB" ? { ...s, done: true, pct: 100 } : s)));
        window.clearInterval(githubCheck);
      }
    }, 120);

    const finish = window.setTimeout(() => {
      window.clearInterval(githubCheck);
      setHidden(true);
      boot();
      window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
    }, 1500);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(githubCheck);
      window.clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  const overall = Math.round(stages.reduce((a, s) => a + s.pct, 0) / stages.length);

  return (
    <div className={`loader ${hidden ? "hidden" : ""}`} role="status" aria-live="polite">
      <div className="l-title">INITIALIZING UNIVERSE</div>
      <div className="l-rows">
        {stages.map((s) => (
          <div key={s.id} className="l-row">
            <span style={{ color: s.done ? "var(--cyan)" : undefined }}>{s.label}</span>
            <span className="bar">
              <i style={{ width: `${s.pct}%` }} />
            </span>
          </div>
        ))}
        <div className="l-row" style={{ marginTop: 6 }}>
          <span style={{ color: "var(--text)" }}>{overall >= 100 ? "SYSTEM READY" : `SYNCING… ${overall}%`}</span>
        </div>
      </div>
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
