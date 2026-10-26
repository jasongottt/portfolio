import { worldMap } from "../data/worldMap";
import { ditherFrame } from "../ditherFrame";
import { RULE_SOFT, tint } from "../palette";
import { SPRITES } from "../world/pixelArt";
import PixelSprite from "../world/PixelSprite";

// The world's stage for a section, so its heading can carry the same
// landmark and level number.
const stageFor = (id) =>
  worldMap.stages.find((stage) => stage.action.type === "section" && stage.action.target === id);

// How many dither pixels the panels' edges take to fade (ditherFrame.js).
const EDGE = 8;

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

// Every page section is the same solid panel, dithered at the edges, under a
// ruled title.
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
  // The frame is the background (border-image fills the middle too). Padding
  // plus the frame's width keeps the content where it was.
  panel: {
    marginTop: "40px",
    ...ditherFrame(3, EDGE),
    padding: "9px 13px 13px",
    pointerEvents: "auto",
  },
  panelPhone: {
    marginTop: "26px",
    ...ditherFrame(2, EDGE),
    padding: "7px 3px 9px",
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
