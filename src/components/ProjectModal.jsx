import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink, FileText, Github, Play, X } from "lucide-react";
import { RULE, RULE_SOFT, shade, tint } from "../palette";
import { ProjectBadges, TechLine } from "./ProjectMeta";

const floatingMediaPositions = [
  { top: "4%", left: "1.5%", rotate: "-8deg" },
  { top: "8%", right: "1.5%", rotate: "7deg" },
  { bottom: "6%", left: "4%", rotate: "-6deg" },
  { bottom: "10%", right: "3%", rotate: "6deg" },
];

// Godot builds take keyboard focus once they load, after which Escape goes to
// the game instead of the page. Builds hosted here are same-origin, so listen
// inside the frame too. A cross-origin build (itch.io) can't be reached; the
// close button and the backdrop still work there.
const listenForEscape = (iframe, onClose) => {
  try {
    iframe.contentWindow.addEventListener("keydown", (event) => {
      if (event.key === "Escape") onClose();
    });
  } catch {
    // Cross-origin frame.
  }
};

// Builds are 16:9 unless they say otherwise. Width is capped so a tall build
// (like a square one) still fits on screen without scrolling the modal.
const playableFrameStyle = (aspectRatio = 16 / 9) => ({
  ...styles.playableFrame,
  aspectRatio: String(aspectRatio),
  width: `min(100%, ${(75 * aspectRatio).toFixed(2)}vh)`,
});

