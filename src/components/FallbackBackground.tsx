import { useEffect, useRef } from "react";

interface FallbackBackgroundProps { fadeOut?: boolean }

export function FallbackBackground({ fadeOut = false }: FallbackBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars: { x: number; y: number; r: number; speed: number; c: string }[] = [];
    const count = Math.min(260, Math.floor(window.innerWidth / 6));

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 1.3,
        speed: 0.004 + Math.random() * 0.02,
        c: Math.random() > 0.85 ? "#a78bfa" : Math.random() > 0.7 ? "#67e8f9" : "#e2e8f0",
      });
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // soft sun glow top-left-ish
      const g = ctx.createRadialGradient(
        canvas.width * 0.28,
        canvas.height * 0.32,
        0,
        canvas.width * 0.28,
        canvas.height * 0.32,
        canvas.width * 0.4
      );
      g.addColorStop(0, "rgba(251,146,60,0.10)");
      g.addColorStop(0.5, "rgba(124,45,18,0.05)");
      g.addColorStop(1, "rgba(5,6,10,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        const tw = 0.5 + Math.sin(s.x * 100) * 0.2;
        ctx.globalAlpha = 0.35 + tw * 0.5;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    // Paint once. The placeholder is temporary and should not compete with
    // the 3D scene in a second full-screen render loop.
    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 480ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      aria-hidden
    />
  );
}
