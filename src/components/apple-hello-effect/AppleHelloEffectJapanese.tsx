import { motion } from "framer-motion";

interface AppleHelloEffectJapaneseProps {
  className?: string;
  durationScale?: number;
  onAnimationComplete?: () => void;
}

export function AppleHelloEffectJapanese({
  className,
  durationScale = 1,
  onAnimationComplete,
}: AppleHelloEffectJapaneseProps) {
  return (
    <motion.svg
      className={["apple-hello-svg", className].filter(Boolean).join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 760 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      role="img"
      aria-label="こんにちは"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <title>こんにちは</title>
      <motion.text
        x="380"
        y="145"
        textAnchor="middle"
        fontFamily='"Hiragino Maru Gothic ProN", "Yu Gothic", "Meiryo", sans-serif'
        fontSize="112"
        fontWeight="400"
        letterSpacing="5"
        stroke="currentColor"
        fill="currentColor"
        initial={{ opacity: 0, y: 160, scale: 0.96 }}
        animate={{ opacity: 1, y: 145, scale: 1 }}
        transition={{ duration: 1.6 * durationScale, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={onAnimationComplete}
      >
        こんにちは
      </motion.text>
    </motion.svg>
  );
}
