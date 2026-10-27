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
  if (skip.phase === "aim") return { meter: skip.since, verb: "Throw" };
  if (skip.phase === "flying") return { note: skip.count ? skipsText(skip.count) : "…" };
  const result =
    skip.skips === 0 ? "Plunk. No skips" : `${skipsText(skip.skips)}${skip.ashore ? ", all the way across!" : "!"}`;
  return { note: result, aside: skip.newBest ? "New best!" : `Best ${best}`, accent: skip.newBest, verb: "Again" };
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
 * Explore mode's controls over the world: Leave, in the nav's corner, and
 * when the character is close to something, a button to visit it, popping
 * up along the bottom. `near` is a stage id, "secret", "campfire",
 * "skipping", or null. `activity` is what the character is doing at a spot
 * (runWorld.js): by the campfire, the button gets up again; at the beach,
 * `skip` is the skipping game (its meter and count show over the button),
 * and `best` the best throw yet.
 */
export function ExploreHud({ hudRef, isPhone, near, activity, skip, best, onVisit, onLeave }) {
  const stage = worldMap.stages.find((s) => s.id === near);
  const prompt =
    activity === "campfire" ? { verb: "Get up" }
    : activity === "skipping" && skip ? skippingPrompt(skip, best)
    : stage ? { verb: `${VERB[stage.action.type]} ${stage.banner.title}` }
    : near === "secret" ? { verb: "Read the note" }
    : near === "campfire" ? { verb: "Sit by the fire" }
    : near === "skipping" ? { verb: "Skip a stone" }
    : null;

  return (
    <div ref={hudRef} tabIndex={-1} role="region" aria-label="Explore mode" style={styles.hud}>
      <button
        type="button"
        className="pressable"
        style={{ ...styles.leave, ...styles.corner, ...(isPhone ? styles.cornerPhone : {}) }}
        onClick={onLeave}
      >
        Leave
        {!isPhone ? <kbd style={styles.kbd}>Esc</kbd> : null}
      </button>
      <div style={{ ...styles.prompt, ...(isPhone ? styles.promptPhone : {}) }} aria-live="polite">
        {prompt ? (
          // Keyed by the spot, so it pops up again at the next one.
          <div key={near ?? activity} className="explore-pop" style={styles.pop}>
            {prompt.meter !== undefined || prompt.note ? (
              <p style={styles.tag}>
                {prompt.meter !== undefined ? <SkipMeter since={prompt.meter} /> : prompt.note}
                {prompt.aside ? <span style={prompt.accent ? styles.accent : styles.aside}>{prompt.aside}</span> : null}
              </p>
            ) : null}
            {prompt.verb ? (
              <button type="button" className="pressable" style={styles.visit} onClick={() => onVisit(near)}>
                {prompt.verb}
                {!isPhone ? <kbd style={styles.kbd}>↵</kbd> : null}
              </button>
            ) : null}
          </div>
        ) : null}
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
  // Over the whole world, letting clicks through to it but for the buttons.
  hud: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    outline: "none",
  },
  corner: {
    ...plate,
    position: "absolute",
    top: "14px",
    right: "16px",
  },
  cornerPhone: {
    top: "10px",
    right: "12px",
  },
  prompt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "24px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  promptPhone: {
    bottom: "16px",
  },
  pop: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  // The skipping meter or count, over the button.
  tag: {
    ...plate,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
    padding: "7px 12px",
    fontFamily: "var(--mono)",
    fontSize: "0.78rem",
    color: tint(50, 97),
  },
  aside: {
    color: tint(37, 86, 0.6),
  },
  accent: {
    color: MINT,
  },
  meter: {
    position: "relative",
    display: "block",
    width: "clamp(110px, 30vw, 200px)",
    height: "10px",
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
  visit: {
    ...button,
    border: "1px solid var(--accent-warm)",
    backgroundColor: "var(--accent-warm)",
    color: shade(26, 4),
    boxShadow: "0 6px 18px rgba(4, 3, 16, 0.5)",
    pointerEvents: "auto",
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
    fontFamily: "var(--heading)",
    fontSize: "1.1rem",
    color: "var(--accent-warm)",
  },
  noteActions: {
    display: "flex",
    gap: "8px",
  },
};
