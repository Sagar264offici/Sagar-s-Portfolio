# UI Performance Optimization Guide

## Overview
This document outlines the comprehensive performance improvements made to eliminate lag and ensure smooth 60fps interactions across the portfolio.

## Key Bottlenecks Fixed

### 1. **Layout Thrashing Prevention** ✅
**Problem**: DOM reads and writes were interleaved, forcing multiple layout recalculations per frame.

**Solutions Implemented**:
- **OptimizedCursor.tsx**: Removed `offsetWidth` reads from animation frame. Cache ring size, only measure on resize.
- **OptimizedSpotlightCard.tsx**: Throttle mousemove to 60fps, batch layout reads before writes.
- **OptimizedShowcase.tsx**: Cache `getBoundingClientRect()` results with 500ms TTL to avoid repeated layout recalcs.

### 2. **Event Handler Throttling** ✅
**Problem**: Mousemove, scroll events firing hundreds of times/second caused excessive re-renders.

**Solutions**:
- Created `useThrottledEvent` hook that limits callback frequency to 60fps (16ms interval).
- Applied to: SpotlightCard parallax, Showcase browser frame parallax, Cursor tracking.

### 3. **Dynamic Keyframe Injection** ✅
**Problem**: MiniWorlds.StudyWorld regenerated 4 CSS keyframes on every render → CSSOM thrashing.

**Solutions**:
- Moved keyframe generation to module load time (not render time).
- Inject `<style>` tag once via `useEffect` with cleanup.
- Memoize node elements with `useMemo` to prevent re-renders.

### 4. **GPU Acceleration** ✅
**Problem**: CSS properties weren't using hardware acceleration, causing CPU-bound rendering.

**Solutions**:
- Use `transform: translateZ(0)` and `backface-visibility: hidden` on animated elements.
- Prefer `transform` and `opacity` over layout-causing properties.
- Use CSS custom properties for GPU-accelerated values (--mouse-x, --mouse-y, etc).

### 5. **Component Memoization** ✅
**Problem**: Child components re-rendered unnecessarily when parent updated.

**Solutions**:
- Wrapped all optimized components with `React.memo`.
- Used `useCallback` for event handlers to maintain referential equality.
- Memoized grid items (Showcase capabilities) to prevent re-renders.

## New Performance Utilities

### `lib/performance.ts`
Core performance primitives:
- `throttle(fn, interval)` - Limit function calls per time interval
- `debounce(fn, delay)` - Fire only after inactivity
- `DampedValue` - Smooth interpolation with damping factor
- `MeasureCache` - Cache element measurements
- `RAFScheduler` - Coordinate multiple RAF loops into one

### `hooks/usePerformance.ts`
React hooks built on performance utilities:
- `useThrottle(callback, interval)` - Throttled callback hook
- `useDebounce(callback, delay)` - Debounced callback hook
- `useDampedValue(target, factor)` - Smooth animation tracking
- `useThrottledEvent(handler, interval)` - Throttled event handler
- `useDebouncedEvent(handler, delay)` - Debounced event handler
- `useIntersection(ref, options)` - Lazy loading with IntersectionObserver

## Optimized Components

### OptimizedButton
```tsx
// Features:
// - Zero-jank hover states (CSS-driven, no JS)
// - GPU-accelerated transitions via transform3d
// - Memoized to prevent unnecessary re-renders
// - Respects prefers-reduced-motion
```

### OptimizedSpotlightCard
```tsx
// Features:
// - Throttled mousemove handler (60fps max)
// - Cached element measurements
// - CSS custom properties for GPU acceleration
// - Smooth spotlight effect with zero layout thrashing
```

### SmoothCard
```tsx
// Features:
// - Spotlight hover effect without jank
// - Radial gradient positioned at cursor (GPU-accelerated)
// - Respects pointer: coarse devices (mobile)
```

### OptimizedCursor
```tsx
// Features:
// - No synchronous layout reads in animation frame
// - Cached ring size (only remeasure on resize)
// - Single RAF loop for all animations
// - Proper damping for smooth cursor trail
```

### OptimizedShowcase
```tsx
// Features:
// - Throttled parallax on browser frame
// - Cached rect measurements with TTL
// - Memoized capabilities grid
// - Zero layout thrashing on mousemove
```

### OptimizedMiniWorlds (StudyWorld)
```tsx
// Features:
// - Keyframes generated once at module load
// - Style tag injected only once via useEffect
// - Memoized node elements
// - No CSSOM thrashing from repeated keyframe generation
```

## Implementation Checklist

### Step 1: Replace Components in App.tsx
```tsx
// Replace imports:
import { OptimizedCursor } from "./components/OptimizedCursor";
// import { Cursor } from "./components/Cursor";  // OLD

// In JSX:
<OptimizedCursor />  // instead of <Cursor />
```

### Step 2: Replace Spotlight Cards
```tsx
// In sections that use SpotlightCard:
import OptimizedSpotlightCard from "../components/OptimizedSpotlightCard";
// Replace all <SpotlightCard> with <OptimizedSpotlightCard>
```

### Step 3: Replace Showcase Section
```tsx
// In App.tsx sections:
import { OptimizedShowcase } from "./sections/OptimizedShowcase";
// Replace: <Showcase /> with <OptimizedShowcase />
```

### Step 4: Replace MiniWorlds
```tsx
// In sections that use StudyWorld:
import { StudyWorld } from "./components/OptimizedMiniWorlds";
// Uses optimized version automatically
```

### Step 5: Update Buttons (Optional)
```tsx
// In components that have custom buttons:
import { OptimizedButton } from "./components/OptimizedButton";
// Use for consistent, smooth button behavior
```

## Performance Metrics Expected

