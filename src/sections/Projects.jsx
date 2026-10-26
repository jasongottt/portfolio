import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import Section from "../components/Section";
import { projects } from "../data/projects";
import { DITHERED, ditherFrame } from "../ditherFrame";
import { RULE, tint } from "../palette";

// How many projects show before the rest: the first ones in projects.js, two
// by two.
const PREVIEW = 4;
const GAP = 12;

// On desktop the rest are in a drawer: a tab behind the panel's right edge
// slides the panel open across the open side of the screen, two rows high,
// so the page doesn't grow. The first four keep their places (shrinking a
// little to fit) and the rest fill the columns to their right.
const DRAWER_ROWS = 2;
const DRAWER_MS = 450;
const DRAWER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Room left between the open drawer and the screen's right edge.
const DRAWER_MARGIN = 32;
// Narrower tiles than this don't read, so the drawer gives way to the
// "Show all" button below (and on phones).
const MIN_TILE = 190;

// Where each tile sits in the drawer's grid: the first four two by two, the
// rest down the columns after them.
function drawerCell(index) {
  if (index < PREVIEW) return { gridRow: Math.floor(index / 2) + 1, gridColumn: (index % 2) + 1 };
  const rest = index - PREVIEW;
  return { gridRow: (rest % DRAWER_ROWS) + 1, gridColumn: 3 + Math.floor(rest / DRAWER_ROWS) };
}

/**
 * The projects as tiles, each opening the project's popup: the first four,
 * then the rest in a drawer that slides out to the right on desktop, or
 * behind a "Show all" button that grows the grid down the page where there
 * isn't room for one.
 */
