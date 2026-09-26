import { useEffect, useRef, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const labelRef = useRef<string | null>(null);
  const remeasureRef = useRef<() => void>(() => {});
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
    // Cache the ring radius — reading offsetWidth every frame forces a
    // synchronous layout (main-thread jank on every single frame).
    let ringHalf = 19;
    const measureRing = () => {
      if (ring.current) ringHalf = ring.current.offsetWidth / 2;
    };
    measureRing();
    remeasureRef.current = measureRing;
    window.addEventListener("resize", measureRing);
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x - ringHalf}px, ${ringPos.y - ringHalf}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureRing);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  useEffect(() => {
    setLabel(hoveredPlanet ? "EXPLORE" : labelRef.current);
  }, [hoveredPlanet]);

  // Ring diameter changes with the labeled state — re-measure after it applies.
  useEffect(() => {
    const id = requestAnimationFrame(() => remeasureRef.current());
    return () => cancelAnimationFrame(id);
  }, [label]);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className={`cursor-ring ${label ? "labeled" : ""}`} aria-hidden>
        <span className="label">{label}</span>
      </div>
    </>
  );
}
