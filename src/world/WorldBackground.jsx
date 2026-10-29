import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { worldMap } from "../data/worldMap";
import { RULE, shade, tint } from "../palette";
import { HeroIntro } from "../sections/Hero";
import { LAND_RAMP, MINT, SEA_AVERAGE, SEA_RAMP } from "./dusk";
import { ExploreHud, ExploreNote } from "./ExploreHud";
import { nameplate } from "./nameplate";
import { meterAt, skipsFor } from "./skipStones";

// The stops the character walks between: one per page section, in order.
const STOPS = worldMap.stages.filter((stage) => stage.action.type === "section");

const coarsePointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

// The opening: JASON. drawn over the islands. It fades in with the world,
// over APPEAR_MS, holds for HOLD_MS, then fades out letter by letter over
// FADE_MS.
const APPEAR_MS = 350;
const HOLD_MS = 900;
const FADE_MS = 1400;
const FADE_STAGGER_MS = 90;

// The best skipping-stones throw, kept in this browser.
const BEST_KEY = "jason-world:best-skips";
function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveBest(skips) {
  try {
    localStorage.setItem(BEST_KEY, String(skips));
  } catch {
    // Storage is off (a private window, say): the best lasts this visit.
  }
}

const isTyping = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
const isControl = (target) => target instanceof HTMLElement && Boolean(target.closest("button, a"));

function accessibleName(stage) {
  if (stage.action.type === "section") return `${stage.label}, go to section`;
  if (stage.action.type === "link") return `${stage.label}, opens the PDF in a new tab`;
  return `Play ${stage.label}`;
}

/**
 * The page's background: Jason's world (runWorld.js), fixed behind
 * everything. Also owns what sits on the world: the surname and intro under
 * the word, an invisible button over each landmark, which is what clicks,
 * keyboard focus and screen readers land on, and one over Jason himself,
 * which pokes him.
 *
 * The three.js side loads after first paint, behind a still dusk gradient.
 * `onStatusChange` reports "ready", or "failed" if WebGL can't run, in which
 * case only the gradient shows and the page heading takes over.
 *
 * On load, the name sits over the islands, drawn from the same strokes the
 * islands are made from (nameplate.js), then fades to reveal them.
 *
 * Explore mode lets the visitor walk the character around, sit by the
 * campfire and skip stones. `exploring` is owned by the page (App.jsx),
 * which hides itself meanwhile; this asks to change it through
 * `onExploringChange`, from the Explore link or E, and Escape or Leave.
 */
