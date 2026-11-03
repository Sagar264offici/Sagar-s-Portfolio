import { useEffect, useRef, useState, useCallback } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { DampedValue, RAFScheduler } from "../lib/performance";

/**
 * OptimizedCursor: Zero layout thrashing
 * - Caches ring size and only remeasures on resize
 * - Single RAF loop for all animations
 * - No synchronous layout reads in animation frame
 * - Proper damping for smooth cursor trail
 */
export function OptimizedCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const labelRef = useRef<string | null>(null);

  // Track cursor position
  const posRef = useRef({ x: -100, y: -100 });

  // Damped values for smooth ring movement
  const dampedRef = useRef({
    x: new DampedValue(-100, 0.16),
    y: new DampedValue(-100, 0.16),
  });

  // Cached ring size (only updated on resize)
  const ringHalfRef = useRef(19);

  // RAF scheduler coordination
  const schedulerRef = useRef<RAFScheduler | null>(null);

  const hoveredPlanet = usePortfolioStore((s) => s.hoveredPlanet);

  // Measure ring size without causing layout thrashing
  const measureRing = useCallback(() => {
    if (ring.current) {
      // This will be called infrequently (only on resize)
      ringHalfRef.current = ring.current.offsetWidth / 2;
    }
  }, []);

  // Setup event listeners and RAF loop
  useEffect(() => {
    const posRef_ = posRef.current;
    const dampedRef_ = dampedRef.current;
    const ringRef = ring.current;
    const dotRef = dot.current;

    // Event handler: just update position, no rendering
    const onMove = (e: PointerEvent) => {
      posRef_.x = e.clientX;
      posRef_.y = e.clientY;
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
        const next = (e as PointerEvent).relatedTarget as HTMLElement | null;
        if (!next?.closest?.("[data-cursor-label]")) {
          labelRef.current = null;
          setLabel(null);
        }
      }
    };

    // Initial ring measurement
    measureRing();

    // Listen for resize to invalidate cache
    window.addEventListener("resize", measureRing, { passive: true });

    // Passive event listeners for cursor tracking
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    // Single RAF loop for all animations
    let rafId = 0;
    const loop = () => {
      // Update damped values
      dampedRef_.x.setValue(posRef_.x);
      dampedRef_.y.setValue(posRef_.y);

      const dampedX = dampedRef_.x.step();
      const dampedY = dampedRef_.y.step();

      // Update DOM with cached values (no layout reads here)
      if (dotRef) {
        dotRef.style.transform = `translate3d(${posRef_.x - 3}px, ${posRef_.y - 3}px, 0)`;
      }

      if (ringRef) {
        const ringHalf = ringHalfRef.current;
        ringRef.style.transform = `translate3d(${dampedX - ringHalf}px, ${dampedY - ringHalf}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureRing);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [measureRing]);

  // Update label when hovered planet changes
  useEffect(() => {
    setLabel(hoveredPlanet ? "EXPLORE" : labelRef.current);
  }, [hoveredPlanet]);

  // Re-measure after label changes (async to avoid layout thrashing)
  useEffect(() => {
    const id = requestAnimationFrame(() => measureRing());
    return () => cancelAnimationFrame(id);
  }, [label, measureRing]);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className={`cursor-ring ${label ? "labeled" : ""}`} aria-hidden>
        <span className="label">{label}</span>
      </div>
    </>
  );
}
