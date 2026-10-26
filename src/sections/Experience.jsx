import { ArrowRight } from "lucide-react";
import Section from "../components/Section";
import { TechLine } from "../components/ProjectMeta";
import { experience } from "../data/experience";
import { RULE_SOFT, tint } from "../palette";

export default function Experience({ isPhone, onOpenProject }) {
  return (
    <Section id="experience" title="Experience" isPhone={isPhone}>
      <ol style={styles.list}>
        {experience.map((job, index) => (
          <li
            key={`${job.org}-${job.role}`}
            style={{
              ...styles.entry,
              ...(index === 0 ? styles.entryFirst : {}),
              ...(isPhone ? styles.entryPhone : {}),
            }}
          >
            <div style={styles.when}>
              <span style={styles.dates}>{job.dates}</span>
              <span style={styles.location}>{job.location}</span>
            </div>

            <div style={styles.body}>
              <h3 style={styles.role}>{job.role}</h3>
              <p style={styles.org}>
                {job.org}
                {job.detail ? <span style={styles.orgDetail}>{`  /  ${job.detail}`}</span> : null}
              </p>

              {job.points?.length ? (
                <ul style={styles.points}>
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}

              {job.tech || job.project ? (
                <div style={styles.footer}>
                  {job.tech ? <TechLine tech={job.tech} /> : null}
                  {job.project ? (
                    <button
                      type="button"
                      className="nav-link"
                      style={styles.projectLink}
                      onClick={() => onOpenProject(job.project)}
                      aria-label={`View project: ${job.project}`}
                    >
                      View project
                      <ArrowRight size={12} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const styles = {
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  // Dates sit above each role; the column is too narrow for them beside it.
  entry: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
    padding: "24px 0",
    borderTop: `1px solid ${RULE_SOFT}`,
  },
  // The section header already draws a rule right above the first entry.
  entryFirst: {
    borderTop: "none",
    paddingTop: "2px",
  },
  entryPhone: {
    padding: "20px 0",
  },
  when: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    paddingTop: "4px",
    fontFamily: "var(--mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  dates: {
    color: tint(45, 86, 0.78),
  },
  location: {
    color: tint(37, 86, 0.5),
  },
  body: {
    minWidth: 0,
  },
  role: {
    margin: 0,
    fontSize: "1.5rem",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    color: tint(100, 98),
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  org: {
    marginTop: "6px",
    color: tint(50, 94, 0.86),
    fontSize: "0.95rem",
  },
  orgDetail: {
    color: tint(38, 89, 0.6),
  },
  points: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "14px 0 0",
    paddingLeft: "18px",
    // Tailwind's preflight strips list markers, so ask for them back.
    listStyleType: "square",
    color: tint(36, 91, 0.78),
    fontSize: "0.92rem",
    lineHeight: 1.55,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  projectLink: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: tint(45, 86, 0.85),
    cursor: "pointer",
    fontFamily: "var(--mono)",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
};
