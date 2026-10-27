import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import Lightbox from "./components/Lightbox";
import Nav from "./components/Nav";
import ProjectModal from "./components/ProjectModal";
import { projects } from "./data/projects";
import { useKonamiParty } from "./hooks/useKonamiParty";
import { useViewport } from "./hooks/useViewport";
import { tint } from "./palette";
import About from "./sections/About";
import Contact from "./sections/Contact";
import Experience from "./sections/Experience";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import WorldBackground from "./world/WorldBackground";

export default function App() {
  const heroRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  // True when the project was opened from a game landmark in the world, so
  // the popup scrolls straight to its game.
  const [focusPlayable, setFocusPlayable] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  // A polaroid from About is open (Polaroids.jsx handles its own Escape).
  const [viewingPhoto, setViewingPhoto] = useState(false);
  // "loading", "ready", or "failed" if the world can't run on this device.
  const [worldStatus, setWorldStatus] = useState("loading");
  // Explore mode: the visitor walks the world, and the page steps aside.
  const [exploring, setExploring] = useState(false);
  const { isPhone } = useViewport();
  const party = useKonamiParty();

  const openProject = useCallback((project) => {
    setSelectedProject(project);
    setFocusPlayable(false);
  }, []);

  const openProjectByTitle = useCallback((title, { focusPlayable = false } = {}) => {
    setSelectedProject(projects.find((project) => project.title === title) ?? null);
    setFocusPlayable(focusPlayable);
  }, []);

  // Escape closes the topmost layer: lightbox first, then the project modal.
  useEffect(() => {
    if (!selectedProject && !selectedImage) return;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (selectedImage) setSelectedImage(null);
      else setSelectedProject(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject, selectedImage]);

  // Freeze the page behind an open overlay or while exploring, compensating
  // for the scrollbar so the layout doesn't jump sideways as it disappears.
  useEffect(() => {
    if (!selectedProject && !selectedImage && !viewingPhoto && !exploring) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [selectedProject, selectedImage, viewingPhoto, exploring]);

  return (
    <>
      <WorldBackground
        isPhone={isPhone}
        paused={Boolean(selectedProject || selectedImage || viewingPhoto)}
        party={party}
        exploring={exploring}
        onExploringChange={setExploring}
        onOpenProject={openProjectByTitle}
        onStatusChange={setWorldStatus}
      />
      <Nav
        heroRef={heroRef}
        isPhone={isPhone}
        hidden={exploring}
        onExplore={worldStatus === "ready" ? () => setExploring(true) : undefined}
      />

      <div
        style={{ ...styles.page, ...(isPhone ? styles.pagePhone : {}), ...(exploring ? styles.pageAway : {}) }}
        inert={exploring}
      >
        <Hero heroRef={heroRef} isPhone={isPhone} showHeading={worldStatus === "failed"} />

        <main style={{ ...styles.content, ...(isPhone ? {} : styles.column) }}>
          <About isPhone={isPhone} onViewingPhoto={setViewingPhoto} />
          <Experience isPhone={isPhone} onOpenProject={openProjectByTitle} />
          <Projects isPhone={isPhone} onOpenProject={openProject} />
          <Contact isPhone={isPhone} />
        </main>

        {/* The last screen, where the world pulls back out to the name. */}
        <footer style={styles.outro}>
          <a href="#top" className="nav-link" style={styles.backToTop}>
            Back to the top
            <ArrowUp size={13} aria-hidden="true" />
          </a>
        </footer>
      </div>

      {selectedProject ? (
        <ProjectModal
          project={selectedProject}
          focusPlayable={focusPlayable}
          isPhone={isPhone}
          onClose={() => setSelectedProject(null)}
          onOpenImage={setSelectedImage}
        />
      ) : null}

      {selectedImage ? (
        <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      ) : null}
    </>
  );
}

const styles = {
  // Clicks fall through the page to the world's landmarks, except on the
  // panels and links, which take them back (Section.jsx, Hero.jsx).
  page: {
    position: "relative",
    zIndex: 1,
    fontFamily: "var(--body)",
    padding: "0 32px",
    lineHeight: 1.6,
    color: tint(50, 94),
    pointerEvents: "none",
    transition: "opacity 400ms ease, visibility 400ms",
  },
  // Out of the way while exploring. Still laid out, since the world reads
  // the sections' positions.
  pageAway: {
    opacity: 0,
    visibility: "hidden",
  },
  pagePhone: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0 16px",
  },
  content: {
    paddingTop: "20px",
  },
  // On desktop the sections are a column down the left, leaving the right
  // side open so the character stays in view (world/runWorld.js frames it
  // there). Left rather than right because the walk heads right, so you can
  // see where the character is going.
  column: {
    width: "clamp(480px, 46vw, 680px)",
    marginLeft: "max(0px, calc(4vw - 32px))",
  },
  outro: {
    height: "100svh",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: "28px",
    boxSizing: "border-box",
  },
  backToTop: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    fontFamily: "var(--mono)",
    fontSize: "0.74rem",
    letterSpacing: "0.05em",
    color: tint(36, 91, 0.68),
    textDecoration: "none",
    pointerEvents: "auto",
  },
};
