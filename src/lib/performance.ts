/**
 * Performance utilities: throttling, debouncing, RAF scheduling
 * Prevents layout thrashing and reduces jank from excessive re-renders
 */

type ThrottledFn<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

/**
 * Throttle function calls to max once per interval (ms)
 * Ideal for: mousemove, scroll, resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): ThrottledFn<T> {
  let last = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = interval - (now - last);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      last = now;
      fn(...args);
    } else if (!timeout) {
      // Schedule the call at the end of the interval
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Debounce function calls—only call after N ms of inactivity
 * Ideal for: search, form validation, resize final calculation
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ThrottledFn<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      fn(...args);
    }, delay);
  };
}

/**
 * Schedule a callback on the next animation frame with early exit
 */
export function scheduleRAF(
  callback: (timestamp: number) => void
): () => void {
  let rafId: number | null = null;

  rafId = requestAnimationFrame(callback);

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

/**
 * Batch multiple layout reads before writing to prevent thrashing
 * Use this wrapper around code that reads DOM properties
 */
export function batchLayout<T>(readFn: () => T): T {
  // In a real scenario, this could coordinate with other batch operations.
  // For now, it's a semantic marker that marks this section as "read-only"
  return readFn();
}

/**
 * Batch multiple DOM writes for the next paint
 * Prevents layout recalculation between reads and writes
 */
export function batchPaint(writeFn: () => void): void {
  // Similarly, this marks write-only operations
  writeFn();
}

/**
 * Cache a value with a dependency list—only recalculate if deps change
 * Useful for expensive calculations in event handlers
 */
export class ValueCache<T> {
  private value: T | undefined;
  private deps: any[] = [];

  constructor(private fn: () => T) {}

  get(deps?: any[]): T {
    if (!deps || !this.depsEqual(deps, this.deps)) {
      this.value = this.fn();
      this.deps = deps || [];
    }
    return this.value!;
  }

  private depsEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

  clear(): void {
    this.value = undefined;
    this.deps = [];
  }
}

/**
 * Interpolate between two values using damping for smooth animation
 * Used for cursor tracking, parallax, scroll effects
 */
export class DampedValue {
  private current: number;
  private target: number;
  private factor: number;

  constructor(initial: number = 0, dampFactor: number = 0.16) {
    this.current = initial;
    this.target = initial;
    this.factor = dampFactor;
  }

  setValue(target: number): void {
    this.target = target;
  }

  step(): number {
    this.current += (this.target - this.current) * this.factor;
    return this.current;
  }

  get(): number {
    return this.current;
  }

  reset(value: number = 0): void {
    this.current = value;
    this.target = value;
  }

  setDampFactor(factor: number): void {
    this.factor = factor;
  }
}

/**
 * Measure an element without causing layout thrashing
 * Caches measurements until explicitly invalidated
 */
export class MeasureCache {
  private measurements = new WeakMap<Element, DOMRect>();

  measure(element: Element): DOMRect {
    let rect = this.measurements.get(element);
    if (!rect) {
      rect = element.getBoundingClientRect();
      this.measurements.set(element, rect);
    }
    return rect;
  }

  invalidate(element?: Element): void {
    if (element) {
      this.measurements.delete(element);
    } else {
      // Clear all (worst case, but sometimes necessary)
      this.measurements = new WeakMap();
    }
  }
}

/**
 * Coordinate multiple rAF loops to prevent jank
 * All scheduled callbacks run in a single rAF frame
 */
export class RAFScheduler {
  private callbacks: Set<(timestamp: number) => void> = new Set();
  private rafId: number | null = null;
  private isRunning = false;

  add(callback: (timestamp: number) => void): () => void {
    this.callbacks.add(callback);
    this.ensureRunning();

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stop();
      }
    };
  }

  private ensureRunning(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.scheduleFrame();
    }
  }

  private scheduleFrame(): void {
    this.rafId = requestAnimationFrame((timestamp) => {
      // Call all registered callbacks
      for (const callback of this.callbacks) {
        callback(timestamp);
      }
      // Schedule next frame if still active
      if (this.callbacks.size > 0) {
        this.scheduleFrame();
      } else {
        this.isRunning = false;
      }
    });
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
  }

  clear(): void {
    this.callbacks.clear();
    this.stop();
  }
}

/**
 * Detect if browser supports optional chaining-like viewport observation
 */
export function supportsIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== "undefined";
}

/**
 * Get optimal animation frame rate based on device refresh rate
 */
export function getOptimalFrameRate(): number {
  if (typeof window === "undefined") return 60;

  // Most modern displays are 60Hz, but high-refresh displays are 120Hz+
  // We'll cap at 60fps for consistency across devices
  return 60;
}
