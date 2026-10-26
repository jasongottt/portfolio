import { RULE, shade, tint } from "../palette";
import { worldMap } from "../data/worldMap";
import { MINT } from "./dusk";

const VERB = { section: "Visit", link: "Open", project: "Play" };

/**
 * Explore mode's bar along the bottom: how to walk, and when the character
 * is close to something, what it is and a button to visit it. `near` is a
 * stage id, "secret", or null.
 */
export function ExploreHud({ hudRef, isPhone, near, onVisit, onLeave }) {
  const stage = worldMap.stages.find((s) => s.id === near);
  const prompt = stage
    ? { level: stage.level, title: stage.banner.title, verb: VERB[stage.action.type] }
    : near === "secret"
      ? { level: "Secret", title: "Something washed up here", verb: "Read" }
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
            <span style={prompt.level === "Secret" ? styles.secretLevel : styles.level}>{prompt.level}</span>
            <span style={styles.title}>{prompt.title}</span>
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
        {prompt ? (
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
  secretLevel: {
    fontSize: "0.62rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: MINT,
  },
  title: {
    fontSize: "0.86rem",
    color: tint(50, 97),
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
