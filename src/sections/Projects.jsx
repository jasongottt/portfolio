import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import Section from "../components/Section";
import { projects } from "../data/projects";
import { RULE, tint } from "../palette";

export default function Projects({ isPhone, onOpenProject }) {
  const viewportRef = useRef(null);
  const [rail, setRail] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScroll = () => viewport.scrollWidth - viewport.clientWidth;

    const syncRail = () => {
      const max = maxScroll();
      setRail({
        atStart: viewport.scrollLeft <= 1,
        atEnd: max <= 1 || viewport.scrollLeft >= max - 1,
      });
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = maxScroll();
      // Hand the gesture back to the page once the rail bottoms out, so
      // hovering the cards can never stall vertical scrolling.
      const atLeftEdge = event.deltaY < 0 && viewport.scrollLeft <= 0;
      const atRightEdge = event.deltaY > 0 && viewport.scrollLeft >= max - 1;
      if (atLeftEdge || atRightEdge) return;
      event.preventDefault();
      viewport.scrollLeft = Math.min(max, Math.max(0, viewport.scrollLeft + event.deltaY));
    };

    syncRail();
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("scroll", syncRail, { passive: true });
    window.addEventListener("resize", syncRail);

    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("scroll", syncRail);
      window.removeEventListener("resize", syncRail);
    };
  }, []);

  const scrollRail = useCallback((direction) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const card = viewport.querySelector("[data-project-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 340;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  // Fade the rail's own pixels rather than overlaying a gradient -- the panel
  // sits on a translucent background, so an opaque overlay would never match.
  const railFade = isPhone ? "36px" : "52px";
  const railMask = `linear-gradient(to right, ${
    rail.atStart ? "black 0" : `transparent 0, black ${railFade}`
  }, ${rail.atEnd ? "black 100%" : `black calc(100% - ${railFade}), transparent 100%`})`;

  return (
    <Section id="projects" title="Projects" isPhone={isPhone} style={styles.section}>
      <div style={styles.introRow}>
        <p style={styles.intro}>
          A selection of projects I've made, some are marked as playable in-browser games.
        </p>
        {!isPhone ? (
          <div style={styles.railControls}>
            <button
              type="button"
              className="rail-arrow"
              style={styles.railArrow}
              onClick={() => scrollRail(-1)}
              disabled={rail.atStart}
              aria-label="Scroll to previous projects"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="rail-arrow"
              style={styles.railArrow}
              onClick={() => scrollRail(1)}
              disabled={rail.atEnd}
              aria-label="Scroll to more projects"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      <div style={styles.railShell}>
        <div
          ref={viewportRef}
          style={{
            ...styles.viewport,
            ...(isPhone ? styles.viewportPhone : {}),
            maskImage: railMask,
            WebkitMaskImage: railMask,
          }}
        >
          <div style={styles.track}>
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                isPhone={isPhone}
                onOpen={onOpenProject}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

const styles = {
  section: {
    position: "relative",
    overflow: "hidden",
  },
  introRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },
  intro: {
    maxWidth: "640px",
    color: tint(36, 91, 0.74),
  },
  railControls: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  railArrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "32px",
    padding: 0,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: tint(50, 94),
    cursor: "pointer",
    marginLeft: "-1px",
  },
  railShell: {
    position: "relative",
    zIndex: 1,
  },
  viewport: {
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "8px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  viewportPhone: {
    paddingBottom: "4px",
  },
  track: {
    display: "flex",
    gap: "18px",
    width: "max-content",
    minWidth: "100%",
  },
};
