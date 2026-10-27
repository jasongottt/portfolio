import { useEffect, useRef } from "react";
import { RULE, shade, tint } from "../palette";
import { worldMap } from "../data/worldMap";
import { MINT } from "./dusk";
import { SWEET, meterAt } from "./skipStones";

const VERB = { section: "Visit", link: "Open", project: "Play" };

const skipsText = (count) => `${count} ${count === 1 ? "skip" : "skips"}`;

// The skipping game's prompt (WorldBackground.jsx keeps the game): the meter
// to time a throw on, the count as the stone skips, then how it went.
function skippingPrompt(skip, best) {
  if (skip.phase === "aim") return { level: "Throw when it's in the middle", meter: skip.since, verb: "Throw" };
  if (skip.phase === "flying") return { level: "Skipping stones", title: skip.count ? skipsText(skip.count) : "…" };
  const result =
    skip.skips === 0 ? "Plunk. No skips" : `${skipsText(skip.skips)}${skip.ashore ? ", all the way across!" : "!"}`;
  return {
    level: skip.newBest ? "New best!" : `Skipping stones · Best ${best}`,
    accent: skip.newBest,
    title: result,
    verb: "Again",
  };
}

// A track with the sweet spot in the middle and a marker sweeping across it,
// on the same clock the throw reads (meterAt).
function SkipMeter({ since }) {
  const markerRef = useRef(null);
  useEffect(() => {
    let frame = requestAnimationFrame(function sweep(now) {
      if (markerRef.current) markerRef.current.style.left = `${meterAt(now - since) * 100}%`;
      frame = requestAnimationFrame(sweep);
    });
    return () => cancelAnimationFrame(frame);
  }, [since]);
  return (
    <span style={styles.meter} aria-hidden="true">
      <span style={styles.sweet} />
      <span ref={markerRef} style={styles.marker} />
    </span>
  );
}

/**
 * Explore mode's bar along the bottom: how to walk, and when the character
 * is close to something, what it is and a button to visit it. `near` is a
 * stage id, "secret", "campfire", "skipping", or null. `activity` is what
 * the character is doing at a spot (runWorld.js): by the campfire, the
 * button gets up again; at the beach, `skip` is the skipping game, and
 * `best` the best throw yet.
 */
export function ExploreHud({ hudRef, isPhone, near, activity, skip, best, onVisit, onLeave }) {
  const stage = worldMap.stages.find((s) => s.id === near);
  const prompt =
    activity === "campfire" ? { level: "Campfire", title: "Sitting by the fire", verb: "Get up" }
    : activity === "skipping" && skip ? skippingPrompt(skip, best)
    : stage ? { level: stage.level, title: stage.banner.title, verb: VERB[stage.action.type] }
    : near === "secret" ? { level: "Secret", accent: true, title: "Something washed up here", verb: "Read" }
    : near === "campfire" ? { level: "Campfire", title: "A crackling fire", verb: "Sit" }
    : near === "skipping" ? { level: "Beach", title: "Calm water, flat stones", verb: "Skip a stone" }
    : null;

  return (
    <div
      ref={hudRef}
      tabIndex={-1}
      role="region"
      aria-label="Explore mode"
      style={{ ...styles.hud, ...(isPhone ? styles.hudPhone : {}) }}
    >
      <p style={styles.text} aria-live="polite">
        {prompt ? (
          <>
            <span style={prompt.accent ? styles.accentLevel : styles.level}>{prompt.level}</span>
            {prompt.meter !== undefined ? (
              <SkipMeter since={prompt.meter} />
            ) : (
              <span style={styles.title}>{prompt.title}</span>
            )}
          </>
        ) : (
          <>
            <span style={styles.level}>Exploring</span>
            <span style={styles.hint}>
              {isPhone ? "Tap the ground to walk" : "Walk with ←↑↓→ or WASD, or click the ground"}
            </span>
          </>
        )}
      </p>
      <div style={styles.actions}>
        {prompt?.verb ? (
          <button type="button" className="pressable" style={styles.visit} onClick={() => onVisit(near)}>
            {prompt.verb}
            {!isPhone ? <kbd style={styles.kbd}>↵</kbd> : null}
          </button>
        ) : null}
        <button type="button" className="pressable" style={styles.leave} onClick={onLeave}>
          Leave
          {!isPhone ? <kbd style={styles.kbd}>Esc</kbd> : null}
        </button>
      </div>
    </div>
  );
}

/** The secret's note, over the world, with a way to act on it. */
export function ExploreNote({ onAction, onClose }) {
  const { title, text, sign, action } = worldMap.secret;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="explore-note-title" style={styles.note}>
      <p id="explore-note-title" style={styles.noteTitle}>
        {title}
      </p>
      <p style={styles.noteText}>{text}</p>
      <p style={styles.noteSign}>— {sign}</p>
      <div style={styles.noteActions}>
        <button type="button" className="pressable" style={styles.visit} onClick={onAction} autoFocus>
          {action.label} →
        </button>
        <button type="button" className="pressable" style={styles.leave} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const plate = {
  border: `1px solid ${RULE}`,
  backgroundColor: shade(27, 4, 0.92),
  backdropFilter: "blur(10px)",
  pointerEvents: "auto",
};

const button = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  fontFamily: "var(--mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const styles = {
  hud: {
    ...plate,
    position: "absolute",
    left: "50%",
    bottom: "20px",
    transform: "translateX(-50%)",
    width: "min(640px, calc(100% - 24px))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "10px 10px 10px 16px",
    boxSizing: "border-box",
    outline: "none",
  },
  hudPhone: {
    bottom: "12px",
    padding: "8px 8px 8px 12px",
    gap: "10px",
  },
  text: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    margin: 0,
    fontFamily: "var(--mono)",
  },
  level: {
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: tint(37, 86, 0.55),
  },
  accentLevel: {
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: MINT,
  },
  title: {
    fontSize: "0.86rem",
    color: tint(50, 97),
  },
  // The skipping meter.
  meter: {
    position: "relative",
    display: "block",
    width: "clamp(110px, 30vw, 200px)",
    height: "10px",
    marginTop: "7px",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(27, 4),
  },
  sweet: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${(0.5 - SWEET) * 100}%`,
    width: `${SWEET * 200}%`,
    backgroundColor: MINT,
    opacity: 0.55,
  },
  marker: {
    position: "absolute",
    top: "-5px",
    bottom: "-5px",
    left: 0,
    width: "4px",
    marginLeft: "-2px",
    backgroundColor: "var(--accent-warm)",
  },
  hint: {
    fontSize: "0.74rem",
    color: tint(40, 88, 0.75),
  },
  actions: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  },
  visit: {
    ...button,
    border: "1px solid var(--accent-warm)",
    backgroundColor: "var(--accent-warm)",
    color: shade(26, 4),
  },
  leave: {
    ...button,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: tint(50, 94),
  },
  kbd: {
    fontFamily: "var(--mono)",
    fontSize: "0.66rem",
    opacity: 0.6,
  },
  note: {
    ...plate,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(420px, calc(100% - 32px))",
    padding: "24px 26px",
    boxSizing: "border-box",
  },
  noteTitle: {
    margin: "0 0 12px",
    fontFamily: "var(--mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: MINT,
  },
  noteText: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.6,
    color: tint(50, 94, 0.9),
  },
  noteSign: {
    margin: "10px 0 20px",
    fontFamily: '"Playfair Display", serif',
    fontSize: "1.1rem",
    color: "var(--accent-warm)",
  },
  noteActions: {
    display: "flex",
    gap: "8px",
  },
};
