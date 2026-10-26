import { useRef, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import Section from "../components/Section";
import { projects } from "../data/projects";
import { RULE, tint } from "../palette";

// How many projects show before "Show all": the first ones in projects.js.
const PREVIEW = 4;

/**
 * A two-column grid of project tiles: the first few, then the rest behind a
 * button, so the section stays short in the narrow column. Each tile opens
 * the project's popup.
 */
export default function Projects({ isPhone, onOpenProject }) {
  const [showAll, setShowAll] = useState(false);
  const buttonRef = useRef(null);
  const shown = showAll ? projects : projects.slice(0, PREVIEW);

  const toggle = () => {
    // Collapsing pulls the button up past the hidden tiles. Scroll by the
    // same amount so it stays under the cursor and the page doesn't jump to
    // whatever was below.
    const before = buttonRef.current?.getBoundingClientRect().top;
    setShowAll((all) => !all);
    if (showAll) {
      requestAnimationFrame(() => {
        const after = buttonRef.current?.getBoundingClientRect().top;
        if (before !== undefined && after !== undefined) window.scrollBy({ top: after - before, behavior: "instant" });
      });
    }
  };

  return (
    <Section id="projects" title="Projects" isPhone={isPhone}>
      <p style={styles.intro}>
        A selection of projects I've made, some are marked as playable in-browser games.
      </p>
      <div id="project-grid" style={{ ...styles.grid, ...(isPhone ? styles.gridPhone : {}) }}>
        {shown.map((project) => (
          <ProjectCard key={project.title} project={project} isPhone={isPhone} onOpen={onOpenProject} />
        ))}
      </div>
      {projects.length > PREVIEW ? (
        <button
          ref={buttonRef}
          type="button"
          className="pressable"
          style={styles.more}
          aria-expanded={showAll}
          aria-controls="project-grid"
          onClick={toggle}
        >
          {showAll ? "Show fewer projects" : `Show all ${projects.length} projects`}
        </button>
      ) : null}
    </Section>
  );
}

const styles = {
  intro: {
    marginBottom: "18px",
    color: tint(36, 91, 0.74),
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  gridPhone: {
    gap: "8px",
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
};
