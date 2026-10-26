import { Trophy } from "lucide-react";
import { tint } from "../palette";

// Year plus any badges. The caller supplies the row they sit in.
export function ProjectBadges({ year, accent, award }) {
  return (
    <>
      <span style={styles.year}>{year}</span>
      {accent ? <span style={styles.accent}>{accent}</span> : null}
      {award ? (
        <span style={styles.award}>
          <Trophy size={10} aria-hidden="true" />
          {award}
        </span>
      ) : null}
    </>
  );
}

// Takes the comma-separated string from the data files.
export function TechLine({ tech }) {
  return (
    <p style={styles.techLine}>
      {tech.split(",").map((item) => item.trim()).join("  /  ")}
    </p>
  );
}

const styles = {
  year: {
    fontFamily: "var(--mono)",
    color: tint(37, 86, 0.5),
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
  },
  accent: {
    fontFamily: "var(--mono)",
    color: "rgba(134, 236, 182, 0.95)",
    fontSize: "0.66rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  award: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginLeft: "auto",
    color: tint(55, 88, 0.9),
    fontSize: "0.62rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  techLine: {
    fontFamily: "var(--mono)",
    color: tint(50, 94, 0.72),
    fontSize: "0.68rem",
    lineHeight: 1.7,
  },
};
