import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { worldMap } from "../data/worldMap";
import { RULE, shade, tint } from "../palette";

// One link per section, with the level number its landmark carries.
const navSections = worldMap.stages
  .filter((stage) => stage.action.type === "section")
  .map((stage) => ({ id: stage.action.target, label: stage.label, level: stage.level }));

// A section counts as the current one once its top passes this far down
// the screen.
const CURRENT_LINE = 0.45;

/**
 * A small floating pill of section links, out of the way of the world: the
 * top-right corner on desktop, a compact row on phones. It appears once the
 * first screen is behind you and marks the section you're in.
 */
export default function Nav({ heroRef, isPhone }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  // Measuring the header rather than the viewport keeps the reveal honest
  // whatever the first screen's height.
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? window.innerHeight;
      setVisible(window.scrollY > heroHeight * 0.6);
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
            style={{ ...styles.link, ...(isCurrent ? styles.linkCurrent : {}) }}
            aria-current={isCurrent ? "location" : undefined}
          >
            {!isPhone ? <span style={styles.level}>{section.level}</span> : null}
            {section.label}
          </a>
        );
      })}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="pressable"
        style={styles.resume}
      >
        Resume
        <ArrowUpRight size={12} aria-hidden="true" />
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
    padding: "4px 4px 4px 8px",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(27, 4, 0.82),
    backdropFilter: "blur(10px)",
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
    padding: "3px 3px 3px 4px",
    maxWidth: "calc(100% - 16px)",
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
