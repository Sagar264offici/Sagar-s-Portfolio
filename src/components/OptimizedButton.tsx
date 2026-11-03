import React, { useCallback, useMemo } from "react";
import { useThrottledEvent } from "../hooks/usePerformance";
import "./OptimizedButton.css";

interface OptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  "data-cursor-label"?: string;
}

/**
 * OptimizedButton: Zero jank, smooth interactions
 * - Uses CSS-based hover states (no JS recalculations)
 * - Memoized to prevent unnecessary re-renders
 * - transform3d for GPU acceleration
 */
export const OptimizedButton = React.memo(
  ({
    children,
    onClick,
    className = "",
    disabled = false,
    variant = "primary",
    size = "md",
    "data-cursor-label": cursorLabel,
  }: OptimizedButtonProps) => {
    const handleClick = useCallback(() => {
      if (!disabled && onClick) onClick();
    }, [onClick, disabled]);

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`opt-btn opt-btn--${variant} opt-btn--${size} ${className}`}
        data-cursor-label={cursorLabel}
      >
        <span className="opt-btn__content">{children}</span>
        <span className="opt-btn__shine" />
      </button>
    );
  }
);

OptimizedButton.displayName = "OptimizedButton";
