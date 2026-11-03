import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { usePortfolioStore } from "../store/portfolioStore";

/**
 * OptimizedLoader: Ultra-fast splash screen with minimal lag
 * - Lazy loads animation components only when needed
 * - Optimized timing for instant content display
 * - Smooth fade transitions without janky renders
 */
export function OptimizedLoader({ ready }: { ready: boolean }) {
  const boot = usePortfolioStore((s) => s.boot);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const [animationTarget, setAnimationTarget] = useState<HTMLElement | null>(null);
  const [shouldClose, setShouldClose] = useState(false);
  const readyRef = useRef(ready);
  const finishRef = useRef<(() => void) | null>(null);

  // Ultra-fast timing: 400ms minimum, 3000ms maximum
  const minimumElapsed = reducedMotion ? 200 : 400;
  const maximumElapsed = reducedMotion ? 1200 : 3000;

  useEffect(() => {
    readyRef.current = ready;

    // If ready and enough time has passed, close splash
    if (ready && performance.now() >= minimumElapsed) {
      finishRef.current?.();
    }
  }, [ready, minimumElapsed]);

  useEffect(() => {
    const splash = document.getElementById("startup-splash");
    const target = document.getElementById("startup-animation");

    if (target && splash && !reducedMotion) {
      splash.classList.add("has-animated-hello");
      setAnimationTarget(target);
    } else {
      splash?.classList.remove("has-animated-hello");
      setAnimationTarget(null);
    }

    let finished = false;
    let removeTimer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      setShouldClose(true);

      splash?.classList.add("is-leaving");
      removeTimer = window.setTimeout(() => {
        splash?.remove();
        boot();
        window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
      }, 300); // Faster fade
    };

    finishRef.current = finish;

    // Minimum wait time
    const minTimer = window.setTimeout(() => {
      if (readyRef.current) {
        finish();
      }
    }, Math.max(0, minimumElapsed - performance.now()));

    // Maximum wait time (safety net)
    const maxTimer = window.setTimeout(finish, maximumElapsed);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      finishRef.current = null;
    };
  }, [boot, reducedMotion, minimumElapsed, maximumElapsed]);

  // Simple fade animation instead of complex SVG animations
  const fadeVariants = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  if (!animationTarget || reducedMotion) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {!shouldClose && (
        <motion.div
          key="loader"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="optimized-loader"
        >
          <div className="loader-content">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="loader-dot"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    animationTarget
  );
}
