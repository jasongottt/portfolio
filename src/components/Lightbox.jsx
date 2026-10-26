import { X } from "lucide-react";
import { RULE, shade, tint } from "../palette";

export default function Lightbox({ image, onClose }) {
  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.label}
    >
      <button
        type="button"
        className="icon-button"
        style={styles.close}
        onClick={onClose}
        aria-label="Close image preview"
      >
        <X size={18} aria-hidden="true" />
      </button>
      <figure style={styles.stage} onClick={(event) => event.stopPropagation()}>
        <img src={image.path} alt={image.label} style={styles.image} />
        <figcaption style={styles.caption}>{image.label}</figcaption>
      </figure>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: shade(40, 2, 0.92),
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
  stage: {
    width: "min(1200px, 100%)",
    maxHeight: "100%",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "88vh",
    objectFit: "contain",
    display: "block",
    border: `1px solid ${RULE}`,
  },
  caption: {
    fontFamily: "var(--mono)",
    color: tint(45, 86, 0.78),
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
};
