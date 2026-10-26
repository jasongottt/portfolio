import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { worldMap } from "../data/worldMap";
import { RULE, shade, tint } from "../palette";
import { HeroIntro } from "../sections/Hero";
import { LAND_RAMP, MINT, SEA_RAMP } from "./dusk";

// The stops the character walks between: one per page section, in order.
const STOPS = worldMap.stages.filter((stage) => stage.action.type === "section");

const coarsePointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

function accessibleName(stage) {
  if (stage.action.type === "section") return `${stage.label}, go to section`;
  if (stage.action.type === "link") return `${stage.label}, opens the PDF in a new tab`;
  return `Play ${stage.label}`;
}

/**
 * The page's background: Jason's world (runWorld.js), fixed behind
 * everything. Also owns what sits on the world: the surname and intro under
 * the word, and an invisible button over each landmark, which is what
 * clicks, keyboard focus and screen readers land on.
 *
 * The three.js side loads after first paint, behind a still dusk gradient.
 * `onStatusChange` reports "ready", or "failed" if WebGL can't run, in which
 * case only the gradient shows and the page heading takes over.
 */
export default function WorldBackground({ isPhone, paused, party, onOpenProject, onStatusChange }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const titleBlockRef = useRef(null);
  const surnameRef = useRef(null);
  const introRef = useRef(null);
  const landmarkRefs = useRef(new Map());
  const worldRef = useRef(null);
  const [status, setStatus] = useState("loading");
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

  const enter = (stage) => {
    if (stage.action.type === "section") {
      document
        .getElementById(stage.action.target)
        ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    } else {
      onOpenProject(stage.action.title, { focusPlayable: true });
    }
  };

  const failed = status === "failed";

  return (
    <div ref={rootRef} style={styles.root}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={party && !reducedMotion ? "world-party" : undefined}
        style={{ ...styles.canvas, opacity: status === "ready" ? 1 : 0 }}
      />

      {!failed ? (
        <>
          <div ref={titleBlockRef} style={{ ...styles.titleBlock, ...(isPhone ? styles.titleBlockPhone : {}) }}>
            <p ref={surnameRef} style={styles.surname} aria-hidden="true">
              Gottesman
            </p>
            <div ref={introRef} style={styles.fade}>
              <HeroIntro isPhone={isPhone} />
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
    // Shown while the world loads, and instead of it if WebGL can't run.
    backgroundColor: SEA_RAMP[0],
    backgroundImage: `radial-gradient(ellipse 120% 60% at 50% 100%, ${LAND_RAMP[2]}55, transparent 70%), linear-gradient(${SEA_RAMP[0]}, ${SEA_RAMP[1]} 55%, ${SEA_RAMP[2]})`,
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    display: "block",
    imageRendering: "pixelated",
    transition: "opacity 600ms ease",
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
    transition: "opacity 600ms ease",
  },
  fade: {
    opacity: 0,
    transition: "opacity 600ms ease",
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
