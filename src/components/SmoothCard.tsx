import React, { useRef, useEffect } from "react";
import { useThrottledEvent } from "../hooks/usePerformance";
import "./SmoothCard.css";

interface SmoothCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  glowColor?: string;
}

/**
 * SmoothCard: Optimized card with smooth hover effects
 * - Throttled mousemove for spotlight effect
 * - CSS custom properties for GPU-accelerated styling
 * - No layout thrashing
 */
export const SmoothCard = React.memo(
  ({
    children,
    className = "",
    onClick,
    interactive = true,
    glowColor = "rgba(102, 126, 234, 0.5)",
  }: SmoothCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useThrottledEvent(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !interactive) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Use CSS custom properties for GPU-accelerated styling
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
        cardRef.current.style.setProperty("--glow-color", glowColor);
      },
      16 // ~60fps throttle
    );

    const handleMouseLeave = () => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--mouse-x", "-100px");
      cardRef.current.style.setProperty("--mouse-y", "-100px");
    };

    return (
      <div
        ref={cardRef}
        className={`smooth-card ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Spotlight layer (CSS-driven, no JS calculation) */}
        {interactive && <div className="smooth-card__spotlight" />}

        {/* Content layer */}
        <div className="smooth-card__content">{children}</div>
      </div>
    );
  }
);

SmoothCard.displayName = "SmoothCard";
