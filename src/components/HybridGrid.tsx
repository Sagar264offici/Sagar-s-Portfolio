import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../animations/sectionAnimations";
import "./HybridGrid.css";

interface HybridGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  asymmetrical?: boolean;
  alternating?: boolean;
  className?: string;
}

/**
 * HybridGrid: Asymmetrical, modern grid layout
 * - Alternating column widths for dynamic flow
 * - Better for modern portfolios
 * - Responsive and flexible
 */
export const HybridGrid = React.memo(
  ({
    children,
    columns = 2,
    gap = "2rem",
    asymmetrical = true,
    alternating = true,
    className = "",
  }: HybridGridProps) => {
    return (
      <motion.div
        className={`hybrid-grid ${asymmetrical ? "asymmetrical" : ""} ${alternating ? "alternating" : ""} ${className}`}
        style={{
          "--columns": columns,
          "--gap": gap,
        } as React.CSSProperties}
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            className="hybrid-grid-item"
            variants={staggerItem}
            data-index={index}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }
);

HybridGrid.displayName = "HybridGrid";
