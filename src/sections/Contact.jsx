import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import Section from "../components/Section";
import { contactLinks } from "../data/contact";
import { RULE, RULE_SOFT, tint } from "../palette";

// How long the Copy button shows its check mark.
const COPIED_MS = 2000;

/**
 * A plain list of ways to reach me, one row each: an icon and the handle,
 * the whole row a link (screen readers hear the service's name too). Email
 * has a small Copy button beside it for anyone who'd rather not open a mail
 * app.
 */
export default function Contact({ isPhone }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Clipboard blocked; the address is right there to select.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <Section id="contact" title="Contact" isPhone={isPhone}>
      <ul style={styles.list}>
        {contactLinks.map(({ icon, label, value, href, external }, index) => {
          const Icon = icon;
          const isEmail = href.startsWith("mailto:");
          return (
            <li key={label} style={{ ...styles.row, ...(index > 0 ? styles.rowRuled : {}) }}>
              <a
                href={href}
                className="contact-row"
                style={styles.link}
                aria-label={`${label}, ${value}`}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon size={15} aria-hidden="true" style={styles.icon} />
                <span style={styles.value}>{value}</span>
                {!isEmail ? <ArrowUpRight size={14} aria-hidden="true" style={styles.arrow} /> : null}
              </a>
              {isEmail ? (
                <button
                  type="button"
                  className="nav-link"
                  style={styles.copy}
                  onClick={() => copy(value)}
                  aria-label="Copy email address"
                  title={copied ? "Copied" : "Copy email address"}
                >
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <span role="status" style={styles.hidden}>
        {copied ? "Email address copied" : ""}
      </span>
    </Section>
  );
}

const styles = {
  // The section header's rule is right above, so the list only rules
  // between rows.
  list: {
    listStyle: "none",
    margin: "-6px 0 -10px",
    padding: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
  },
  rowRuled: {
    borderTop: `1px solid ${RULE_SOFT}`,
  },
  link: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 8px",
    textDecoration: "none",
    color: tint(50, 97, 0.94),
  },
  icon: {
    flexShrink: 0,
    color: tint(46, 79, 0.75),
  },
  value: {
    flex: 1,
    minWidth: 0,
    fontSize: "0.92rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  arrow: {
    flexShrink: 0,
    color: tint(46, 79, 0.55),
  },
  copy: {
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    width: "30px",
    height: "30px",
    marginRight: "4px",
    padding: 0,
    border: `1px solid ${RULE}`,
    background: "transparent",
    color: tint(46, 79, 0.85),
    cursor: "pointer",
  },
  // Visually hidden, still read out.
  hidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
  },
};
