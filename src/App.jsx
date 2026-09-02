import Dither from "./components/Dither";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import VariableProximity from "./components/VariableProximity";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Github,
  Instagram,
  Linkedin,
  Mail,
  X,
} from "lucide-react";

const floatingMediaPositions = [
  { top: "4%", left: "1.5%", rotate: "-8deg" },
  { top: "8%", right: "1.5%", rotate: "7deg" },
  { bottom: "6%", left: "4%", rotate: "-6deg" },
  { bottom: "10%", right: "3%", rotate: "6deg" },
];

const navSections = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "jgottes@purdue.edu",
    href: "mailto:jgottes@purdue.edu",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "jasongottt",
    href: "https://github.com/jasongottt",
    external: true,
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "in/jasongottesman",
    href: "https://www.linkedin.com/in/jasongottesman",
    external: true,
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@jasongottt",
    href: "https://www.instagram.com/jasongottt/",
    external: true,
  },
];

const resolveImagePath = (path) => (path.startsWith("/") ? path : `/${path}`);

export default function App() {
  const containerRef = useRef(null);
  const projectsViewportRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [navVisible, setNavVisible] = useState(false);
  const [rail, setRail] = useState({ atStart: true, atEnd: false });
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));
  const prefersReducedMotion = useReducedMotion();
  const isPortrait = viewportSize.height > viewportSize.width;
  const isPhoneLayout = viewportSize.width <= 900 || (isPortrait && viewportSize.width <= 1200);
  // Below this the four contact tracks get too narrow to show a full handle,
  // so they fold to a balanced 2x2 instead of truncating.
  const isNarrowDesktop = !isPhoneLayout && viewportSize.width < 1180;
  const projects = [
    {
      title: "Real Time Code Injection",
      description:
        "A research project involving live LLM code compilation in Unity.",
      tech: "Unity, C#, Ollama, Lua, Moonsharp",
      year: "2026",
      accent: "",
      details:
        "This was a solo summer research project. It is an XR application built in Unity that allows you to command a cube to exhibit different behaviors. Your command is fed to a local Qwen model with Ollama, and the model outputs Lua code that is then compiled and executed in Unity using Moonsharp. The application is built for the Meta Quest 3, and allows you to interact with the cube in VR. The project was a great opportunity for me to learn about XR development, as well as to experiment with LLMs and live code compilation. It has its limitations, but it was a fun and interesting project to work on. May continue working on it in the future.",
      readMoreUrl:
        "https://docs.google.com/document/d/1CQJBZzrihbuT358cC2lAaxg17GMCTpzcUwwpD1wuNBM/edit?usp=sharing",
      repoUrl: "https://github.com/jasongottt/VR-Live-Code-Generation",
      screenshots: [
        { label: "Make the cube green", path: "/projects/research1.png" },
        { label: "Made the cube much smaller", path: "/projects/research2.png" },
      ],
    },
    {
      title: "Shadow Boxing",
      description:
        "An ongoing game prototype involving a two player boxing game.",
      tech: "Godot, GDScript, Krita",
      year: "2026",
      accent: "",
      details:
        "An ongoing game prototype involving a two player boxing game. It follows a basic \"shadow boxing\" formula, where one player chooses a direction to punch and the other player must dodge a different direction. If the puncher misses, the roles are swapped until someone hits 3 punches in a row. Built in Godot with GDScript and Krita for art assets. The project is still in development, but the core mechanics are implemented. I plan to work on it on the side for the foreseeable future, and will continue to add features and polish the game. The project was a great opportunity for me to practice my game development skills, as well as to experiment with different mechanics and design ideas.",
      repoUrl: "https://github.com/jasongottt/shadow-boxing",
      screenshots: [
        { label: "Basic gameplay sprites", path: "/projects/shadowbox1.png" },
        { label: "Early main menu", path: "/projects/shadowbox2.png" },
      ],
    },
    {
      title: "Spotlight.",
      description:
        "A custom Kanban-style task management application built in React, with a focus on a clean and unique visual design.",
      tech: "React.js, Supabase",
      year: "2026",
      accent: "",
      details:
        "This was a website made to practice React.js and Supabase, as well as to have a fun and visually interesting project to work on. The application features a custom drag-and-drop system for moving tasks between columns, as well as a unique visual design with various interactive elements. I implemented the backend using Supabase, which allowed me to quickly set up a database with various tables. The main unique feature of this project is the titular Spotlight, where the cursor is surrounded by a spotlight that illuminates and saturates the area around it, while the rest of the screen is darker and desaturated. This creates a unique visual effect and also helps to focus attention on the area around the cursor. Overall, this project was a great opportunity for me to practice my frontend and backend development skills, as well as to experiment with creative design ideas. This project is fully published online, and you can try it out with the live demo link above. \n\n NOTE: Due to how the free tier of Supabase works, the database will shut down after a week of inactivity. This will cause the board to fail to load.",
      liveUrl: "https://spotlight-kanban-project.vercel.app/",
      repoUrl: "https://github.com/jasongottt/Spotlight.",
      screenshots: [
        { label: "Main board view", path: "/projects/spotlight1.png" },
        { label: "Task details panel", path: "/projects/spotlight2.png" },
      ],
    },
    {
      title: "Ship Happens",
      description:
        "A resource management game built in ~10 hours for a game jam, based around the theme of \"Friendship\".",
      tech: "Godot, GDScript",
      year: "2025",
      accent: "Playable!",
      details:
        "This game was built for the Purdue Hackers' Kiln Game Jam. I decided to interpret the given theme by having the player manage a ship made out of their friends! The main idea was for the player to balance the needs of their \"friends\" (the ship's resources) while trying to survive as long as possible. By the nature of a game jam, I had limited time and resources to create the project. I was in charge of the entirety of the project, except for most of the art, which was done by my roommate. \n\nA major focus for the game was procedural generation to keep gameplay interesting, so I implemented a lot of random variety to the game, such as through various modifiers that could be added to the \"friends\" you encounter, as well as the random events throughout the game. Due to the time-limited nature of a game jam, the project had some rough edges, but overall, I was happy with how the game turned out given the time constraints, and it was a great learning experience for me in terms of rapid prototyping and iteration in game development.",
      repoUrl: "https://github.com/jasongottt/Ship-Happens",
      screenshots: [
        { label: "A friend asking for help", path: "/projects/ship1.png" },
        { label: "New friend screen", path: "/projects/ship2.png" },
      ],
      playableEmbed: {
        label: "Play here!",
        path: "/projects/playables/ship-happens/index.html",
        ready: true,
      },
    },
    {
      title: "Sheltering Wings",
      description:
        "A full-stack web application built for Hack the Future at Purdue, in service of the nonprofit Sheltering Wings.",
      tech: "React, MongoDB",
      year: "PRESENT",
      details:
        "I am part of a team of 10 developers and 1 designer, with the goal of communicating with the nonprofit to build a product that would be useful to them. We are building a web app that serves as a chore tracking application, event scheduler / tracker, as well as a user manager. I am involved in both frontend and backend development, working on implementing features such as user authentication, database schema design, and various UI components. \n\nWe utilized MongoDB for the database design, as well as the Microsoft Calendar API for the calendar integration. The frontend is done primarily in React. This project is a great experience in terms of working with a team, communicating with a client, and building a full-stack application from start to finish. Due to the nature of this project, a public repository / link is not available.",
      repoUrl: "",
      screenshots: [
        { label: "Chore tracker prototype", path: "projects/sheltering1.png" },
        { label: "People view prototype", path: "projects/sheltering2.png" },
      ],
    },
    {
      title: "Jammed!",
      description:
        "A game prototype built for a class team project, focused around a straightforward gameplay loop.",
      tech: "Unreal Engine",
      year: "2025",
      accent: "",
      details:
        "This was a project for an introductory Unreal Engine class, where we were tasked to create a small prototype in teams of two, based on the theme \"Jammed\". We decided to make a game where a cube of spikes closes in on the player, with only one side having an opening. The player has to quickly find the gap and get through it before the cube crushes them. This cycle repeats infinitely, and the goal is to survive as long as possible. \n\nI was responsible for the majority of the development of the project, including programming the main gameplay mechanics, especially the collision detection and response systems, as well as scorekeeping. This project was a great opportunity for me to learn Unreal Engine and get comfortable with its various systems, such as Blueprints and level design tools. Due to the nature of this being a class project, there isn't a public repository or link available.",
      repoUrl: "",
      screenshots: [
        { label: "Gameplay screenshot", path: "/projects/jammed1.png" },
        { label: "Unreal blueprints", path: "/projects/jammed2.png" },
      ],
    },
    {
      title: "Yappify",
      description:
        "A social media application developed in Java, focused on clean structure and multithreading support.",
      tech: "Java",
      year: "2024",
      details:
        "This was a project for a Java programming class, where we were tasked to create a social media application with support for multiple users and concurrent interactions. I designed the application with a focus on clean code structure and efficient multithreading to handle simultaneous user actions. The application includes features such as friending users, blocking users, and live messaging. This project was a great opportunity for me to deepen my understanding of Java, especially in terms of concurrency and object-oriented design principles. Due to the nature of this being a class project, there isn't a public repository or link available.",
      repoUrl: "",
      screenshots: [
        { label: "Profile screen", path: "/projects/yappify1.png" },
        { label: "Main app screen", path: "/projects/yappify2.png" },
      ],
    },
    {
      title: "Wishbone",
      description:
        "A Discord bot built to remind users to make wishes at 11:11, with persistent data storage and statistics tracking.",
      tech: "Python, SQLite",
      year: "2023",
      details:
        "A superstition that some of my friends and I believe in is to make a wish at 11:11 every night, and hope it comes true. After doing this for a long time, I decided I would create a Discord bot to help remind us to make our wishes, as well as track some statistics about our wishing habits. The bot sends a reminder message in a designated channel every night at 11:10, and then again at 11:11. Users can then send a message, indicating that they have made their wish. The bot then keeps track of how many times each user has wished, as well as some fun stats like streaks. \n\nThis project was a fun way for me to practice my Python skills and learn about creating Discord bots, as well as implementing a simple database for persistent data storage.",
      repoUrl: "https://github.com/jasongottt/wishbone",
      screenshots: [
        { label: "Wishing at 11:11", path: "/projects/wish1.png" },
        { label: "Statistics tracking", path: "/projects/wish2.png" },
      ],
    },
    {
      title: "This Website",
      description:
        "A portfolio website built to showcase my projects and experience, with a focus on a clean visual identity.",
      tech: "React.js, CSS, Vite",
      year: "2026",
      details:
        "The website you're currently on! I built this website to have a personal space to showcase my projects and experience, as well as to experiment with various design and development techniques, especially with React.js. I built the website using React.js for the frontend, with Vite as the build tool for a fast development experience. The design incorporates various visual effects, such as the dithered background and floating media cards. This project was a great opportunity for me to practice my frontend development skills and explore creative design possibilities.",
      repoUrl: "https://github.com/jasongottt/portfolio",
      screenshots: [
        { label: "Projects section", path: "/projects/this1.png" },
        { label: "Landing page", path: "/projects/this2.png" },
      ],
    },
  ];

  useEffect(() => {
    const viewport = projectsViewportRef.current;
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

  useEffect(() => {
    const onResize = () =>
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reveal the nav once the hero itself is behind you. Measuring the header
  // rather than the viewport keeps the trigger honest on phones, where the
  // hero is far shorter than one screen.
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = containerRef.current?.offsetHeight ?? window.innerHeight;
      setNavVisible(window.scrollY > heroHeight * 0.6);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  // Freeze the page behind an open overlay, compensating for the scrollbar
  // so the layout doesn't jump sideways as it disappears.
  useEffect(() => {
    if (!selectedProject && !selectedImage) return;

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
  }, [selectedProject, selectedImage]);

  // Fade the rail's own pixels rather than overlaying a gradient — the panel
  // sits on a translucent background, so an opaque overlay would never match.
  const railFade = isPhoneLayout ? "36px" : "52px";
  const railMask = `linear-gradient(to right, ${
    rail.atStart ? "black 0" : `transparent 0, black ${railFade}`
  }, ${rail.atEnd ? "black 100%" : `black calc(100% - ${railFade}), transparent 100%`})`;

  const scrollRail = useCallback((direction) => {
    const viewport = projectsViewportRef.current;
    if (!viewport) return;
    const card = viewport.querySelector("[data-project-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 340;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  return (
    <>
      <div style={styles.pageBackground} aria-hidden="true">
        <div style={styles.ditherFrame}>
          <Dither
            waveColor={[0.62, 0.44, 0.82]}
            disableAnimation={false}
            enableMouseInteraction={false}
            mouseRadius={1}
            colorNum={4}
            pixelSize={4}
            waveAmplitude={0.08}
            waveFrequency={3}
            waveSpeed={0.05}
          />
        </div>
        <div style={styles.backgroundTint} />
        <div style={styles.backgroundGrain} />
      </div>

      <motion.nav
        style={{
          ...styles.nav,
          ...(isPhoneLayout ? styles.navPhone : {}),
          pointerEvents: navVisible ? "auto" : "none",
        }}
        initial={false}
        animate={{ y: navVisible ? 0 : -80, opacity: navVisible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        inert={!navVisible}
        aria-label="Section navigation"
      >
        {!isPhoneLayout ? (
          <a href="#top" className="nav-link" style={styles.navBrand}>
            Jason Gottesman
          </a>
        ) : null}
        <div style={{ ...styles.navLinks, ...(isPhoneLayout ? styles.navLinksPhone : {}) }}>
          {navSections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="nav-link"
              style={styles.navLink}
            >
              {section.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable"
            style={styles.navResume}
          >
            Resume
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </motion.nav>

      <div style={{ ...styles.page, ...(isPhoneLayout ? styles.pagePhone : {}) }}>
        <header id="top" ref={containerRef} style={{ ...styles.landing, ...(isPhoneLayout ? styles.landingPhone : {}) }}>
          <div style={{ ...styles.heroShell, ...(isPhoneLayout ? styles.heroShellPhone : {}) }}>
            <h1 style={{ ...styles.hello, ...(isPhoneLayout ? styles.helloPhone : {}) }}>
              {isPhoneLayout ? (
                <span style={styles.heroTitleStatic}>Jason Gottesman</span>
              ) : (
                <VariableProximity
                  label="Jason Gottesman"
                  className="variable-proximity-demo"
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={containerRef}
                  radius={140}
                  falloff="linear"
                />
              )}
            </h1>

            <p style={{ ...styles.heroLead, ...(isPhoneLayout ? styles.heroLeadPhone : {}) }}>
              CS + Game Development student at Purdue University with a passion for human-computer interaction through interesting software and video games.
            </p>

            <div style={{ ...styles.actions, ...(isPhoneLayout ? styles.actionsPhone : {}) }}>
              <a href="#projects" className="pressable" style={styles.buttonPrimary}>
                Projects
              </a>
              <a href="#contact" className="pressable" style={styles.buttonSecondary}>
                Contact
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable"
                style={styles.buttonSecondary}
              >
                Resume
                <ArrowUpRight size={15} aria-hidden="true" style={styles.buttonIcon} />
              </a>
            </div>
          </div>

          {!isPhoneLayout ? (
            <motion.a
              href="#about"
              style={styles.scrollCue}
              aria-label="Scroll to about section"
              animate={
                prefersReducedMotion ? { opacity: 0.6 } : { y: [0, 7, 0], opacity: [0.45, 0.8, 0.45] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={22} aria-hidden="true" />
            </motion.a>
          ) : null}
        </header>

        <main style={styles.content}>
          <section id="about" style={{ ...styles.sectionPanel, ...(isPhoneLayout ? styles.panelPhone : {}) }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleGroup}>
                <h2>About</h2>
              </div>
            </div>
            <p style={styles.bodyText}>
              I'm Jason, a student at Purdue University. I am majoring in Computer Science with a concentration in 
              Computer Graphics and Visualization, as well as a major in Game Development. I care a lot about crafting
              experiences that are fun and interesting, whether it's a game, a website, or any other unique interactive project.
              I have experience in full-stack web development, game development in Godot, Unreal Engine, and Unity, as well as UI/UX design. 
            </p>
            <br />
            <p style={styles.bodyText}>
              Outside of development, I enjoy playing video games, especially ones with strong narrative and unique mechanics. I love hiking and exploring outdoors, and I spend a lot of time volunteering for Purdue's Dance Marathon, which raises money for the Riley Hospital for Children. If you'd be interested in donating there,{" "}
              <a
                href="https://events.dancemarathon.com/participants/jasongott"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.inlineLink}
              >
                here's my fundraising page!
              </a>
            </p>
          </section>

          <section id="projects" style={{ ...styles.projectsSection, ...(isPhoneLayout ? styles.panelPhone : {}) }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleGroup}>
                <h2>Projects</h2>
              </div>
            </div>
            <div style={styles.projectsIntroRow}>
              <p style={styles.projectsIntro}>
                A selection of projects I've made, some are marked as playable in-browser games.
              </p>
              {!isPhoneLayout ? (
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
                ref={projectsViewportRef}
                style={{
                  ...styles.projectsViewport,
                  ...(isPhoneLayout ? styles.projectsViewportPhone : {}),
                  maskImage: railMask,
                  WebkitMaskImage: railMask,
                }}
              >
                <div style={styles.projectsTrack}>
                  {projects.map((project) => (
                    <button
                      key={project.title}
                      type="button"
                      data-project-card=""
                      className="card-link"
                      style={{ ...styles.cardLink, ...(isPhoneLayout ? styles.cardLinkPhone : {}) }}
                      onClick={() => setSelectedProject(project)}
                      aria-label={`Open details for ${project.title}`}
                    >
                      <article
                        className="project-card"
                        style={{ ...styles.card, ...(isPhoneLayout ? styles.cardPhone : {}) }}
                      >
                        <div style={styles.cardThumb}>
                          <img
                            src={resolveImagePath(project.screenshots[0].path)}
                            alt=""
                            loading="lazy"
                            style={styles.cardThumbImage}
                          />
                          {project.accent ? (
                            <span style={styles.cardAccent}>
                              <span style={styles.accentDot} aria-hidden="true" />
                              {project.accent}
                            </span>
                          ) : null}
                        </div>
                        <div
                          style={{
                            ...styles.cardBody,
                            ...(isPhoneLayout ? styles.cardBodyPhone : {}),
                          }}
                        >
                          <span style={styles.cardYear}>{project.year}</span>
                          <h3 style={styles.cardTitle}>{project.title}</h3>
                          <p style={styles.cardDescription}>{project.description}</p>
                          <div style={styles.techRow}>
                            <p style={styles.techLine}>
                              {project.tech.split(",").map((item) => item.trim()).join("  /  ")}
                            </p>
                          </div>
                        </div>
                      </article>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" style={{ ...styles.contactSection, ...(isPhoneLayout ? styles.panelPhone : {}) }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleGroup}>
                <h2>Contact</h2>
              </div>
            </div>
            <div
              style={{
                ...styles.contactGrid,
                ...(isNarrowDesktop ? styles.contactGridNarrow : {}),
                ...(isPhoneLayout ? styles.contactGridPhone : {}),
              }}
            >
              {contactLinks.map(({ icon: Icon, label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  className="contact-row"
                  style={styles.contactCard}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span style={styles.contactLabelRow}>
                    <Icon size={13} style={styles.contactIcon} aria-hidden="true" />
                    <span style={styles.contactLabel}>{label}</span>
                  </span>
                  <span style={styles.contactValueRow}>
                    <span style={styles.contactValue}>{value}</span>
                    <ArrowUpRight
                      size={14}
                      style={styles.contactArrow}
                      aria-hidden="true"
                    />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>

      {selectedProject ? (
        <motion.div
          style={{
            ...styles.modalOverlay,
            ...(isPhoneLayout ? styles.modalOverlayPhone : {}),
          }}
          onClick={() => setSelectedProject(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <div
            style={{
              ...styles.modalStage,
              ...(isPhoneLayout ? styles.modalStagePhone : {}),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {!isPhoneLayout &&
              selectedProject.screenshots.slice(0, 4).map((image, index) => (
              <motion.div
                key={image.path}
                style={{
                  ...styles.floatingMediaCard,
                  ...floatingMediaPositions[index % floatingMediaPositions.length],
                }}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  y: prefersReducedMotion ? 310 : [320, 300, 320],
                  rotate: floatingMediaPositions[index % floatingMediaPositions.length].rotate,
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.24 },
                  y: {
                    duration: 5 + index,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                  rotate: { duration: 0.24 },
                }}
              >
                <button
                  type="button"
                  className="media-tile"
                  style={styles.floatingMediaButton}
                  onClick={() =>
                    setSelectedImage({
                      label: image.label,
                      path: resolveImagePath(image.path),
                    })
                  }
                  aria-label={`Enlarge screenshot: ${image.label}`}
                >
                  <div style={styles.floatingMediaInner}>
                    <img
                      src={resolveImagePath(image.path)}
                      alt={image.label}
                      loading="lazy"
                      style={styles.floatingImage}
                    />
                    <span style={styles.mediaCaption}>{image.label}</span>
                  </div>
                </button>
              </motion.div>
            ))}

            <motion.div
              style={{
                ...styles.modalCard,
                ...(isPhoneLayout ? styles.modalCardPhone : {}),
              }}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 230, damping: 24 }}
            >
              <div
                style={{
                  ...styles.modalHeader,
                  ...(isPhoneLayout ? styles.modalHeaderPhone : {}),
                }}
              >
                <div style={styles.modalMetaRow}>
                  <span style={styles.cardYear}>{selectedProject.year}</span>
                  {selectedProject.accent ? (
                    <span style={styles.cardAccent}>
                              <span style={styles.accentDot} aria-hidden="true" />
                              {selectedProject.accent}
                            </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="icon-button"
                  style={styles.modalClose}
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <h3 id="project-modal-title" style={styles.modalTitle}>
                {selectedProject.title}
              </h3>
              <p style={styles.modalLead}>{selectedProject.description}</p>

              <p style={styles.techLine}>
                {selectedProject.tech.split(",").map((item) => item.trim()).join("  /  ")}
              </p>

              {selectedProject.repoUrl ||
              selectedProject.liveUrl ||
              selectedProject.readMoreUrl ? (
                <div style={styles.modalActions}>
                  {selectedProject.liveUrl ? (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable"
                      style={styles.modalActionPrimary}
                    >
                      <ExternalLink size={16} aria-hidden="true" />
                      Live demo
                    </a>
                  ) : null}
                  {selectedProject.repoUrl ? (
                    <a
                      href={selectedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable"
                      style={styles.modalActionButton}
                    >
                      <Github size={16} aria-hidden="true" />
                      Source
                    </a>
                  ) : null}
                  {selectedProject.readMoreUrl ? (
                    <a
                      href={selectedProject.readMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable"
                      style={styles.modalActionButton}
                    >
                      <FileText size={16} aria-hidden="true" />
                      Write-up
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div style={styles.modalDivider} />

              <p style={styles.modalText}>{selectedProject.details}</p>

              {selectedProject.playableEmbed ? (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>{selectedProject.playableEmbed.label}</h4>
                  {selectedProject.playableEmbed.ready ? (
                    <div style={styles.playableFrame}>
                      <iframe
                        src={selectedProject.playableEmbed.path}
                        title={`${selectedProject.title} playable build`}
                        style={styles.playableEmbed}
                      />
                    </div>
                  ) : (
                    <div style={styles.playablePlaceholder}>
                      <p style={styles.modalText}>
                        placeholder
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>

            {isPhoneLayout ? (
              <div style={styles.modalMediaRail}>
                {selectedProject.screenshots.slice(0, 4).map((image) => (
                  <button
                    key={image.path}
                    type="button"
                    style={styles.modalMediaRailButton}
                    onClick={() =>
                      setSelectedImage({
                        label: image.label,
                        path: resolveImagePath(image.path),
                      })
                    }
                    aria-label={`Enlarge screenshot: ${image.label}`}
                  >
                    <div style={styles.modalMediaRailInner}>
                      <img
                        src={resolveImagePath(image.path)}
                        alt={image.label}
                        loading="lazy"
                        style={styles.modalMediaRailImage}
                      />
                      <span style={styles.mediaCaption}>{image.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {selectedImage ? (
        <div
          style={styles.lightboxOverlay}
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.label}
        >
          <button
            type="button"
            className="icon-button"
            style={styles.lightboxClose}
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <figure style={styles.lightboxStage} onClick={(event) => event.stopPropagation()}>
            <img
              src={selectedImage.path}
              alt={selectedImage.label}
              style={styles.lightboxImage}
            />
            <figcaption style={styles.lightboxCaption}>{selectedImage.label}</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

const RULE = "rgba(198, 179, 230, 0.18)";
const RULE_SOFT = "rgba(198, 179, 230, 0.1)";
const PANEL_BG = "rgba(8, 9, 14, 0.58)";

const styles = {
  pageBackground: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
    backgroundColor: "#070910",
  },
  ditherFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    transform: "translate(-50%, -50%)",
    opacity: 0.95,
  },
  backgroundTint: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(5, 6, 10, 0.66)",
  },
  backgroundGrain: {
    position: "absolute",
    inset: 0,
    opacity: 0.05,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
  },

  /* ---- Floating nav, squared ---- */
  nav: {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "28px",
    width: "min(760px, calc(100% - 32px))",
    padding: "9px 10px 9px 18px",
    border: `1px solid ${RULE}`,
    backgroundColor: "rgba(8, 9, 14, 0.9)",
    backdropFilter: "blur(10px)",
    fontFamily: '"Geist Variable", sans-serif',
  },
  navPhone: {
    width: "calc(100% - 24px)",
    justifyContent: "center",
    padding: "8px 10px",
  },
  navBrand: {
    fontFamily: "var(--mono)",
    color: "rgba(246, 243, 251, 0.9)",
    textDecoration: "none",
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
  },
  navLinksPhone: {
    gap: "14px",
  },
  navLink: {
    fontFamily: "var(--mono)",
    color: "rgba(228, 223, 240, 0.68)",
    textDecoration: "none",
    fontSize: "0.76rem",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  navResume: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 12px",
    color: "#07070c",
    backgroundColor: "rgba(222, 212, 240, 1)",
    textDecoration: "none",
    fontSize: "0.74rem",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },

  /* ---- Page shell ---- */
  page: {
    position: "relative",
    zIndex: 1,
    fontFamily: '"Geist Variable", sans-serif',
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 32px 88px",
    lineHeight: 1.6,
    color: "#ece7f7",
  },
  pagePhone: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0 16px 56px",
  },

  /* ---- Hero ---- */
  landing: {
    position: "relative",
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  landingPhone: {
    minHeight: "auto",
    paddingTop: "80px",
    paddingBottom: "40px",
  },
  heroShell: {
    width: "100%",
    maxWidth: "1140px",
    // Size container: the name below is sized in cqi so it always fits on
    // one line, at any viewport, without hand-tuned breakpoints.
    containerType: "inline-size",
    padding: "40px 30px",
    border: `1px solid ${RULE}`,
    backgroundColor: PANEL_BG,
    backdropFilter: "blur(8px)",
  },
  heroShellPhone: {
    padding: "26px 18px",
  },
  hello: {
    fontSize: "13cqi",
    whiteSpace: "nowrap",
    color: "white",
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: "-0.055em",
    fontWeight: 650,
    textAlign: "center",
  },
  helloPhone: {
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  },
  heroTitleStatic: {
    display: "block",
    width: "100%",
  },
  heroLead: {
    maxWidth: "700px",
    margin: "24px auto 0",
    fontSize: "1.08rem",
    color: "rgba(236, 231, 247, 0.76)",
  },
  heroLeadPhone: {
    maxWidth: "100%",
    marginTop: "16px",
    fontSize: "1rem",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  actionsPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  buttonPrimary: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "13px 26px",
    border: "1px solid rgba(222, 212, 240, 1)",
    textDecoration: "none",
    color: "#07070c",
    backgroundColor: "rgba(222, 212, 240, 1)",
    fontSize: "0.8rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  buttonSecondary: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "13px 26px",
    border: `1px solid ${RULE}`,
    marginLeft: "-1px",
    textDecoration: "none",
    color: "#ece7f7",
    backgroundColor: "rgba(10, 10, 16, 0.45)",
    fontSize: "0.8rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  buttonIcon: {
    opacity: 0.6,
  },
  scrollCue: {
    position: "absolute",
    bottom: "26px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(214, 202, 235, 0.7)",
    textDecoration: "none",
    display: "flex",
    padding: "6px",
  },

  /* ---- Section panels: discrete boxes again, squared ---- */
  content: {
    paddingTop: "20px",
  },
  sectionPanel: {
    marginTop: "40px",
    padding: "32px 36px 36px",
    border: `1px solid ${RULE}`,
    backgroundColor: PANEL_BG,
    backdropFilter: "blur(8px)",
  },
  projectsSection: {
    position: "relative",
    marginTop: "40px",
    padding: "32px 36px 36px",
    overflow: "hidden",
    border: `1px solid ${RULE}`,
    backgroundColor: PANEL_BG,
    backdropFilter: "blur(8px)",
  },
  contactSection: {
    marginTop: "40px",
    padding: "32px 36px 36px",
    border: `1px solid ${RULE}`,
    backgroundColor: PANEL_BG,
    backdropFilter: "blur(8px)",
  },
  panelPhone: {
    marginTop: "26px",
    padding: "22px 18px 24px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "22px",
    paddingBottom: "14px",
    borderBottom: `1px solid ${RULE_SOFT}`,
    flexWrap: "wrap",
  },
  sectionTitleGroup: {
    display: "flex",
    alignItems: "baseline",
    gap: "14px",
    minWidth: 0,
  },
  sectionNumber: {
    fontFamily: "var(--mono)",
    color: "rgba(170, 130, 225, 0.6)",
    fontSize: "0.8rem",
    letterSpacing: "0.14em",
    flexShrink: 0,
  },
  bodyText: {
    color: "rgba(228, 223, 240, 0.78)",
    maxWidth: "100%",
  },
  inlineLink: {
    color: "rgba(214, 202, 235, 1)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },

  /* ---- Projects ---- */
  projectsIntroRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },
  projectsIntro: {
    maxWidth: "640px",
    color: "rgba(228, 223, 240, 0.74)",
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
    color: "#ece7f7",
    cursor: "pointer",
    marginLeft: "-1px",
  },
  railShell: {
    position: "relative",
    zIndex: 1,
  },
  projectsViewport: {
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "8px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  projectsViewportPhone: {
    paddingBottom: "4px",
  },
  projectsTrack: {
    display: "flex",
    gap: "18px",
    width: "max-content",
    minWidth: "100%",
  },
  cardLink: {
    appearance: "none",
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    display: "block",
    flex: "0 0 300px",
    padding: 0,
    textAlign: "inherit",
  },
  cardLinkPhone: {
    flex: "0 0 min(78vw, 280px)",
  },
  card: {
    position: "relative",
    width: "300px",
    minHeight: "418px",
    height: "100%",
    border: `1px solid ${RULE}`,
    backgroundColor: "rgba(9, 9, 15, 0.82)",
    textAlign: "left",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardPhone: {
    width: "min(78vw, 280px)",
    minHeight: "396px",
  },
  cardThumb: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 10",
    overflow: "hidden",
    borderBottom: `1px solid ${RULE}`,
    backgroundColor: "rgba(3, 3, 7, 0.9)",
  },
  cardThumbImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "18px 20px 20px",
  },
  cardBodyPhone: {
    padding: "16px 18px 18px",
  },
  cardYear: {
    fontFamily: "var(--mono)",
    display: "block",
    marginBottom: "10px",
    color: "rgba(214, 205, 232, 0.5)",
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
  },
  cardAccent: {
    fontFamily: "var(--mono)",
    position: "absolute",
    left: "10px",
    bottom: "10px",
    padding: "5px 9px",
    backgroundColor: "rgba(4, 8, 6, 0.85)",
    border: "1px solid rgba(134, 236, 182, 0.35)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(134, 236, 182, 0.95)",
    fontSize: "0.66rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  accentDot: {
    width: "5px",
    height: "5px",
    flexShrink: 0,
    backgroundColor: "rgba(134, 236, 182, 0.95)",
    boxShadow: "0 0 8px rgba(134, 236, 182, 0.75)",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: "1.75rem",
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: "#faf7ff",
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  cardDescription: {
    color: "rgba(224, 217, 238, 0.7)",
    marginBottom: "16px",
    fontSize: "0.9rem",
  },
  techRow: {
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: `1px solid ${RULE_SOFT}`,
  },
  techLine: {
    fontFamily: "var(--mono)",
    color: "rgba(236, 231, 247, 0.72)",
    fontSize: "0.68rem",
    lineHeight: 1.7,
  },

  /* ---- Contact: discrete boxes again, squared ---- */
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },
  contactGridNarrow: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  contactGridPhone: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
  },
  contactCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
    overflow: "hidden",
    padding: "16px",
    border: `1px solid ${RULE}`,
    backgroundColor: "rgba(9, 9, 15, 0.6)",
    textDecoration: "none",
    color: "#ece7f7",
  },
  contactLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    minWidth: 0,
  },
  contactIcon: {
    color: "rgba(196, 177, 226, 0.75)",
    flexShrink: 0,
  },
  contactLabel: {
    fontFamily: "var(--mono)",
    color: "rgba(196, 177, 226, 0.72)",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  contactValueRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    minWidth: 0,
  },
  contactValue: {
    color: "rgba(246, 243, 251, 0.94)",
    fontSize: "0.9rem",
    lineHeight: 1.35,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  contactArrow: {
    flexShrink: 0,
    color: "rgba(196, 177, 226, 0.55)",
  },

  /* ---- Project modal ---- */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(4, 4, 8, 0.78)",
    backdropFilter: "blur(6px)",
  },
  modalOverlayPhone: {
    alignItems: "flex-start",
    overflowY: "auto",
    padding: "12px",
  },
  modalStage: {
    position: "relative",
    width: "min(1180px, 100%)",
    minHeight: "min(88vh, 920px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalStagePhone: {
    width: "100%",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
  },
  floatingMediaCard: {
    position: "absolute",
    width: "220px",
    overflow: "hidden",
    border: `1px solid ${RULE}`,
    backgroundColor: "rgba(10, 11, 16, 0.92)",
    pointerEvents: "auto",
  },
  floatingMediaButton: {
    appearance: "none",
    width: "100%",
    height: "100%",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  floatingMediaInner: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: "rgba(14, 15, 22, 0.95)",
  },
  floatingImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },
  mediaCaption: {
    fontFamily: "var(--mono)",
    color: "rgba(214, 202, 235, 0.72)",
    fontSize: "0.68rem",
    lineHeight: 1.5,
    textAlign: "left",
  },
  modalCard: {
    width: "min(680px, 100%)",
    maxHeight: "min(88vh, 920px)",
    padding: "28px",
    backgroundColor: "rgba(8, 9, 14, 0.98)",
    border: `1px solid ${RULE}`,
    textAlign: "left",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  modalCardPhone: {
    width: "100%",
    maxHeight: "none",
    padding: "22px 18px",
  },
  modalHeader: {
    position: "sticky",
    top: "-28px",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    margin: "-28px -28px 22px",
    padding: "16px 22px",
    borderBottom: `1px solid ${RULE_SOFT}`,
    backgroundColor: "rgba(8, 9, 14, 0.98)",
  },
  modalHeaderPhone: {
    top: "-22px",
    margin: "-22px -18px 18px",
    padding: "14px 18px",
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  modalClose: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "30px",
    height: "30px",
    padding: 0,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: "#ece7f7",
    cursor: "pointer",
  },
  modalTitle: {
    margin: "0 0 14px",
    fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
    color: "#faf7ff",
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  modalLead: {
    color: "rgba(240, 236, 250, 0.9)",
    fontSize: "1.04rem",
    lineHeight: 1.55,
    marginBottom: "18px",
  },
  modalActions: {
    display: "flex",
    marginTop: "22px",
    flexWrap: "wrap",
  },
  modalActionPrimary: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    textDecoration: "none",
    color: "#07070c",
    backgroundColor: "rgba(222, 212, 240, 1)",
    border: "1px solid rgba(222, 212, 240, 1)",
    fontSize: "0.74rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  modalActionButton: {
    fontFamily: "var(--mono)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    textDecoration: "none",
    color: "#ece7f7",
    backgroundColor: "transparent",
    border: `1px solid ${RULE}`,
    marginLeft: "-1px",
    fontSize: "0.74rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  modalDivider: {
    height: "1px",
    margin: "26px 0 22px",
    backgroundColor: RULE_SOFT,
  },
  modalText: {
    color: "rgba(228, 223, 240, 0.78)",
    marginBottom: "14px",
    whiteSpace: "pre-wrap",
  },
  modalSection: {
    marginTop: "26px",
  },
  modalSectionTitle: {
    fontFamily: "var(--mono)",
    margin: "0 0 12px",
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(236, 231, 247, 0.85)",
    fontWeight: 500,
  },
  playableFrame: {
    width: "100%",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    border: `1px solid ${RULE}`,
    backgroundColor: "rgba(12, 12, 18, 0.9)",
  },
  playableEmbed: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    backgroundColor: "#090a0f",
  },
  playablePlaceholder: {
    border: `1px dashed ${RULE}`,
    backgroundColor: "rgba(12, 12, 18, 0.86)",
    padding: "20px",
  },
  modalMediaRail: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    width: "100%",
  },
  modalMediaRailButton: {
    appearance: "none",
    width: "100%",
    padding: 0,
    border: `1px solid ${RULE}`,
    background: "rgba(10, 11, 16, 0.9)",
    overflow: "hidden",
    cursor: "pointer",
    textAlign: "left",
  },
  modalMediaRailInner: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: "rgba(14, 15, 22, 0.95)",
  },
  modalMediaRailImage: {
    width: "100%",
    aspectRatio: "16 / 10",
    objectFit: "cover",
    display: "block",
  },

  /* ---- Lightbox ---- */
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(3, 3, 7, 0.92)",
  },
  lightboxClose: {
    position: "absolute",
    top: "22px",
    right: "22px",
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    padding: 0,
    border: `1px solid ${RULE}`,
    backgroundColor: "transparent",
    color: "#ece7f7",
    cursor: "pointer",
  },
  lightboxStage: {
    width: "min(1200px, 100%)",
    maxHeight: "100%",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
  },
  lightboxImage: {
    maxWidth: "100%",
    maxHeight: "88vh",
    objectFit: "contain",
    display: "block",
    border: `1px solid ${RULE}`,
  },
  lightboxCaption: {
    fontFamily: "var(--mono)",
    color: "rgba(214, 202, 235, 0.78)",
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
};
