import { AnimatePresence, motion } from "framer-motion";
import { usePortfolioStore } from "../store/portfolioStore";

function microcopy(progress: number): string {
  if (progress < 0.12) return "CAREER ORBIT: ACTIVE";
  if (progress < 0.28) return "PERSONNEL SIGNAL: LOCKED";
  if (progress < 0.48) return "PROJECT MATRIX: SYNCHRONIZED";
  if (progress < 0.62) return "SKILL ORBITS: CALIBRATED";
  if (progress < 0.74) return "GITHUB LINK: CONNECTED";
  if (progress < 0.85) return "TRAJECTORY: TRACKED";
  return "EXPERIMENTAL SYSTEMS: ONLINE";
}

export function Hud() {
  const progress = usePortfolioStore((s) => s.scrollProgress);
  const quality = usePortfolioStore((s) => s.quality);
  const secret = usePortfolioStore((s) => s.secretMode);
  const githubSource = usePortfolioStore((s) => s.github.source);
  const systemMessage = usePortfolioStore((s) => s.systemMessage);
  const systemMessageKey = usePortfolioStore((s) => s.systemMessageKey);

  const pct = Math.round(progress * 100);

  return (
    <>
      {secret && (
        <div className="secret-badge" role="status">
          DEV SECRET MODE
        </div>
      )}

      <AnimatePresence>
        {systemMessage && (
          <motion.div
            key={systemMessageKey}
            className="sys-msg"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            role="status"
          >
            {systemMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
