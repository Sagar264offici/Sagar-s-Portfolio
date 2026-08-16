import { useEffect, useRef, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const labelRef = useRef<string | null>(null);
  const hoveredPlanet = usePortfolioStore((s) => s.hoveredPlanet);

  useEffect(() => {
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement;
      const el = target.closest?.("[data-cursor-label]") as HTMLElement | null;
      labelRef.current = el ? el.dataset.cursorLabel || null : null;
      setLabel(labelRef.current);
    };

    const onOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest?.("[data-cursor-label]")) {
        // leaving a labeled element — clear only if we're not entering another
        const next = (e as PointerEvent).relatedTarget as HTMLElement | null;
        if (!next?.closest?.("[data-cursor-label]")) {
          labelRef.current = null;
          setLabel(null);
        }
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    let raf = 0;
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${pos.x - 3}px, ${pos.y - 3}px)`;
      if (ring.current) {
        const half = ring.current.offsetWidth / 2;
        ring.current.style.transform = `translate(${ringPos.x - half}px, ${ringPos.y - half}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  useEffect(() => {
    setLabel(hoveredPlanet ? "EXPLORE" : labelRef.current);
  }, [hoveredPlanet]);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className={`cursor-ring ${label ? "labeled" : ""}`} aria-hidden>
        <span className="label">{label}</span>
      </div>
    </>
  );
}
