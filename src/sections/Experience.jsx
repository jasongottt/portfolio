import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import Section from "../components/Section";
import { TechLine } from "../components/ProjectMeta";
import { experience } from "../data/experience";
import { shade, tint } from "../palette";

// The timeline's line and dots. The dots are opaque so the line stops at
// each one rather than running through it.
const LINE = tint(50, 80, 0.22);
const DOT = tint(50, 80, 0.55);

/**
 * The roles as a timeline: each one's dates, title, company and a single
 * sentence, with the full bullet points behind "Show details". The role
 * that's still going has a filled dot.
 */
export default function Experience({ isPhone, onOpenProject }) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (key) =>
    setOpen((keys) => {
      const next = new Set(keys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <Section id="experience" title="Experience" isPhone={isPhone}>
      <ol style={styles.list}>
        {experience.map((job, index) => {
          const key = `${job.org}-${job.role}`;
          const current = /present/i.test(job.dates);
          const hasDetails = Boolean(job.points?.length || job.tech || job.project);
          const isOpen = open.has(key);
          const detailsId = `experience-details-${index}`;
          return (
            <li
              key={key}
              style={{ ...styles.entry, ...(index === experience.length - 1 ? styles.entryLast : {}) }}
            >
              <span aria-hidden="true" style={{ ...styles.dot, ...(current ? styles.dotCurrent : {}) }} />
              <p style={styles.when}>{[job.dates, job.location].filter(Boolean).join("  ·  ")}</p>
              <h3 style={{ ...styles.role, ...(isPhone ? styles.rolePhone : {}) }}>{job.role}</h3>
              <p style={styles.org}>
                {job.org}
                {job.detail ? <span style={styles.orgDetail}>{`  ·  ${job.detail}`}</span> : null}
                {job.previous ? <span style={styles.orgDetail}>{`  ·  Previously ${job.previous}`}</span> : null}
              </p>
              {job.summary ? <p style={styles.summary}>{job.summary}</p> : null}

              {hasDetails ? (
                <>
                  <button
                    type="button"
                    className="nav-link"
                    style={styles.toggle}
                    aria-expanded={isOpen}
                    aria-controls={detailsId}
                    onClick={() => toggle(key)}
                  >
                    {isOpen ? "Hide details" : "Show details"}
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      style={{ ...styles.chevron, ...(isOpen ? styles.chevronOpen : {}) }}
                    />
                  </button>
                  <div id={detailsId} hidden={!isOpen}>
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
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

const styles = {
  // The line runs down behind the dots, from the first to the bottom.
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    backgroundImage: `linear-gradient(${LINE}, ${LINE})`,
    backgroundSize: "1px calc(100% - 16px)",
    backgroundPosition: "3px 8px",
    backgroundRepeat: "no-repeat",
  },
  entry: {
    position: "relative",
    padding: "0 0 26px 26px",
  },
  entryLast: {
    paddingBottom: 0,
  },
  dot: {
    position: "absolute",
    left: 0,
    top: "4px",
    width: "7px",
    height: "7px",
    boxSizing: "border-box",
    borderRadius: "50%",
    border: `1.5px solid ${DOT}`,
    backgroundColor: shade(30, 7),
  },
  dotCurrent: {
    borderColor: tint(60, 84),
    backgroundColor: tint(60, 84),
  },
  when: {
    fontFamily: "var(--mono)",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tint(37, 86, 0.55),
  },
  role: {
    margin: "6px 0 2px",
    fontSize: "1.3rem",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    color: tint(100, 98),
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  rolePhone: {
    fontSize: "1.15rem",
  },
  org: {
    color: tint(50, 94, 0.86),
    fontSize: "0.92rem",
  },
  orgDetail: {
    color: tint(38, 89, 0.6),
  },
  summary: {
    marginTop: "8px",
    color: tint(38, 89, 0.74),
    fontSize: "0.9rem",
    lineHeight: 1.55,
  },
  toggle: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "6px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: tint(60, 84, 0.8),
    cursor: "pointer",
    fontSize: "0.82rem",
  },
  chevron: {
    transition: "transform 160ms ease",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  points: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "12px 0 0",
    paddingLeft: "18px",
    // Tailwind's preflight strips list markers, so ask for them back.
    listStyleType: "square",
    color: tint(36, 91, 0.78),
    fontSize: "0.88rem",
    lineHeight: 1.55,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "14px",
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