export default function WorldBackground({
  isPhone,
  paused,
  party,
  exploring,
  onExploringChange,
  onOpenProject,
  onStatusChange,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const titleBlockRef = useRef(null);
  const surnameRef = useRef(null);
  const introRef = useRef(null);
  const inviteRef = useRef(null);
  const heroRef = useRef(null);
  const landmarkRefs = useRef(new Map());
  const worldRef = useRef(null);
  const hudRef = useRef(null);
  // Where focus was before exploring, to put it back after.
  const returnFocusRef = useRef(null);
  const [status, setStatus] = useState("loading");
  // Whether the world has drawn its first frame. The water and the name
  // fade in together then, not before.
  const [drawn, setDrawn] = useState(false);
  const [near, setNear] = useState(null);
  // What the character is doing at a spot (runWorld.js), and the skipping
  // game while it's at the beach: aiming (the meter sweeping since `since`),
  // a stone in flight, or done.
  const [activity, setActivity] = useState(null);
  const [skip, setSkip] = useState(null);
  const [best, setBest] = useState(readBest);
  const [noteOpen, setNoteOpen] = useState(false);
  // The opening name: "shown", "fading" or "gone". Skipped if the page
  // opens scrolled away from the top, where the islands aren't.
  const [opening, setOpening] = useState(() => (window.scrollY < 40 ? "shown" : "gone"));
  const [letters, setLetters] = useState(() => nameplate(window.innerWidth, window.innerHeight));
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    import("./runWorld")
      .then(({ runWorld }) => {
        if (cancelled) return;
        worldRef.current = runWorld({
          canvas: canvasRef.current,
          map: worldMap,
          stops: STOPS.map((stage) => stage.id),
          sections: STOPS.map((stage) => document.getElementById(stage.action.target)),
          landmarks: landmarkRefs.current,
          layer: rootRef.current,
          titleBlock: titleBlockRef.current,
          surname: surnameRef.current,
          intro: introRef.current,
          invite: inviteRef.current,
          hero: heroRef.current,
          onNear: setNear,
          onActivity: (id) => {
            setActivity(id);
            setSkip(id === "skipping" ? { phase: "aim", since: performance.now() } : null);
          },
          onFirstFrame: () => setDrawn(true),
          onLost: () => setStatus("failed"),
        });
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn("World background unavailable:", error);
        setStatus("failed");
      });
    return () => {
      cancelled = true;
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, []);

  useEffect(() => {
    worldRef.current?.setPaused(paused);
  }, [paused, status]);

  useEffect(() => {
    worldRef.current?.setReducedMotion(Boolean(reducedMotion));
  }, [reducedMotion, status]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Hold the name over the islands until the world has drawn them, then
  // fade it away. Scrolling first fades it at once.
  useEffect(() => {
    if (opening === "gone") return;
    if (status === "failed") {
      setOpening("gone");
      return;
    }
    const onResize = () => setLetters(nameplate(window.innerWidth, window.innerHeight));
    const onScroll = () => window.scrollY > 20 && setOpening((now) => (now === "shown" ? "fading" : now));
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    const timers = [];
    if (drawn && opening === "shown") timers.push(setTimeout(() => setOpening("fading"), APPEAR_MS + HOLD_MS));
    if (opening === "fading") {
      const total = FADE_MS + FADE_STAGGER_MS * letters.length;
      timers.push(setTimeout(() => setOpening("gone"), total));
    }
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      timers.forEach(clearTimeout);
    };
  }, [status, drawn, opening, letters.length]);

  // He winds up while the skipping meter runs.
  useEffect(() => {
    worldRef.current?.setAiming(skip?.phase === "aim");
  }, [skip, status]);

  useEffect(() => {
    worldRef.current?.setExploring(exploring);
    if (exploring) hudRef.current?.focus();
  }, [exploring, status]);

  const scrollToSection = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

  const enter = (stage) => {
    if (stage.action.type === "section") scrollToSection(stage.action.target);
    else onOpenProject(stage.action.title, { focusPlayable: true });
  };

  const startExploring = () => {
    returnFocusRef.current = document.activeElement;
    onExploringChange(true);
  };

  const stopExploring = () => {
    setNoteOpen(false);
    onExploringChange(false);
    const previous = returnFocusRef.current;
    if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
  };

  // Leaves Explore mode to do what the landmark's button does. A section
  // waits a frame, for the page to come back and unlock its scrolling.
  const leaveFor = (action) => {
    if (action.type === "link") window.open(action.href, "_blank", "noopener,noreferrer");
    stopExploring();
    if (action.type === "section") requestAnimationFrame(() => scrollToSection(action.target));
    if (action.type === "project") onOpenProject(action.title, { focusPlayable: true });
  };

  // Throws with the meter where it is now. A throw's updates only count
  // while it's still the one in flight.
  const throwStone = () => {
    const skips = skipsFor(meterAt(performance.now() - skip.since));
    const throwId = {};
    const record = best;
    setSkip({ phase: "flying", count: 0, throwId });
    worldRef.current?.throwStone(skips, {
      onTouch: (count) => setSkip((now) => (now?.throwId === throwId ? { ...now, count } : now)),
      onDone: ({ skips: made, ashore }) => {
        const newBest = made > record;
        if (newBest) {
          setBest(made);
          saveBest(made);
        }
        setSkip((now) => (now?.throwId === throwId ? { phase: "done", skips: made, ashore, newBest } : now));
      },
    });
  };

  const visit = (id) => {
    const world = worldRef.current;
    if (id === "secret") setNoteOpen(true);
    else if (id === "campfire") {
      if (activity === "campfire") world?.stopActivity();
      else world?.startActivity("campfire");
    } else if (id === "skipping") {
      if (activity !== "skipping") world?.startActivity("skipping");
      else if (skip?.phase === "aim") throwStone();
      else if (skip?.phase === "done") setSkip({ phase: "aim", since: performance.now() });
    } else leaveFor(worldMap.stages.find((stage) => stage.id === id).action);
  };

  const onKeyDown = useEffectEvent((event) => {
    if (status !== "ready" || paused || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
    if (!exploring) {
      if (event.code === "KeyE") {
        event.preventDefault();
        startExploring();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (noteOpen) setNoteOpen(false);
      else stopExploring();
    } else if (event.key === "Enter" && near && !noteOpen && !isControl(event.target)) {
      event.preventDefault();
      visit(near);
    }
  });

  useEffect(() => {
    const listener = (event) => onKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const failed = status === "failed";

  return (
    <div
      ref={rootRef}
      style={{ ...styles.root, ...(failed ? styles.rootFallback : {}) }}
      data-opening={opening !== "gone" ? "" : undefined}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={party && !reducedMotion ? "world-party" : undefined}
        style={{ ...styles.canvas, opacity: drawn ? 1 : 0 }}
      />


      {opening !== "gone" ? (
        <svg style={styles.nameplate} aria-hidden="true">
          {letters.map(({ char, paths, strokeWidth }, index) => (
            <g
              key={char}
              style={{
                ...styles.nameLetter,
                ...(opening === "fading"
                  ? { opacity: 0, transition: `opacity ${FADE_MS}ms ease ${index * FADE_STAGGER_MS}ms` }
                  : { opacity: drawn ? 1 : 0 }),
              }}
            >
              {/* A dark copy a few pixels down, as a drop shadow. */}
              {paths.map((d, i) => (
                <path key={`shadow-${i}`} d={d} strokeWidth={strokeWidth} stroke={SEA_RAMP[0]} transform="translate(0 4)" />
              ))}
              {paths.map((d, i) => (
                <path key={i} d={d} strokeWidth={strokeWidth} stroke="var(--accent-warm)" />
              ))}
            </g>
          ))}
        </svg>
      ) : null}

      {!failed ? (
        <>
          <div ref={titleBlockRef} style={{ ...styles.titleBlock, ...(isPhone ? styles.titleBlockPhone : {}) }}>
            <p ref={surnameRef} style={styles.surname} aria-hidden="true">
              Gottesman
            </p>
            {/* The intro at the top of the page, and at the end, in the same
                spot, an invitation to explore (runWorld.js shows each). */}
            <div style={styles.under}>
              <div ref={introRef} style={{ ...styles.fade, ...styles.stacked }}>
                <HeroIntro isPhone={isPhone} />
              </div>
              <div ref={inviteRef} style={{ ...styles.fade, ...styles.stacked }}>
                {/* <p style={styles.thanks}>thanks for visiting!!!</p> */}
                <button type="button" className="nav-link" style={styles.explore} onClick={startExploring}>
                  {isPhone ? "Explore" : "Press E to explore"}
                </button>
              </div>
            </div>
          </div>

          {worldMap.stages.map((stage) => {
            const playable = stage.action.type === "project";
            const label = (
              <span className="world-label" style={styles.label}>
                <span style={styles.labelLevel}>{stage.level}</span>
                <span style={styles.labelTitle}>{stage.banner.title}</span>
                <span style={styles.labelDetail}>{stage.banner.detail}</span>
                {playable ? (
                  <span style={styles.labelPlayable}>
                    {stage.needsKeyboard && coarsePointer ? "Playable on desktop" : "Playable!"}
                  </span>
                ) : null}
              </span>
            );
            const dot = (
              <span className="world-dot" style={{ ...styles.dot, ...(isPhone ? styles.dotPhone : {}) }} aria-hidden="true" />
            );
            const common = {
              ref: (element) => {
                landmarkRefs.current.set(stage.id, element);
                return () => landmarkRefs.current.delete(stage.id);
              },
              className: "world-landmark",
              style: styles.landmark,
              "aria-label": accessibleName(stage),
            };
            return stage.action.type === "link" ? (
              <a key={stage.id} href={stage.action.href} target="_blank" rel="noopener noreferrer" {...common}>
                {label}
                {dot}
              </a>
            ) : (
              <button key={stage.id} type="button" onClick={() => enter(stage)} {...common}>
                {label}
                {dot}
              </button>
            );
          })}

          {exploring ? (
            <>
              {/* Clicks and taps on the world walk the character there. */}
              <div
                style={styles.tapLayer}
                aria-hidden="true"
                onPointerDown={(event) => worldRef.current?.walkTo(event.clientX, event.clientY)}
              />
              <ExploreHud
                hudRef={hudRef}
                isPhone={isPhone}
                near={near}
                activity={activity}
                skip={skip}
                best={best}
                onVisit={visit}
                onLeave={stopExploring}
              />
              {noteOpen ? (
                <ExploreNote onAction={() => leaveFor(worldMap.secret.action)} onClose={() => setNoteOpen(false)} />
              ) : null}
            </>
          ) : null}

          {/* Over Jason himself (runWorld.js places it): clicking pokes him.
              A click doesn't take focus, so Enter still does what the
              Explore button says. */}
          <button
            ref={heroRef}
            type="button"
            className="world-hero"
            style={styles.hero}
            aria-label="Jason (poke him)"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => worldRef.current?.poke()}
          />
        </>
      ) : null}
    </div>
  );
}

const styles = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
    // The sea's own color while the world loads, so it fades in over it.
    backgroundColor: SEA_AVERAGE,
  },
  // Instead of the world, if WebGL can't run.
  rootFallback: {
    backgroundColor: SEA_RAMP[0],
    backgroundImage: `radial-gradient(ellipse 120% 60% at 50% 100%, ${LAND_RAMP[2]}55, transparent 70%), linear-gradient(${SEA_RAMP[0]}, ${SEA_RAMP[1]} 55%, ${SEA_RAMP[2]})`,
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    display: "block",
    imageRendering: "pixelated",
    transition: `opacity ${APPEAR_MS}ms ease`,
  },
  nameplate: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    overflow: "visible",
  },
  // Fades in with the canvas; the fade out sets its own, slower transition.
  nameLetter: {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    transition: `opacity ${APPEAR_MS}ms ease`,
  },
  titleBlock: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(880px, calc(100% - 32px))",
    textAlign: "center",
  },
  titleBlockPhone: {
    width: "calc(100% - 32px)",
  },
  // Clear of the circles under the landmarks along the bottom of the word.
  surname: {
    margin: "22px 0 18px",
    // The letter spacing trails after the last letter too; padding it on
    // the left keeps the word centered.
    paddingLeft: "1.1em",
    fontFamily: "var(--mono)",
    fontSize: "clamp(18px, 2.6vw, 36px)",
    fontWeight: 700,
    letterSpacing: "1.1em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    color: "var(--accent-warm)",
    textShadow: `0 3px 0 ${SEA_RAMP[0]}`,
    opacity: 0,
    visibility: "hidden",
    transition: "opacity 600ms ease, visibility 600ms",
  },
  fade: {
    opacity: 0,
    visibility: "hidden",
    transition: "opacity 600ms ease, visibility 600ms",
  },
  // The intro and the invitation to explore share a spot under the surname.
  under: {
    display: "grid",
  },
  stacked: {
    gridArea: "1 / 1",
  },
  thanks: {
    margin: "8px 0 12px",
    fontFamily: "var(--heading)",
    fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)",
    color: tint(50, 97),
    textShadow: `0 3px 0 ${SEA_RAMP[0]}`,
  },
  // Explore is a game thing, so it's in the playable mint, as in the nav;
  // just the words, so the last screen stays clean.
  explore: {
    appearance: "none",
    padding: "6px 10px",
    border: "none",
    background: "none",
    fontFamily: "var(--mono)",
    fontSize: "0.8rem",
    letterSpacing: "0.04em",
    color: MINT,
    cursor: "pointer",
    pointerEvents: "auto",
  },
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
    pointerEvents: "auto",
    visibility: "hidden",
  },
  tapLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "auto",
    cursor: "pointer",
  },
  landmark: {
    position: "absolute",
    top: 0,
    left: 0,
    visibility: "hidden",
    padding: 0,
    border: 0,
    background: "none",
    cursor: "pointer",
    pointerEvents: "auto",
  },
  label: {
    position: "absolute",
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    padding: "7px 11px",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(27, 4, 0.92),
    fontFamily: "var(--mono)",
    whiteSpace: "nowrap",
    textAlign: "center",
    pointerEvents: "none",
  },
  // A white circle in the middle of the button, shown while the camera rests
  // on the overview, when the button sits under the landmark (runWorld.js,
  // index.css).
  dot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "12px",
    height: "12px",
    margin: "-6px 0 0 -6px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    pointerEvents: "none",
  },
  dotPhone: {
    width: "10px",
    height: "10px",
    margin: "-5px 0 0 -5px",
  },
  labelLevel: {
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: tint(37, 86, 0.55),
  },
  labelTitle: {
    fontSize: "0.82rem",
    color: tint(50, 97),
  },
  labelDetail: {
    fontSize: "0.66rem",
    color: tint(40, 88, 0.7),
  },
  labelPlayable: {
    fontSize: "0.66rem",
    color: MINT,
  },
};
