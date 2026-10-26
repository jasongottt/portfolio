import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { photos } from "../data/photos";
import { RULE, shade, tint } from "../palette";

// Each print's tilt in degrees, top to bottom.
const TILTS = [-6, 5, -3];
// On desktop the prints are tucked behind the About panel's right edge, this
// far down it, poking out by PEEK px; hovering slides one further out.
const DESK_TOPS = [26, 196, 366];
const PEEK = 64;
const PAPER = "#f3efe6";
const INK = "#2b2540";

// Motion's elements under capitalized names, which lint sees as used.
const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionFigure = motion.figure;

/**
 * Polaroids of Jason: tucked behind the About panel on desktop, a fanned row
 * under its text on phones. Hovering lifts one; clicking flies it out to the
 * middle of the screen at full size, and clicking again (or Escape) puts it
 * back. The print in the stack and the open one share a layoutId, so Motion
 * animates one into the other. `onViewingChange` reports whether one is open,
 * so the page can hold still behind it.
 */
export default function Polaroids({ isPhone, onViewingChange }) {
  const [open, setOpen] = useState(null);
  const reduceMotion = useReducedMotion();
  const prints = useRef([]);
  const closeRef = useRef(null);
  const lastOpen = useRef(null);

  useEffect(() => {
    onViewingChange?.(open !== null);
  }, [open, onViewingChange]);

  // Focus the close button while one is open, Escape closes it, and focus
  // returns to its print in the stack afterward.
  useEffect(() => {
    if (open === null) {
      const index = lastOpen.current;
      lastOpen.current = null;
      if (index !== null) requestAnimationFrame(() => prints.current[index]?.focus({ preventScroll: true }));
      return;
    }
    lastOpen.current = open;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const fly = reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 };

  return (
    <>
      <div style={isPhone ? styles.row : styles.stack}>
        {photos.map((photo, index) => {
          const place = isPhone ? styles.printPhone : { ...styles.printDesk, top: `${DESK_TOPS[index]}px`, zIndex: index + 1 };
          // While open, an invisible stand-in holds its place in the stack.
          if (open === index) return <span key={photo.src} aria-hidden="true" style={{ ...styles.print, ...place, visibility: "hidden" }} />;
          return (
            <MotionButton
              key={photo.src}
              ref={(element) => (prints.current[index] = element)}
              type="button"
              layoutId={`polaroid-${index}`}
              style={{ ...styles.print, ...place, rotate: TILTS[index] }}
              whileHover={reduceMotion ? undefined : { x: isPhone ? 0 : 22, y: -6, rotate: TILTS[index] / 3, scale: 1.04, zIndex: 5 }}
              whileFocus={reduceMotion ? undefined : { y: -4, zIndex: 5 }}
              transition={fly}
              onClick={() => setOpen(index)}
              aria-label={`Open photo: ${photo.caption}`}
            >
              <img src={photo.thumb} alt="" loading="lazy" style={styles.photo} />
            </MotionButton>
          );
        })}
      </div>

      {createPortal(
        <AnimatePresence>
          {open !== null ? (
            <MotionDiv
              key="viewer"
              style={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(null)}
              role="dialog"
              aria-modal="true"
              aria-label={photos[open].caption}
            >
              <button ref={closeRef} type="button" className="icon-button" style={styles.close} aria-label="Close photo">
                <X size={18} aria-hidden="true" />
              </button>
              <MotionFigure layoutId={`polaroid-${open}`} style={{ ...styles.open, rotate: 0 }} transition={fly}>
                <img src={photos[open].src} alt={photos[open].alt} style={styles.photo} />
                <figcaption style={styles.caption}>{photos[open].caption}</figcaption>
              </MotionFigure>
            </MotionDiv>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const styles = {
  // Desktop: a layer behind the panel (About.jsx stacks the panel above it).
  stack: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
  },
  print: {
    appearance: "none",
    display: "block",
    border: "none",
    backgroundColor: PAPER,
    boxShadow: "0 8px 18px rgba(4, 3, 16, 0.55)",
    cursor: "pointer",
    pointerEvents: "auto",
  },
  printDesk: {
    position: "absolute",
    left: `calc(100% - ${PEEK}px)`,
    width: "124px",
    padding: "7px 7px 26px",
  },
  printPhone: {
    position: "relative",
    width: "92px",
    margin: "0 -5px",
    padding: "5px 5px 18px",
  },
  photo: {
    display: "block",
    width: "100%",
    aspectRatio: "3 / 4",
    objectFit: "cover",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: shade(40, 2, 0.88),
    cursor: "zoom-out",
  },
  close: {
    position: "absolute",
    top: "22px",
    right: "22px",
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    padding: 0,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: tint(50, 94),
    cursor: "pointer",
  },
  // The open print: as tall as fits, paper margins scaled up to match.
  open: {
    width: "min(86vw, calc(74vh * 0.75 + 36px))",
    margin: 0,
    padding: "18px 18px 0",
    backgroundColor: PAPER,
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
  },
  caption: {
    padding: "16px 8px 20px",
    textAlign: "center",
    fontFamily: '"Playfair Display", serif',
    fontStyle: "italic",
    fontSize: "1.15rem",
    color: INK,
  },
};
