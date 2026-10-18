import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface AppleHelloEffectJapaneseProps {
  className?: string;
  durationScale?: number;
  onAnimationComplete?: () => void;
}

// Original neon-handwriting paths from the supplied Konnichiwa HTML.
const STROKE_GROUPS: string[][] = [
  [
    "M34.75,26.75c1.12,0.88,2.91,2.01,6,1.5c7.62-1.25,14.11-2.56,22.38-2.62c15.5-0.12,5.88,5-5.75,9",
    "M30,68.12c2.25,14.5,15.26,17.96,31,16.75c6.5-0.5,11.88-1.25,17.62-2.88",
  ],
  [
    "M56.35,16.5c0.75,1.75,1.13,5.83-0.38,8.25c-7,11.25-27.22,43.47-33.88,54.37c-9,14.75-7.62,16.25,1.5,1.25c17.86-29.36,32-23.76,32-6.75c0,25,19,26.5,34.25-5",
  ],
  [
    "M24.53,22.75c1.25,1.5,1.62,3.75,1.12,6.38c-3,15.88-9,32.5-7.38,47.62c2.02,18.84,4.5,5.75,8.5-3.5",
    "M53.2,30.64c0.96,0.79,2.44,1.58,5.1,1.35c6.98-0.61,15.01-3.3,22.04-3.36c13.19-0.11,1.5,3.75-8.39,7.35",
    "M52.53,68c1.76,12.92,11.92,16.01,24.23,14.93c5.08-0.45,8.9-0.8,14.27-2.06",
  ],
  [
    "M24.5,32.62c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,18.25-4.12,26.88-6c2.64-0.57,5.38-1.5,7.62-2.38",
    "M45.62,15.62c0.75,1.25,0.71,3.58,0.38,5.25c-3,15-4.25,22.59-8.38,38.62c-3.25,12.62-5.38,11.12,3.62,4.38c8.29-6.21,19.75-9.5,28.5-9.5c8.62,0,14.58,5.88,14.5,14.5c-0.12,13.5-16.5,20.62-29.88,23.25",
  ],
  [
    "M24.51,18c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.62-6.98,36.4-4,54.88c2.5,15.5,1.12,2,5.62-6.25",
    "M49.64,37.89c2.41,1.57,4.85,2.16,7.8,1.71c9.36-1.43,17.46-2.94,23.4-4.57c3.12-0.86,5.96-1.29,7.8-1.29",
    "M69.77,16.5c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,1.5,38.62,1.5,48c0,22.5-30.62,19.62-30.62,10.5c0-9.75,23.88-5.62,29.5-2.88c5.62,2.74,11.98,8.26,13.36,9.38",
  ],
];

const GLYPH_SIZE = 109;
const GLYPH_GAP = -6;
const TOTAL_SECONDS = 3.5;
const STROKE_SECONDS = 0.55;
const STROKE_COUNT = STROKE_GROUPS.reduce((sum, group) => sum + group.length, 0);
const STROKE_STEP = (TOTAL_SECONDS - STROKE_SECONDS) / (STROKE_COUNT - 1);

export function AppleHelloEffectJapanese({
  className,
  durationScale = 1,
  onAnimationComplete,
}: AppleHelloEffectJapaneseProps) {
  let strokeIndex = 0;

  return (
    <motion.svg
      className={["apple-hello-svg", className].filter(Boolean).join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 515 109"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter:
          "drop-shadow(0 0 6px rgba(120, 230, 255, .75)) drop-shadow(0 0 18px rgba(60, 170, 255, .45))",
      }}
      role="img"
      aria-label="こんにちは"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <title>こんにちは</title>
      {STROKE_GROUPS.map((strokes, groupIndex) => (
        <g
          key={groupIndex}
          transform={`translate(${groupIndex * (GLYPH_SIZE + GLYPH_GAP)} 0)`}
        >
          {strokes.map((path) => {
            const index = strokeIndex++;
            const isLast = index === STROKE_COUNT - 1;

            return (
              <path
                key={path}
                d={path}
                pathLength={1}
                className="apple-hello-draw-path"
                style={
                  {
                    "--hello-duration": `${STROKE_SECONDS * durationScale}s`,
                    "--hello-delay": `${index * STROKE_STEP * durationScale}s`,
                  } as CSSProperties
                }
                onAnimationEnd={isLast ? onAnimationComplete : undefined}
              />
            );
          })}
        </g>
      ))}
    </motion.svg>
  );
}
