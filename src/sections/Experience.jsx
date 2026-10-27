import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import Section from "../components/Section";
import { TechLine } from "../components/ProjectMeta";
import { experience } from "../data/experience";
import { shade, tint } from "../palette";

// The timeline's line, and how far down its row each dot sits: level with
// the row's first line (the title on desktop, the dates on phones).
const LINE = tint(50, 80, 0.22);
const DOT_TOP = { desk: 21, phone: 18 };
// How long a row takes to open or close.
const EXPAND_MS = 220;

// The line runs from the first dot to the last: each row draws its own
// stretch, so it follows rows as they open.
function lineFor(index, last, dotTop) {
  if (last === 0) return {};
  const center = dotTop + 3;
  const [top, height] = index === 0 ? [center, `calc(100% - ${center}px)`] : index === last ? [0, `${center}px`] : [0, "100%"];
  return {
    backgroundImage: `linear-gradient(${LINE}, ${LINE})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `3px ${top}px`,
    backgroundSize: `1px ${height}`,
  };
}

/**
 * The roles as a compact timeline: title, company and dates per row, each
 * opening to its details. The ongoing role's dot pulses (index.css) and the
 * upcoming one's is peach.
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

  const dotTop = isPhone ? DOT_TOP.phone : DOT_TOP.desk;
  const last = experience.length - 1;

  return (
    <Section id="experience" title="Experience" isPhone={isPhone}>
      <ol style={styles.list}>
        {experience.map((job, index) => {
          const key = `${job.org}-${job.role}`;
          const current = /present/i.test(job.dates);
          const expandable = Boolean(job.points?.length || job.tech || job.project);
          const isOpen = open.has(key);
          const detailsId = `experience-details-${index}`;
          const headStyle = { ...styles.head, ...(isPhone ? styles.headPhone : {}) };
          const head = (
            <>
              <span style={styles.main}>
                <span className="xp-role" style={{ ...styles.role, ...(isPhone ? styles.rolePhone : {}) }}>
                  {job.role}
                </span>
                <span style={styles.org}>
                  {job.org}
                  {job.detail ? <span style={styles.orgDetail}>{`  ·  ${job.detail}`}</span> : null}
                  {job.previous ? <span style={styles.orgDetail}>{`  ·  Previously ${job.previous}`}</span> : null}
                </span>
              </span>
              <span style={{ ...styles.aside, ...(isPhone ? styles.asidePhone : {}) }}>
                <span style={styles.when}>{job.dates}</span>
                {expandable ? (
                  <ChevronDown
                    size={15}
                    aria-hidden="true"
                    style={{ ...styles.chevron, ...(isOpen ? styles.chevronOpen : {}) }}
                  />
                ) : null}
              </span>
            </>
          );

          return (
            <li key={key} style={{ ...styles.entry, ...lineFor(index, last, dotTop) }}>
              <span
                aria-hidden="true"
                className={current ? "xp-dot-now" : undefined}
                style={{
                  ...styles.dot,
                  top: `${dotTop}px`,
                  ...(current ? styles.dotCurrent : job.upcoming ? styles.dotUpcoming : {}),
                }}
              />
              <h3 style={styles.heading}>
                {expandable ? (
                  <button
                    type="button"
                    className="xp-row"
                    style={headStyle}
                    aria-expanded={isOpen}
                    aria-controls={detailsId}
                    onClick={() => toggle(key)}
                  >
                    {head}
                  </button>
                ) : (
                  <span style={headStyle}>{head}</span>
                )}
              </h3>

              {expandable ? (
                // Opens by easing its grid row from 0fr to 1fr; hidden once
                // closed, so its links drop out of the tab order.
                <div
                  id={detailsId}
                  className="xp-details"
                  style={{
                    ...styles.details,
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    visibility: isOpen ? "visible" : "hidden",
                    transition: `grid-template-rows ${EXPAND_MS}ms ease, visibility 0s linear ${isOpen ? 0 : EXPAND_MS}ms`,
                  }}
                >
                  <div style={styles.detailsInner}>
                    {job.location ? <p style={styles.location}>{job.location}</p> : null}
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
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

// Martian Mono is wide already, so the labels are only lightly spaced.
const mono = {
  fontFamily: "var(--mono)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const styles = {
  list: {
    listStyle: "none",
    margin: "-6px 0 -8px",
    padding: 0,
  },
  entry: {
    position: "relative",
    paddingLeft: "26px",
  },
  dot: {
    position: "absolute",
    left: 0,
    width: "7px",
    height: "7px",
    boxSizing: "border-box",
    borderRadius: "50%",
    border: `1.5px solid ${tint(50, 80, 0.55)}`,
    backgroundColor: shade(30, 7),
  },
  dotCurrent: {
    borderColor: tint(60, 84),
    backgroundColor: tint(60, 84),
  },
  dotUpcoming: {
    borderColor: "var(--accent-warm)",
  },
  heading: {
    margin: 0,
    fontSize: "inherit",
    fontWeight: "inherit",
    letterSpacing: "normal",
    lineHeight: "inherit",
  },
  // The row: title and company on the left, dates and chevron on the right.
  head: {
    appearance: "none",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    width: "100%",
    padding: "12px 0",
    border: "none",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },
  // Phones put the dates above the title, chevron at the end of that line.
  headPhone: {
    flexDirection: "column",
    gap: "4px",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },
  role: {
    fontFamily: "var(--heading)",
    fontWeight: 500,
    fontSize: "1.15rem",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    color: tint(100, 98),
  },
  rolePhone: {
    fontSize: "1.08rem",
  },
  org: {
    color: tint(50, 94, 0.86),
    fontSize: "0.88rem",
  },
  orgDetail: {
    color: tint(38, 89, 0.6),
  },
  aside: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
    marginTop: "4px",
  },
  asidePhone: {
    order: -1,
    width: "100%",
    justifyContent: "space-between",
    marginTop: 0,
  },
  when: {
    ...mono,
    fontSize: "0.66rem",
    whiteSpace: "nowrap",
    color: tint(37, 86, 0.55),
  },
  chevron: {
    flexShrink: 0,
    color: tint(46, 79, 0.7),
    transition: "transform 200ms ease",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  details: {
    display: "grid",
  },
  detailsInner: {
    minHeight: 0,
    overflow: "hidden",
  },
  location: {
    ...mono,
    fontSize: "0.62rem",
    color: tint(37, 86, 0.5),
  },
  points: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "10px 0 0",
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
    margin: "12px 0 14px",
  },
  projectLink: {
    ...mono,
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: tint(45, 86, 0.85),
    cursor: "pointer",
    fontSize: "0.68rem",
  },
};
