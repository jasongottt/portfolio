import { RULE, shade, tint } from "../palette";
import { ProjectBadges } from "./ProjectMeta";

// One tile in the projects grid: the first screenshot, year and badges, the
// title, and on wider screens two lines of description. `style` places it in
// the grid.
export default function ProjectCard({ project, isPhone, onOpen, style }) {
  return (
    <button
      type="button"
      data-project-card=""
      className="card-link"
      style={{ ...styles.cardLink, ...style }}
      onClick={() => onOpen(project)}
      aria-label={`Open details for ${project.title}`}
    >
      <article className="project-card" style={styles.card}>
        <div style={styles.thumb}>
          <img src={project.screenshots[0].path} alt="" loading="lazy" style={styles.thumbImage} />
        </div>
        <div style={{ ...styles.body, ...(isPhone ? styles.bodyPhone : {}) }}>
          <div style={styles.metaRow}>
            <ProjectBadges {...project} />
          </div>
          <h3 style={{ ...styles.title, ...(isPhone ? styles.titlePhone : {}) }}>{project.title}</h3>
          {!isPhone ? <p style={styles.description}>{project.description}</p> : null}
        </div>
      </article>
    </button>
  );
}

const styles = {
  cardLink: {
    appearance: "none",
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    display: "block",
    minWidth: 0,
    padding: 0,
    textAlign: "inherit",
  },
  card: {
    position: "relative",
    height: "100%",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(25, 5, 0.82),
    textAlign: "left",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  thumb: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 10",
    overflow: "hidden",
    borderBottom: `1px solid ${RULE}`,
    backgroundColor: shade(40, 2, 0.9),
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  body: {
    padding: "10px 12px 12px",
  },
  bodyPhone: {
    padding: "8px 9px 10px",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: "2px 8px",
  },
  title: {
    margin: "5px 0 4px",
    fontSize: "1.15rem",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: tint(100, 98),
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  titlePhone: {
    fontSize: "1rem",
  },
  description: {
    color: tint(38, 89, 0.7),
    fontSize: "0.78rem",
    lineHeight: 1.45,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
};
