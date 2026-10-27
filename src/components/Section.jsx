import { worldMap } from "../data/worldMap";
import { DITHERED, ditherFrame } from "../ditherFrame";
import { RULE_SOFT, tint } from "../palette";
import { SPRITES } from "../world/pixelArt";
import PixelSprite from "../world/PixelSprite";

// The world's stage for a section, so its heading can carry the same
// landmark and level number.
const stageFor = (id) =>
  worldMap.stages.find((stage) => stage.action.type === "section" && stage.action.target === id);

// How many dither pixels the panels' edges take to fade (ditherFrame.js).
const EDGE = 8;

// Each section the character walks to gets open space above it. On phones
// the panels are full width, so that's where the world shows between them,
// and the walk happens as the gap scrolls by (world/journey.js). On desktop
// the world is always in view beside the column; the gap gives the walk room
// between panels rather than under the last one's text.
const TRAVEL_GAP_PHONE = "56svh";
const TRAVEL_GAP_DESKTOP = "22svh";

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
// ruled title. `style` layers on top for sections that need more.
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
        ...(travels ? { marginTop: isPhone ? TRAVEL_GAP_PHONE : TRAVEL_GAP_DESKTOP } : {}),
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
  // The frame is the background (ditherFrame.js). Dithered, its edge takes
  // room of its own, so the padding is less; plain, it's the original 1px
  // rule and padding.
  panel: {
    marginTop: "40px",
    ...ditherFrame(3, EDGE),
    padding: DITHERED ? "18px 22px 22px" : "32px 36px 36px",
    pointerEvents: "auto",
  },
  panelPhone: {
    marginTop: "26px",
    ...ditherFrame(2, EDGE),
    padding: DITHERED ? "14px 10px 16px" : "22px 18px 24px",
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
