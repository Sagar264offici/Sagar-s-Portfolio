import React from "react";
import { motion } from "framer-motion";
import "./ModernSection.css";

interface ModernSectionProps {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  darkBg?: boolean;
  className?: string;
}

/**
 * ModernSection: Clean, professional section container
 * - Consistent spacing and margins
 * - Better visual hierarchy
 * - Smooth animations
 */
export const ModernSection = React.memo(
  ({ id, title, subtitle, children, darkBg = false, className = "" }: ModernSectionProps) => {
    return (
      <motion.section
        id={id}
        className={`modern-section ${darkBg ? "dark-bg" : ""} ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {(title || subtitle) && (
          <div className="section-header">
            {title && (
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="section-subtitle"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        <div className="section-content">{children}</div>
      </motion.section>
    );
  }
);

ModernSection.displayName = "ModernSection";
