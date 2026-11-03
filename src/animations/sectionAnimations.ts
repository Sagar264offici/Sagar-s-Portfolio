/**
 * Centralized animation configurations for smooth, consistent motion
 * Used across all sections for professional feel
 */

export const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const slideLeftVariants = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const slideRightVariants = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const viewportSettings = {
  once: true,
  margin: "-100px",
};

export const hoverVariants = {
  scale: 1.02,
  transition: { duration: 0.2, type: "spring", stiffness: 400, damping: 10 },
};

export const tapVariants = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
