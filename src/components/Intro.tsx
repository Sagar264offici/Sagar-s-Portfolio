import { useEffect, useRef, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";

const LINES = [
  "INITIALIZING PORTFOLIO SYSTEM…",
  "LOADING CAREER DATA…",
  "SYNCHRONIZING PROJECTS…",
  "CALIBRATING ORBITS…",
  "CONNECTION ESTABLISHED.",
];

export function Intro() {
  const introSeen = usePortfolioStore((s) => s.introSeen);
  const markIntroSeen = usePortfolioStore((s) => s.markIntroSeen);
  const [done, setDone] = useState(0);
  const [hidden, setHidden] = useState(false);
  const seen = useRef(introSeen);

  useEffect(() => {
    if (seen.current) {
      // Repeat visitors get a 900ms "CONNECTION ESTABLISHED" flash only.
      const t = window.setTimeout(() => setHidden(true), 950);
      setDone(LINES.length);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setDone(i + 1), 500 + i * 520));
    });
    timers.push(
      window.setTimeout(() => {
        setHidden(true);
        markIntroSeen();
      }, 500 + LINES.length * 520 + 550)
    );
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    setHidden(true);
    markIntroSeen();
  };

  return (
    <div className={`intro ${hidden ? "hidden" : ""}`} aria-live="polite">
      {LINES.map((line, i) => (
        <div key={line} className={`i-line ${i < done ? "done" : ""} ${i === LINES.length - 1 && done === LINES.length ? "final" : ""}`}>
          {line}
        </div>
      ))}
      {!seen.current && (
        <button className="i-skip" onClick={skip}>
          SKIP INTRO
        </button>
      )}
    </div>
  );
}