export default function Projects({ isPhone, onOpenProject }) {
  const [open, setOpen] = useState(false);
  // The drawer's sizes, or null where it doesn't fit; never on phones.
  const [fit, setFit] = useState(null);
  const drawer = isPhone ? null : fit;
  const wrapperRef = useRef(null);
  const gridBoxRef = useRef(null);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    if (isPhone) return;
    const measure = () => {
      const wrapper = wrapperRef.current;
      const box = gridBoxRef.current;
      if (!wrapper || !box) return;
      // The panel's frame and padding, both sides.
      const chrome = wrapper.getBoundingClientRect().width - box.clientWidth;
      const closed = wrapper.parentElement.clientWidth;
      const columns = 2 + Math.ceil((projects.length - PREVIEW) / DRAWER_ROWS);
      const tileClosed = (closed - chrome - GAP) / 2;
      const room = document.documentElement.clientWidth - wrapper.getBoundingClientRect().left - DRAWER_MARGIN - chrome;
      const tileOpen = Math.min(tileClosed, Math.floor((room - (columns - 1) * GAP) / columns));
      setFit(
        tileOpen >= MIN_TILE
          ? { closed, content: closed - chrome, open: columns * tileOpen + (columns - 1) * GAP + chrome, columns, tileClosed, tileOpen }
          : null
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isPhone]);

  // Escape slides the drawer shut, unless it's closing a popup over it.
  useEffect(() => {
    if (!open || !drawer) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !document.querySelector('[role="dialog"]')) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, drawer]);

  const toggleButton = () => {
    // Collapsing pulls the button up past the hidden tiles. Scroll by the
    // same amount so it stays under the cursor and the page doesn't jump to
    // whatever was below.
    const before = buttonRef.current?.getBoundingClientRect().top;
    setOpen((all) => !all);
    if (open) {
      requestAnimationFrame(() => {
        const after = buttonRef.current?.getBoundingClientRect().top;
        if (before !== undefined && after !== undefined) window.scrollBy({ top: after - before, behavior: "instant" });
      });
    }
  };

  const label = open ? "Show fewer projects" : `Show all ${projects.length} projects`;
  const shown = drawer || open ? projects : projects.slice(0, PREVIEW);
  const slide = `${DRAWER_MS}ms ${DRAWER_EASE}`;

  return (
    <div
      ref={wrapperRef}
      style={drawer ? { ...styles.drawer, width: `${open ? drawer.open : drawer.closed}px`, transition: `width ${slide}` } : undefined}
    >
      <Section id="projects" title="Projects" isPhone={isPhone} style={drawer ? styles.above : undefined}>
        {/* Held to the shut width, so opening the drawer doesn't rewrap it
            and shift the tiles below. */}
        <p style={{ ...styles.intro, ...(drawer ? { maxWidth: `${drawer.content}px` } : {}) }}>
          A selection of projects I've made, some are marked as playable in-browser games.
        </p>
        <div ref={gridBoxRef} style={drawer ? styles.clip : undefined}>
          <div
            id="project-grid"
            style={
              drawer
                ? {
                    ...styles.drawerGrid,
                    gridTemplateColumns: `repeat(${drawer.columns}, ${open ? drawer.tileOpen : drawer.tileClosed}px)`,
                    transition: `grid-template-columns ${slide}`,
                  }
                : { ...styles.grid, ...(isPhone ? styles.gridPhone : {}) }
            }
          >
            {shown.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                isPhone={isPhone}
                onOpen={onOpenProject}
                style={
                  drawer
                    ? {
                        ...drawerCell(index),
                        // The drawer's tiles hide once it's shut, so they
                        // drop out of the tab order.
                        ...(index < PREVIEW
                          ? {}
                          : { visibility: open ? "visible" : "hidden", transition: `visibility 0s linear ${open ? 0 : DRAWER_MS}ms` }),
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
        {!drawer && projects.length > PREVIEW ? (
          <button
            ref={buttonRef}
            type="button"
            className="pressable"
            style={styles.more}
            aria-expanded={open}
            aria-controls="project-grid"
            onClick={toggleButton}
          >
            {label}
          </button>
        ) : null}
      </Section>

      {drawer ? (
        <button
          type="button"
          className="drawer-tab"
          style={styles.tab}
          aria-expanded={open}
          aria-controls="project-grid"
          aria-label={label}
          title={label}
          onClick={() => setOpen((all) => !all)}
        >
          <ChevronRight size={18} aria-hidden="true" style={{ ...styles.arrow, ...(open ? styles.arrowOpen : {}) }} />
        </button>
      ) : null}
    </div>
  );
}

// How much of the tab hides behind the panel. It's the panel's own dark
// surface and dithered edge (the nav's depth), so it reads as part of it.
const TAB_TUCK = 26;

const styles = {
  // Wider than the column it sits in when open; the panel stacks above the
  // tab, which pokes out from behind its right edge.
  drawer: {
    position: "relative",
  },
  above: {
    position: "relative",
    zIndex: 10,
  },
  intro: {
    marginBottom: "18px",
    color: tint(36, 91, 0.74),
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: `${GAP}px`,
  },
  gridPhone: {
    gap: "8px",
  },
  // The drawer's columns run past the panel while it's shut; this clips them.
  clip: {
    overflow: "hidden",
  },
  drawerGrid: {
    display: "grid",
    gridTemplateRows: `repeat(${DRAWER_ROWS}, auto)`,
    gap: `${GAP}px`,
  },
  more: {
    display: "block",
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: `1px solid ${RULE}`,
    background: "transparent",
    color: tint(50, 94, 0.9),
    cursor: "pointer",
    fontSize: "0.88rem",
  },
  tab: {
    position: "absolute",
    top: "50%",
    left: `calc(100% - ${TAB_TUCK}px)`,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: `${TAB_TUCK + 30}px`,
    height: "84px",
    ...ditherFrame(3, 3),
    padding: DITHERED ? 0 : "0 6px 0 0",
    color: tint(60, 88),
    cursor: "pointer",
    pointerEvents: "auto",
  },
  arrow: {
    transition: `transform ${DRAWER_MS}ms ${DRAWER_EASE}`,
  },
  arrowOpen: {
    transform: "rotate(180deg)",
  },
};
