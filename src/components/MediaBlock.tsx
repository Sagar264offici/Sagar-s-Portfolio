import React from "react";
import { motion } from "framer-motion";
import "./MediaBlock.css";

interface MediaBlockProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  ratio?: "square" | "16-9" | "4-3" | "3-2";
  rounded?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * MediaBlock: Image/media container with proper aspect ratios
 * - Responsive image handling
 * - Smooth animations
 * - Clean styling without decorative effects
 */
export const MediaBlock = React.memo(
  ({
    src,
    alt = "Media",
    children,
    ratio = "16-9",
    rounded = true,
    className = "",
    animate = true,
  }: MediaBlockProps) => {
    return (
      <motion.div
        className={`media-block media-block--${ratio} ${rounded ? "rounded" : ""} ${className}`}
        initial={animate ? { opacity: 0, scale: 0.95 } : undefined}
        whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
        viewport={animate ? { once: true, margin: "-50px" } : undefined}
        transition={animate ? { duration: 0.6 } : undefined}
      >
        {src ? (
          <img src={src} alt={alt} loading="lazy" className="media-block__image" />
        ) : (
          <div className="media-block__placeholder">{children}</div>
        )}
      </motion.div>
    );
  }
);

MediaBlock.displayName = "MediaBlock";
