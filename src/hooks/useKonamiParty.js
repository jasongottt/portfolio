import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
// Matches the world-party animation in index.css.
const PARTY_MS = 4500;

/**
 * True for a few seconds after the Konami code, while the world's colors
 * sweep around the wheel. Never with reduced motion.
 */
export function useKonamiParty() {
  const [party, setParty] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let progress = 0;
    let timer = 0;
    const onKeyDown = (event) => {
      if (event.code === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          clearTimeout(timer);
          setParty(true);
          timer = setTimeout(() => setParty(false), PARTY_MS);
        }
      } else {
        progress = event.code === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
      setParty(false);
    };
  }, [prefersReducedMotion]);

  return party;
}
