import { useEffect } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
];

export function useKonami(): void {
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI[idx]) {
        idx += 1;
        if (idx === KONAMI.length) {
          idx = 0;
          const store = usePortfolioStore.getState();
          const nowSecret = !store.secretMode;
          store.setSecretMode(nowSecret);
          store.emitSystemMessage(
            nowSecret ? "DEVELOPER SECRET MODE: ACTIVATED" : "DEVELOPER SECRET MODE: DEACTIVATED"
          );
          audio.blip("open");
        }
      } else {
        idx = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
