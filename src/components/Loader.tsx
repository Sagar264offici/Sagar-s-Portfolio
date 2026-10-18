import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { usePortfolioStore } from "../store/portfolioStore";
import { AppleHelloEffectEnglish } from "./apple-hello-effect/AppleHelloEffectEnglish";
import { AppleHelloEffectHindi } from "./apple-hello-effect/AppleHelloEffectHindi";

interface LoaderProps {
  ready: boolean;
}

/**
 * The HTML shell paints the fallback before React starts. Once React mounts,
 * the handwritten SVG animates above the app while the initial scene starts.
 */
export function Loader({ ready }: LoaderProps) {
  const boot = usePortfolioStore((s) => s.boot);
  const reducedMotion = usePortfolioStore((s) => s.reducedMotion);
  const [index, setIndex] = useState(0);
  const [animationTarget, setAnimationTarget] = useState<HTMLElement | null>(null);
  const [animationFinished, setAnimationFinished] = useState(false);
  const readyRef = useRef(ready);
  const animationFinishedRef = useRef(animationFinished);
  const finishRef = useRef<(() => void) | null>(null);
  const minimumElapsed = reducedMotion ? 600 : 1500;

  useEffect(() => {
    readyRef.current = ready;
    animationFinishedRef.current = animationFinished;

    if (
      ready &&
      performance.now() >= minimumElapsed &&
      (reducedMotion || animationFinished)
    ) {
      finishRef.current?.();
    }
  }, [ready, reducedMotion, animationFinished, minimumElapsed]);

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
      splash?.classList.add("is-leaving");
      // Complete the black overlay fade before mounting the heavyweight scene.
      removeTimer = window.setTimeout(() => {
        splash?.remove();
        boot();
        window.setTimeout(() => usePortfolioStore.getState().setGithubLoading(false), 0);
      }, 650);
    };

    finishRef.current = finish;

    // Large planet maps stream progressively. Only the first-screen portrait
    // and canvas shell gate the splash; the background's animation loop is
    // paused until the splash exits.
    const maximumElapsed = reducedMotion ? 3600 : 7200;
    const minTimer = window.setTimeout(() => {
      if (
        readyRef.current &&
        (reducedMotion || animationFinishedRef.current)
      ) {
        finish();
      }
    }, Math.max(0, minimumElapsed - performance.now()));
    const maxTimer = window.setTimeout(finish, Math.max(0, maximumElapsed - performance.now()));

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      finishRef.current = null;
    };
  }, [boot, reducedMotion, minimumElapsed]);

  const handleAnimationEnd = () => {
    // The Hindi greeting is always the final animated word.
    if (index === 1) {
      setAnimationFinished(true);
      if (readyRef.current && performance.now() >= minimumElapsed) {
        finishRef.current?.();
      }
      return;
    }

    setIndex(1);
  };

  const demos = [
    <AppleHelloEffectEnglish
      key="english"
      durationScale={0.5}
      onAnimationComplete={handleAnimationEnd}
    />,
    <AppleHelloEffectHindi
      key="namaste"
      durationScale={0.5}
      onAnimationComplete={handleAnimationEnd}
    />,
  ];

  if (!animationTarget || reducedMotion) return null;
  return createPortal(
    <AnimatePresence mode="wait">{demos[index]}</AnimatePresence>,
    animationTarget
  );
}
