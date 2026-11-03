import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import React from "react";
import {
  throttle,
  debounce,
  RAFScheduler,
  DampedValue,
  MeasureCache,
} from "../lib/performance";

/**
 * useThrottle: Throttle a callback to fire at most once per interval
 * Prevents excessive re-renders and event handler calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 16 // ~60fps
): T {
  const throttledRef = useRef<ReturnType<typeof throttle<T>> | null>(null);

  useEffect(() => {
    throttledRef.current = throttle(callback, interval);
    return () => {
      throttledRef.current = null;
    };
  }, [callback, interval]);

  return (throttledRef.current as unknown as T) || callback;
}

/**
 * useDebounce: Debounce a callback to fire only after N ms of inactivity
 * Useful for search, validation, or resize calculations
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const debouncedRef = useRef<ReturnType<typeof debounce<T>> | null>(null);

  useEffect(() => {
    debouncedRef.current = debounce(callback, delay);
    return () => {
      debouncedRef.current = null;
    };
  }, [callback, delay]);

  return (debouncedRef.current as unknown as T) || callback;
}

/**
 * useDampedValue: Smooth interpolation between values
 * Perfect for cursor tracking, scroll parallax, smooth animations
 */
export function useDampedValue(
  target: number,
  dampFactor: number = 0.16
): [current: number, update: () => void] {
  const dampRef = useRef(new DampedValue(target, dampFactor));
  const [, setTick] = useState(0);

  const unsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    const rafScheduler = new RAFScheduler();
    unsubscribe.current = rafScheduler.add(() => {
      dampRef.current.step();
      setTick((t) => t + 1);
    });

    return () => {
      unsubscribe.current?.();
      rafScheduler.stop();
    };
  }, []);

  useEffect(() => {
    dampRef.current.setValue(target);
  }, [target]);

  const update = useCallback(() => {
    return dampRef.current.step();
  }, []);

  return [dampRef.current.get(), update];
}

/**
 * useMeasureCache: Cache element measurements to prevent layout thrashing
 * Invalidates on viewport resize
 */
export function useMeasureCache() {
  const cacheRef = useRef(new MeasureCache());

  useEffect(() => {
    const handleResize = () => {
      cacheRef.current.invalidate();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cacheRef.current;
}

/**
 * useRAFScheduler: Coordinate multiple animation callbacks in a single rAF loop
 * Prevents jank from multiple concurrent rAF loops
 */
export function useRAFScheduler() {
  const schedulerRef = useRef(new RAFScheduler());

  useEffect(() => {
    return () => {
      schedulerRef.current.clear();
    };
  }, []);

  return schedulerRef.current;
}

/**
 * useThrottledEvent: Create a throttled event handler
 * Returns memoized throttled function
 */
export function useThrottledEvent<E extends Event>(
  handler: (event: E) => void,
  interval: number = 16
): (event: E) => void {
  return useMemo(() => {
    const throttled = throttle(handler, interval);
    return (event: E) => throttled(event);
  }, [handler, interval]);
}

/**
 * useDebouncedEvent: Create a debounced event handler
 */
export function useDebouncedEvent<E extends Event>(
  handler: (event: E) => void,
  delay: number = 300
): (event: E) => void {
  return useMemo(() => {
    const debounced = debounce(handler, delay);
    return (event: E) => debounced(event);
  }, [handler, delay]);
}

/**
 * useRAFState: State that updates on every animation frame
 * Syncs with the browser's repaint cycle
 */
export function useRAFState<T>(initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const rafRef = useRef<number | null>(null);

  const update = useCallback((newValue: T) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setValue(newValue);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return [value, update];
}

/**
 * useIntersection: Observe when element enters/leaves viewport
 * Useful for lazy loading, animations on scroll
 */
export function useIntersection(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}
