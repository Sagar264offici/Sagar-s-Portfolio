import React from "react";
import { motion } from "framer-motion";
import "./TextBlock.css";

interface TextBlockProps {
  children: React.ReactNode;
  variant?: "heading" | "body" | "subtitle" | "caption";
  className?: string;
  animate?: boolean;
}

/**
 * TextBlock: Clean typography wrapper
 * - Proper spacing and hierarchy
 * - No decorative effects (glows removed)
 * - Improved readability
 */
export const TextBlock = React.memo(
  ({ children, variant = "body", className = "", animate = true }: TextBlockProps) => {
    const Component = animate ? motion.div : "div";

    return (
      <Component
        className={`text-block text-block--${variant} ${className}`}
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        whileInView={animate ? { opacity: 1, y: 0 } : undefined}
        viewport={animate ? { once: true, margin: "-50px" } : undefined}
        transition={animate ? { duration: 0.5 } : undefined}
      >
        {children}
      </Component>
    );
  }
);

TextBlock.displayName = "TextBlock";
