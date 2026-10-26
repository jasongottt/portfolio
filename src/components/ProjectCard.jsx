import { RULE, RULE_SOFT, shade, tint } from "../palette";
import { ProjectBadges, TechLine } from "./ProjectMeta";

export default function ProjectCard({ project, isPhone, onOpen }) {
  return (
    <button
      type="button"
      data-project-card=""
      className="card-link"
      style={{ ...styles.cardLink, ...(isPhone ? styles.cardLinkPhone : {}) }}
      onClick={() => onOpen(project)}
      aria-label={`Open details for ${project.title}`}
    >
      <article
        className="project-card"
        style={{ ...styles.card, ...(isPhone ? styles.cardPhone : {}) }}
      >
        <div style={styles.thumb}>
          <img
            src={project.screenshots[0].path}
            alt=""
            loading="lazy"
            style={styles.thumbImage}
          />
        </div>
        <div style={{ ...styles.body, ...(isPhone ? styles.bodyPhone : {}) }}>
          <div style={styles.metaRow}>
            <ProjectBadges {...project} />
          </div>
          <h3 style={styles.title}>{project.title}</h3>
          <p style={styles.description}>{project.description}</p>
          <div style={styles.techRow}>
            <TechLine tech={project.tech} />
          </div>
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
    flex: "0 0 300px",
    padding: 0,
    textAlign: "inherit",
  },
  cardLinkPhone: {
    flex: "0 0 min(78vw, 280px)",
  },
  card: {
    position: "relative",
    width: "300px",
    minHeight: "418px",
    height: "100%",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(25, 5, 0.82),
    textAlign: "left",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardPhone: {
    width: "min(78vw, 280px)",
    minHeight: "396px",
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
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "18px 20px 20px",
  },
  bodyPhone: {
    padding: "16px 18px 18px",
  },
  metaRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "10px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "1.75rem",
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: tint(100, 98),
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  description: {
    color: tint(38, 89, 0.7),
    marginBottom: "16px",
    fontSize: "0.9rem",
  },
  techRow: {
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: `1px solid ${RULE_SOFT}`,
  },
};
