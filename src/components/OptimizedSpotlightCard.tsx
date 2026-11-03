import { useRef, useCallback, useMemo, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useThrottledEvent } from "../hooks/usePerformance";
import "./SpotlightCard.css";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  throttleInterval?: number;
}

/**
 * OptimizedSpotlightCard: Zero jank spotlight effect
 * - Throttled mousemove handler (60fps max)
 * - Uses useCallback to prevent re-renders
 * - CSS custom properties for GPU acceleration
 * - No layout thrashing
 */
const OptimizedSpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  onMouseMove,
  throttleInterval = 16, // ~60fps
  ...rest
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  // Throttled mousemove handler with useCallback
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = divRef.current;
      if (!el) return;

      // Batch layout reads
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Batch DOM writes (CSS properties are fast, not layout-causing)
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
      el.style.setProperty("--spotlight-color", spotlightColor);

      onMouseMove?.(e);
    },
    [spotlightColor, onMouseMove]
  );

  // Apply throttle to prevent excessive calls
  const throttledHandleMouseMove = useThrottledEvent(
    handleMouseMove,
    throttleInterval
  );

  // Memoize spotlight styles to prevent recalculation
  const spotlightStyles = useMemo(
    () => ({
      "--spotlight-color": spotlightColor,
    } as React.CSSProperties),
    [spotlightColor]
  );

  const handleMouseLeave = useCallback(() => {
    const el = divRef.current;
    if (el) {
      // Reset position to hide spotlight smoothly
      el.style.setProperty("--mouse-x", "-100px");
      el.style.setProperty("--mouse-y", "-100px");
    }
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={throttledHandleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`card-spotlight ${className}`}
      style={spotlightStyles}
      {...rest}
    >
      {children}
    </div>
  );
};

export default OptimizedSpotlightCard;
