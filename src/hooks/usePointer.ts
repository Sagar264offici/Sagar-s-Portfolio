import { useEffect, useRef } from "react";

export interface PointerState {
  x: number; // -1..1
  y: number; // -1..1
  screenX: number;
  screenY: number;
}

const pointer = { x: 0, y: 0, screenX: -100, screenY: -100 };

export function usePointer(): React.MutableRefObject<PointerState> {
  const ref = useRef<PointerState>(pointer);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.screenX = e.clientX;
      pointer.screenY = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

export function getPointer(): PointerState {
  return pointer;
}