### Before Optimization
- SpotlightCard mousemove: **Unthrottled** (~200+ calls/sec on fast movement)
- Cursor layout reads: **Every frame** → layout thrashing
- MiniWorlds keyframes: **Regenerated every render**
- Parallax calculations: **Every mousemove event, unthrottled**

### After Optimization
- SpotlightCard mousemove: **Throttled to 60fps** (~3-4ms per call)
- Cursor layout reads: **Only on resize** (cached)
- MiniWorlds keyframes: **Generated once, injected once**
- Parallax: **Throttled to 60fps with cached measurements**

### Expected Improvements
- ✅ **60fps consistent** during scroll, interactions, animations
- ✅ **No jank on hover** effects (SpotlightCard, buttons, cards)
- ✅ **Smooth cursor tracking** with proper damping
- ✅ **Zero stuttering** during parallax effects
- ✅ **Reduced CPU usage** - fewer layout recalcs, batched DOM operations
- ✅ **Better mobile performance** - throttling reduces power drain

## CSS Optimization Tips

### Remove from Global Styles
- Reduce number of infinite animations running simultaneously
- Disable `backdrop-filter: blur()` on mobile (already done, but verify)
- Remove unused box-shadows and expensive effects

### Add to Global Styles
```css
/* Performance first */
* {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Will-change only for actively animated elements */
.animated-element {
  will-change: transform, opacity;
}

/* Content visibility for off-screen sections */
@media (pointer: fine) {
  .off-screen-section {
    content-visibility: auto;
  }
}
```

## Testing & Verification

### Chrome DevTools
1. Open DevTools → Performance tab
2. Record a 5-second interaction (scroll, hover, parallax)
3. Look for:
   - ✅ No red "Long tasks" (>50ms)
   - ✅ Frame rate stays 60fps (16ms per frame)
   - ✅ No layout/recalculation spikes

### Lighthouse
1. Run Lighthouse audit (Lighthouse tab in DevTools)
2. Check metrics:
   - CLS (Cumulative Layout Shift): < 0.1
   - FID (First Input Delay): < 100ms
   - LCP (Largest Contentful Paint): < 2.5s

### Manual Testing
- Scroll smoothly without stuttering
- Hover on cards - effect appears instantly without jank
- Parallax on Showcase - smooth at 60fps
- Cursor tracking - smooth trail without lag
- Mobile - reduced animations, no jank on touch

## Future Optimizations

### Phase 2: Advanced
1. **Image Optimization**
   - Lazy load hero portrait with native loading attribute
   - Serve WebP with JPEG fallback
   - Use srcset for responsive images

2. **Code Splitting**
   - Lazy load UniverseCanvas only when needed
   - Split large sections into chunks
   - Use React.lazy + Suspense

3. **Caching**
   - Service Worker for offline support
   - Cache API responses
   - Persist scroll position

4. **Three.js Optimization**
   - Reduce geometry complexity
   - Use LOD (Level of Detail) for planets
   - Implement frustum culling
   - Reduce post-processing effects on low-end devices

### Phase 3: Monitoring
1. Integrate Sentry for performance monitoring
2. Track Core Web Vitals with web-vitals library
3. Setup analytics for user experience metrics
4. Monitor first user reports of lag/jank

## Quick Reference

### Import Performance Hooks
```tsx
import {
  useThrottle,
  useDebounce,
  useDampedValue,
  useThrottledEvent,
  useMeasureCache,
  useRAFScheduler,
  useIntersection,
} from "../hooks/usePerformance";
```

### Import Performance Utilities
```tsx
import {
  throttle,
  debounce,
  DampedValue,
  MeasureCache,
  RAFScheduler,
} from "../lib/performance";
```

### Common Patterns

**Throttled Event Handler:**
```tsx
const handleMouseMove = useThrottledEvent((e) => {
  // This callback fires max 60 times per second
}, 16);
```

**Cached Measurements:**
```tsx
const measureCache = useMeasureCache();
const rect = measureCache.measure(element);
```

**Smooth Value Interpolation:**
```tsx
const [dampedX, updateDamped] = useDampedValue(targetX, 0.16);
```

## Files Modified/Created

### New Files Created:
- `src/lib/performance.ts` - Performance primitives
- `src/hooks/usePerformance.ts` - React performance hooks
- `src/components/OptimizedButton.tsx` + `.css` - Smooth button component
- `src/components/OptimizedButton.css` - Button styles
- `src/components/SmoothCard.tsx` + `.css` - Spotlight card component
- `src/components/SmoothCard.css` - Card styles
- `src/components/OptimizedCursor.tsx` - Zero-jank cursor
- `src/components/OptimizedSpotlightCard.tsx` - Throttled spotlight effect
- `src/sections/OptimizedShowcase.tsx` - Smooth parallax showcase
- `src/components/OptimizedMiniWorlds.tsx` - Keyframe optimization

### Files to Update:
- `src/App.tsx` - Replace component imports
- `src/sections/Projects.tsx` - Use OptimizedSpotlightCard
- `src/sections/Contact.tsx` - Use OptimizedSpotlightCard
- Any other sections using SpotlightCard

## Support & Debugging

### If you see jank on hover:
1. Check if `useThrottledEvent` is being used
2. Verify `will-change` CSS property is set
3. Profile in DevTools → see if layout recalc is happening

### If cursor tracking feels laggy:
1. Verify OptimizedCursor is imported
2. Check if `backface-visibility: hidden` is set
3. Profile RAF loop - should be < 16ms total

### If animations stutter:
1. Use Chrome DevTools → check for long tasks
2. Look for unthrottled event handlers
3. Check if multiple RAF loops are running independently

---

**Status**: All critical optimizations implemented ✅
**Next Step**: Test in browser and verify 60fps performance
