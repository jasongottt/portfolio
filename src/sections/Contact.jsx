import { ArrowUpRight } from "lucide-react";
import Section from "../components/Section";
import { contactLinks } from "../data/contact";
import { RULE, shade, tint } from "../palette";

export default function Contact({ isPhone }) {
  return (
    <Section id="contact" title="Contact" isPhone={isPhone}>
      <div
        style={{
          ...styles.grid,
          ...(isPhone ? styles.gridPhone : {}),
        }}
      >
        {contactLinks.map(({ icon: Icon, label, value, href, external }) => (
          <a
            key={label}
            href={href}
            className="contact-row"
            style={styles.card}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <span style={styles.labelRow}>
              <Icon size={13} style={styles.icon} aria-hidden="true" />
              <span style={styles.label}>{label}</span>
            </span>
            <span style={styles.valueRow}>
              <span style={styles.value}>{value}</span>
              <ArrowUpRight
                size={14}
                style={styles.arrow}
                aria-hidden="true"
              />
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  gridPhone: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
    overflow: "hidden",
    padding: "16px",
    border: `1px solid ${RULE}`,
    backgroundColor: shade(25, 5, 0.6),
    textDecoration: "none",
    color: tint(50, 94),
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    minWidth: 0,
  },
  icon: {
    color: tint(46, 79, 0.75),
    flexShrink: 0,
  },
  label: {
    fontFamily: "var(--mono)",
    color: tint(46, 79, 0.72),
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  valueRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    minWidth: 0,
  },
  value: {
    color: tint(50, 97, 0.94),
    fontSize: "0.9rem",
    lineHeight: 1.35,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  arrow: {
    flexShrink: 0,
    color: tint(46, 79, 0.55),
  },
};
