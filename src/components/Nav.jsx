import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { worldMap } from "../data/worldMap";
import { ditherFrame } from "../ditherFrame";
import { shade, tint } from "../palette";

// One link per section, with the level number its landmark carries.
const navSections = worldMap.stages
  .filter((stage) => stage.action.type === "section")
  .map((stage) => ({ id: stage.action.target, label: stage.label, level: stage.level }));

// Explore is a game thing, so it gets the playable mint.
const MINT_TEXT = "rgba(134, 236, 182, 0.9)";

// A section counts as the current one once its top passes this far down
// the screen.
const CURRENT_LINE = 0.45;

// How many dither pixels the pill's edge takes to fade (ditherFrame.js);
// fewer than the panels', since the pill is short.
const NAV_EDGE = 3;

/**
 * A small floating pill of section links, out of the way of the world: the
 * top-right corner on desktop, a compact row on phones. It appears once the
 * first screen is behind you and marks the section you're in. `onExplore`,
 * when the world can run, adds an Explore link; `hidden` puts it away.
 */
export default function Nav({ heroRef, isPhone, hidden, onExplore }) {
  const [pastHero, setPastHero] = useState(false);
  const visible = pastHero && !hidden;
  const [current, setCurrent] = useState(null);

  // Measuring the header rather than the viewport keeps the reveal honest
  // whatever the first screen's height.
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? window.innerHeight;
      setPastHero(window.scrollY > heroHeight * 0.6);
      const line = window.innerHeight * CURRENT_LINE;
      let id = null;
      for (const section of navSections) {
        const top = document.getElementById(section.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) id = section.id;
      }
      setCurrent(id);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [heroRef]);

  const compact = isPhone ? styles.itemPhone : {};

  return (
    <motion.nav
      style={{
        ...styles.nav,
        ...(isPhone ? styles.navPhone : {}),
        pointerEvents: visible ? "auto" : "none",
      }}
      initial={false}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      inert={!visible}
      aria-label="Section navigation"
    >
      {navSections.map((section) => {
        const isCurrent = section.id === current;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="nav-link"
            style={{ ...styles.link, ...compact, ...(isCurrent ? styles.linkCurrent : {}) }}
            aria-current={isCurrent ? "location" : undefined}
          >
            {!isPhone ? <span style={styles.level}>{section.level}</span> : null}
            {section.label}
          </a>
        );
      })}
      {onExplore ? (
        <button type="button" className="nav-link" style={{ ...styles.explore, ...compact }} onClick={onExplore}>
          Explore
        </button>
      ) : null}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="pressable"
        style={{ ...styles.resume, ...compact }}
      >
        Resume
        {!isPhone ? <ArrowUpRight size={12} aria-hidden="true" /> : null}
      </a>
    </motion.nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    top: "14px",
    right: "16px",
    zIndex: 15,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    // Solid like the section panels, with a thinner dithered edge to suit
    // its height.
    ...ditherFrame(3, NAV_EDGE),
    padding: "0 0 0 4px",
    fontFamily: "var(--mono)",
  },
  // Centered across the top, every link visible without scrolling.
  navPhone: {
    top: "10px",
    right: "auto",
    left: "50%",
    // Motion owns this element's transform (it animates y), so centering
    // has to go through Motion too.
    x: "-50%",
    gap: "0",
    ...ditherFrame(2, NAV_EDGE),
    padding: 0,
    maxWidth: "calc(100% - 16px)",
    // Fits from 360px wide; narrower than that, it scrolls sideways rather
    // than cutting Resume off.
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  // Tighter items on phones, so all six fit on one row.
  itemPhone: {
    padding: "6px 4px",
    fontSize: "0.65rem",
    letterSpacing: "0",
  },
  link: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: "6px",
    padding: "6px 8px",
    color: tint(36, 91, 0.62),
    textDecoration: "none",
    fontSize: "0.7rem",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  explore: {
    padding: "6px 8px",
    border: "none",
    background: "none",
    color: MINT_TEXT,
    fontFamily: "var(--mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  linkCurrent: {
    color: "var(--accent-warm)",
  },
  level: {
    fontSize: "0.6rem",
    opacity: 0.6,
  },
  resume: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginLeft: "4px",
    padding: "6px 9px",
    color: shade(26, 4),
    backgroundColor: "var(--accent-warm)",
    textDecoration: "none",
    fontSize: "0.7rem",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
};
