import { ChevronDown } from "lucide-react";
import { tint } from "../palette";

/** The one-line intro under the name. */
export function HeroIntro({ isPhone }) {
  return (
    <p style={{ ...styles.lead, ...(isPhone ? styles.leadPhone : {}) }}>
      CS + Game Development student at Purdue University with a passion for human-computer interaction through interesting software and video games.
    </p>
  );
}

/**
 * The first screen. It's empty on purpose: the world behind the page shows
 * the name in islands, with the surname and intro under it
 * (world/WorldBackground.jsx). The heading stays for screen readers and
 * search engines, and shows only if the world can't run (`showHeading`).
 */
export default function Hero({ heroRef, isPhone, showHeading }) {
  return (
    <header id="top" ref={heroRef} style={{ ...styles.landing, ...(isPhone ? styles.landingPhone : {}) }}>
      {showHeading ? (
        <div style={styles.fallback}>
          <h1 style={{ ...styles.name, ...(isPhone ? styles.namePhone : {}) }}>Jason Gottesman</h1>
          <HeroIntro isPhone={isPhone} />
        </div>
      ) : (
        <h1 style={styles.hidden}>Jason Gottesman</h1>
      )}

      {!isPhone ? (
        // Bobs with a CSS animation (index.css), which runs off the main thread.
        <a href="#about" className="scroll-cue" style={styles.scrollCue} aria-label="Scroll to about section">
          <ChevronDown size={22} aria-hidden="true" />
        </a>
      ) : null}
    </header>
  );
}

const styles = {
  landing: {
    position: "relative",
    height: "100svh",
    minHeight: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  landingPhone: {
    minHeight: "480px",
  },
  fallback: {
    maxWidth: "880px",
    textAlign: "center",
    pointerEvents: "auto",
  },
  // Visually hidden, still read out.
  hidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
  name: {
    margin: 0,
    fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
    lineHeight: 1.02,
    letterSpacing: "-0.05em",
    whiteSpace: "nowrap",
    color: "white",
  },
  namePhone: {
    fontSize: "2.3rem",
    letterSpacing: "-0.04em",
  },
  lead: {
    maxWidth: "560px",
    margin: "12px auto 0",
    fontSize: "1rem",
    lineHeight: 1.55,
    color: tint(50, 94, 0.82),
  },
  leadPhone: {
    marginTop: "8px",
    fontSize: "0.92rem",
  },
  scrollCue: {
    position: "absolute",
    bottom: "18px",
    left: "50%",
    transform: "translateX(-50%)",
    color: tint(45, 86, 0.7),
    opacity: 0.6,
    textDecoration: "none",
    display: "flex",
    padding: "6px",
    pointerEvents: "auto",
  },
};