export default function ProjectModal({ project, focusPlayable, isPhone, onClose, onOpenImage }) {
  const prefersReducedMotion = useReducedMotion();
  const playableRef = useRef(null);
  // Games are tens of megabytes, so they only load when asked for: a click on
  // the poster, or arriving from a game landmark in the world, which already
  // meant "play".
  const [playing, setPlaying] = useState(Boolean(focusPlayable));
  const screenshots = project.screenshots.slice(0, 4);
  const hasLinks = project.repoUrl || project.liveUrl || project.readMoreUrl;

  // Hand focus back to whatever opened the popup when it closes. Without
  // this, closing it while a game had focus leaves the keyboard pointed at a
  // frame that no longer exists.
  useEffect(() => {
    const opener = document.activeElement;
    return () => {
      if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
        opener.focus({ preventScroll: true });
      } else {
        window.focus();
      }
    };
  }, []);

  // Opened from a game landmark in the world: skip the write-up and land on the
  // game. Waits a frame so the popup has laid out before scrolling it.
  useEffect(() => {
    if (!focusPlayable) return;
    const frame = requestAnimationFrame(() =>
      playableRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      })
    );
    return () => cancelAnimationFrame(frame);
  }, [focusPlayable, project, prefersReducedMotion]);

  return (
    <motion.div
      style={{
        ...styles.overlay,
        ...(isPhone ? styles.overlayPhone : {}),
      }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div
        style={{
          ...styles.stage,
          ...(isPhone ? styles.stagePhone : {}),
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {!isPhone &&
          screenshots.map((image, index) => {
            const position = floatingMediaPositions[index % floatingMediaPositions.length];
            return (
              <motion.div
                key={image.path}
                style={{ ...styles.floatingMediaCard, ...position }}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  y: prefersReducedMotion ? 310 : [320, 300, 320],
                  rotate: position.rotate,
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.24 },
                  y: {
                    duration: 5 + index,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                  rotate: { duration: 0.24 },
                }}
              >
                <button
                  type="button"
                  className="media-tile"
                  style={styles.floatingMediaButton}
                  onClick={() => onOpenImage(image)}
                  aria-label={`Enlarge screenshot: ${image.label}`}
                >
                  <div style={styles.floatingMediaInner}>
                    <img
                      src={image.path}
                      alt={image.label}
                      loading="lazy"
                      style={styles.floatingImage}
                    />
                    <span style={styles.mediaCaption}>{image.label}</span>
                  </div>
                </button>
              </motion.div>
            );
          })}

        <motion.div
          style={{
            ...styles.card,
            ...(isPhone ? styles.cardPhone : {}),
          }}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 230, damping: 24 }}
        >
          <div
            style={{
              ...styles.header,
              ...(isPhone ? styles.headerPhone : {}),
            }}
          >
            <div style={styles.metaRow}>
              <ProjectBadges {...project} />
            </div>
            <button
              type="button"
              className="icon-button"
              style={styles.close}
              onClick={onClose}
              aria-label="Close project details"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <h3 id="project-modal-title" style={styles.title}>
            {project.title}
          </h3>
          <p style={styles.lead}>{project.description}</p>

          <TechLine tech={project.tech} />

          {hasLinks ? (
            <div style={styles.actions}>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable"
                  style={styles.actionPrimary}
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  Live demo
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable"
                  style={styles.actionButton}
                >
                  <Github size={16} aria-hidden="true" />
                  Source
                </a>
              ) : null}
              {project.readMoreUrl ? (
                <a
                  href={project.readMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable"
                  style={styles.actionButton}
                >
                  <FileText size={16} aria-hidden="true" />
                  Write-up
                </a>
              ) : null}
            </div>
          ) : null}

          <div style={styles.divider} />

          <p style={styles.text}>{project.details}</p>

          {project.playableEmbed ? (
            <div ref={playableRef} style={styles.section}>
              <h4 style={styles.sectionTitle}>{project.playableEmbed.label}</h4>
              {project.playableEmbed.ready ? (
                <div style={playableFrameStyle(project.playableEmbed.aspectRatio)}>
                  {playing ? (
                    <iframe
                      src={project.playableEmbed.path}
                      title={`${project.title} playable build`}
                      style={styles.playableEmbed}
                      onLoad={(event) => listenForEscape(event.currentTarget, onClose)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="play-poster"
                      style={styles.playPoster}
                      onClick={() => setPlaying(true)}
                      aria-label={`Play ${project.title}${project.playableEmbed.size ? `, about ${project.playableEmbed.size} download` : ""}`}
                    >
                      <img src={project.screenshots[0].path} alt="" style={styles.posterImage} />
                      <span className="play-cta" style={styles.playCta}>
                        <Play size={15} aria-hidden="true" />
                        Play
                      </span>
                      <span style={styles.playMeta}>
                        {project.playableEmbed.size ? `About ${project.playableEmbed.size} · ` : ""}
                        Runs in your browser
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.playablePlaceholder}>
                  <p style={styles.text}>
                    placeholder
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>

        {isPhone ? (
          <div style={styles.mediaRail}>
            {screenshots.map((image) => (
              <button
                key={image.path}
                type="button"
                style={styles.mediaRailButton}
                onClick={() => onOpenImage(image)}
                aria-label={`Enlarge screenshot: ${image.label}`}
              >
                <div style={styles.mediaRailInner}>
                  <img
                    src={image.path}
                    alt={image.label}
                    loading="lazy"
                    style={styles.mediaRailImage}
                  />
                  <span style={styles.mediaCaption}>{image.label}</span>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: shade(33, 2, 0.78),
    backdropFilter: "blur(6px)",
  },
  overlayPhone: {
    alignItems: "flex-start",
    overflowY: "auto",
    padding: "12px",
  },
  stage: {
    position: "relative",
    width: "min(1180px, 100%)",
    minHeight: "min(88vh, 920px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stagePhone: {
    width: "100%",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
  },
  floatingMediaCard: {
    position: "absolute",
    width: "220px",
    overflow: "hidden",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(23, 5, 0.92),
    pointerEvents: "auto",
  },
  floatingMediaButton: {
    appearance: "none",
    width: "100%",
    height: "100%",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  floatingMediaInner: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: shade(22, 7, 0.95),
  },
  floatingImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },
  mediaCaption: {
    fontFamily: "var(--mono)",
    color: tint(45, 86, 0.72),
    fontSize: "0.68rem",
    lineHeight: 1.5,
    textAlign: "left",
  },
  card: {
    width: "min(680px, 100%)",
    maxHeight: "min(88vh, 920px)",
    padding: "28px",
    backgroundColor: shade(27, 4, 0.98),
    border: `1px solid ${RULE}`,
    textAlign: "left",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  cardPhone: {
    width: "100%",
    maxHeight: "none",
    padding: "22px 18px",
  },
  header: {
    position: "sticky",
    top: "-28px",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    margin: "-28px -28px 22px",
    padding: "16px 22px",
    borderBottom: `1px solid ${RULE_SOFT}`,
    backgroundColor: shade(27, 4, 0.98),
  },
  headerPhone: {
    top: "-22px",
    margin: "-22px -18px 18px",
    padding: "14px 18px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  close: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "30px",
    height: "30px",
    padding: 0,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: tint(50, 94),
    cursor: "pointer",
  },
  title: {
    margin: "0 0 14px",
    fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
    color: tint(100, 98),
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  lead: {
    color: tint(58, 95, 0.9),
    fontSize: "1.04rem",
    lineHeight: 1.55,
    marginBottom: "18px",
  },
  actions: {
    display: "flex",
    marginTop: "22px",
    flexWrap: "wrap",
  },
  actionPrimary: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    textDecoration: "none",
    color: shade(26, 4),
    backgroundColor: "var(--accent-warm)",
    border: "1px solid var(--accent-warm)",
    fontSize: "0.74rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  actionButton: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    textDecoration: "none",
    color: tint(50, 94),
    backgroundColor: "transparent",
    border: `1px solid ${RULE}`,
    marginLeft: "-1px",
    fontSize: "0.74rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  divider: {
    height: "1px",
    margin: "26px 0 22px",
    backgroundColor: RULE_SOFT,
  },
  text: {
    color: tint(36, 91, 0.78),
    marginBottom: "14px",
    whiteSpace: "pre-wrap",
  },
  section: {
    marginTop: "26px",
  },
  sectionTitle: {
    fontFamily: "var(--mono)",
    margin: "0 0 12px",
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: tint(50, 94, 0.85),
    fontWeight: 500,
  },
  playableFrame: {
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(20, 6, 0.9),
  },
  playableEmbed: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    backgroundColor: shade(25, 5),
  },
  // Click-to-play cover: the project's first screenshot, dimmed, with a Play
  // button styled like the "Live demo" one.
  playPoster: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    height: "100%",
    padding: 0,
    border: "none",
    overflow: "hidden",
    cursor: "pointer",
    backgroundColor: shade(25, 5),
  },
  posterImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.28,
  },
  playCta: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 22px",
    border: "1px solid var(--accent-warm)",
    backgroundColor: "var(--accent-warm)",
    color: shade(26, 4),
    fontFamily: "var(--mono)",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  // On a dark plate, like the world's landmark labels, so it reads over any screenshot.
  playMeta: {
    position: "relative",
    padding: "3px 8px 2px",
    backgroundColor: "hsl(var(--hue) calc(40% * var(--sat)) 4% / 0.82)",
    fontFamily: "var(--mono)",
    fontSize: "0.66rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tint(50, 94, 0.8),
  },
  playablePlaceholder: {
    border: `1px dashed ${RULE}`,
    backgroundColor: shade(20, 6, 0.86),
    padding: "20px",
  },
  mediaRail: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    width: "100%",
  },
  mediaRailButton: {
    appearance: "none",
    width: "100%",
    padding: 0,
    border: `1px solid ${RULE}`,
    background: shade(23, 5, 0.9),
    overflow: "hidden",
    cursor: "pointer",
    textAlign: "left",
  },
  mediaRailInner: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: shade(22, 7, 0.95),
  },
  mediaRailImage: {
    width: "100%",
    aspectRatio: "16 / 10",
    objectFit: "cover",
    display: "block",
  },
};
