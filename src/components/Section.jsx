import { worldMap } from "../data/worldMap";
import { PANEL_BG, RULE, RULE_SOFT, tint } from "../palette";
import { SPRITES } from "../world/pixelArt";
import PixelSprite from "../world/PixelSprite";

// The world's stage for a section, so its heading can carry the same
// landmark and level number.
const stageFor = (id) =>
  worldMap.stages.find((stage) => stage.action.type === "section" && stage.action.target === id);

// On phones the panels are full width, so each section the character walks
// to gets open space above it, where the world shows between panels
// (world/journey.js walks it as the gap scrolls by). On desktop the world is
// always in view beside the column, so no gap is needed.
const TRAVEL_GAP_PHONE = "40svh";

// A stage's pixel landmark, at a size that sits beside a section title.
function StageBadge({ icon }) {
  const rows = SPRITES[icon];
  return (
    <svg
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      height={rows.length * 2.5}
      aria-hidden="true"
      shapeRendering="crispEdges"
      style={styles.badge}
    >
      <PixelSprite rows={rows} />
    </svg>
  );
}

// Every page section is the same squared, blurred panel under a ruled title.
// `style` layers on top for sections that need more (the projects rail clips).
export default function Section({ id, title, isPhone, style, children }) {
  const stage = stageFor(id);
  const travels = stage && stage.id !== worldMap.start;

  return (
    <section
      id={id}
      style={{
        ...styles.panel,
        ...style,
        ...(isPhone ? styles.panelPhone : {}),
        ...(travels && isPhone ? { marginTop: TRAVEL_GAP_PHONE } : {}),
      }}
    >
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          {stage ? <StageBadge icon={stage.icon} /> : null}
          <h2 style={styles.title}>{title}</h2>
        </div>
        {stage ? <span style={styles.level}>{stage.level}</span> : null}
      </div>
      {children}
    </section>
  );
}

const styles = {
  panel: {
    marginTop: "40px",
    padding: "32px 36px 36px",
    border: `1px solid ${RULE}`,
    backgroundColor: PANEL_BG,
    backdropFilter: "blur(8px)",
    pointerEvents: "auto",
  },
  panelPhone: {
    marginTop: "26px",
    padding: "22px 18px 24px",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "22px",
    paddingBottom: "14px",
    borderBottom: `1px solid ${RULE_SOFT}`,
  },
  titleGroup: {
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
    minWidth: 0,
  },
  badge: {
    display: "block",
    flexShrink: 0,
    marginBottom: "4px",
  },
  title: {
    margin: 0,
  },
  level: {
    fontFamily: "var(--mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    color: tint(37, 86, 0.5),
    whiteSpace: "nowrap",
  },
};
