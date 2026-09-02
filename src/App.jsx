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
        <div style={styles.backgroundGrid} />
        <div style={styles.backgroundTint} />
      </div>

      <motion.nav
        style={{
          ...styles.nav,
          ...(isPhoneLayout ? styles.navPhone : {}),
          pointerEvents: navVisible ? "auto" : "none",
        }}
        initial={false}
        animate={{ y: navVisible ? 0 : -72, opacity: navVisible ? 1 : 0 }}
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
            <ArrowUpRight size={14} aria-hidden="true" />
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
              <h2>About</h2>
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
              <h2>Projects</h2>
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
                    <motion.button
                      key={project.title}
                      type="button"
                      data-project-card=""
                      className="card-link"
                      style={{ ...styles.cardLink, ...(isPhoneLayout ? styles.cardLinkPhone : {}) }}
                      onClick={() => setSelectedProject(project)}
                      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      aria-label={`Open details for ${project.title}`}
                    >
                      <article
                        className="project-card"
                        style={{ ...styles.card, ...(isPhoneLayout ? styles.cardPhone : {}) }}
                      >
                        <div style={styles.cardTopRow}>
                          <span style={styles.cardYear}>{project.year}</span>
                          {project.accent ? (
                            <span style={styles.cardAccent}>{project.accent}</span>
                          ) : null}
                        </div>
                        <h3 style={styles.cardTitle}>{project.title}</h3>
                        <p style={styles.cardDescription}>{project.description}</p>
                        <div style={styles.techRow}>
                          {project.tech.split(",").map((item) => (
                            <span key={item} style={styles.techChip}>
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      </article>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="contact" style={{ ...styles.contactSection, ...(isPhoneLayout ? styles.panelPhone : {}) }}>
            <div style={styles.sectionHeader}>
              <h2>Contact</h2>
            </div>
            <p style={styles.contactIntro}>
              The fastest way to reach me is email — but I'm around in all of these places.
            </p>
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
                  <span style={styles.contactIconWrap}>
                    <Icon size={20} style={styles.contactIcon} aria-hidden="true" />
                  </span>
                  <span style={styles.contactCopy}>
                    <span style={styles.contactLabel}>{label}</span>
                    <span style={styles.contactValue}>{value}</span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    style={styles.contactArrow}
                    aria-hidden="true"
                  />
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
                    <span style={styles.cardAccent}>{selectedProject.accent}</span>
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

              <div style={styles.techRow}>
                {selectedProject.tech.split(",").map((item) => (
                  <span key={item} style={styles.techChip}>
                    {item.trim()}
                  </span>
                ))}
              </div>

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
  backgroundGrid: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.03)",
    opacity: 0.08,
  },
  backgroundTint: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(5, 6, 10, 0.72)",
  },
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
    padding: "10px 12px 10px 20px",
    borderRadius: "999px",
    border: "1px solid rgba(198, 179, 230, 0.16)",
    backgroundColor: "rgba(9, 10, 16, 0.72)",
    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.34)",
    backdropFilter: "blur(14px)",
    fontFamily: '"Geist Variable", sans-serif',
  },
  navPhone: {
    width: "calc(100% - 24px)",
    justifyContent: "center",
    padding: "8px 10px",
  },
  navBrand: {
    color: "rgba(246, 243, 251, 0.92)",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  navLinksPhone: {
    gap: "12px",
    fontSize: "0.85rem",
  },
  navLink: {
    color: "rgba(228, 223, 240, 0.74)",
    textDecoration: "none",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  navResume: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 14px",
    borderRadius: "999px",
    color: "#06060b",
    backgroundColor: "rgba(214, 202, 235, 1)",
    textDecoration: "none",
    fontSize: "0.86rem",
    fontWeight: 650,
    whiteSpace: "nowrap",
  },
  landing: {
    position: "relative",
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  scrollCue: {
    position: "absolute",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(214, 202, 235, 0.75)",
    textDecoration: "none",
    display: "flex",
    padding: "6px",
  },
  landingPhone: {
    minHeight: "auto",
    paddingTop: "20px",
  },
  heroShell: {
    width: "100%",
    maxWidth: "980px",
    padding: "36px 28px",
    border: "1px solid rgba(198, 179, 230, 0.14)",
    borderRadius: "28px",
    backgroundColor: "rgba(8, 9, 14, 0.48)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(8px)",
  },
  heroShellPhone: {
    padding: "24px 18px",
    borderRadius: "22px",
  },
  hello: {
    fontSize: "clamp(4.5rem, 8vw, 8rem)",
    color: "white",
    margin: 0,
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    fontWeight: 650,
    textAlign: "center",
  },
  helloPhone: {
    fontSize: "clamp(2.5rem, 12vw, 4rem)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  heroTitleStatic: {
    display: "block",
    width: "100%",
    overflowWrap: "anywhere",
  },
  heroLead: {
    maxWidth: "760px",
    margin: "22px auto 0",
    fontSize: "1.12rem",
    color: "rgba(236, 231, 247, 0.76)",
  },
  heroLeadPhone: {
    maxWidth: "100%",
    marginTop: "16px",
    fontSize: "1rem",
  },
  content: {
    paddingTop: "20px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  actionsPhone: {
    gap: "10px",
    flexDirection: "column",
    alignItems: "stretch",
  },
  buttonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 22px",
    border: "1px solid rgba(214, 202, 235, 0.7)",
    textDecoration: "none",
    color: "#06060b",
    backgroundColor: "rgba(214, 202, 235, 1)",
    borderRadius: "999px",
    fontWeight: 700,
    boxShadow: "0 12px 28px rgba(175, 130, 225, 0.24)",
  },
  buttonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 22px",
    border: "1px solid rgba(184, 166, 214, 0.34)",
    textDecoration: "none",
    color: "#ece7f7",
    backgroundColor: "rgba(124, 73, 171, 0.12)",
    borderRadius: "999px",
    fontWeight: 500,
    backdropFilter: "blur(12px)",
  },
  buttonIcon: {
    opacity: 0.7,
  },
  projectsSection: {
    position: "relative",
    marginTop: "44px",
    padding: "34px 38px 38px",
    borderRadius: "24px",
    overflow: "hidden",
    backgroundColor: "rgba(8, 9, 14, 0.48)",
    border: "1px solid rgba(198, 179, 230, 0.14)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(8px)",
  },
  sectionPanel: {
    marginTop: "44px",
    padding: "34px 38px",
    borderRadius: "24px",
    backgroundColor: "rgba(8, 9, 14, 0.48)",
    border: "1px solid rgba(198, 179, 230, 0.14)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(8px)",
  },
  panelPhone: {
    marginTop: "28px",
    padding: "22px 18px",
    borderRadius: "20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "22px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(198, 179, 230, 0.14)",
    flexWrap: "wrap",
  },
  sectionLabel: {
    color: "rgba(196, 177, 226, 0.72)",
    fontSize: "0.76rem",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
  },
  bodyText: {
    color: "rgba(228, 223, 240, 0.76)",
    maxWidth: "100%",
  },
  projectsIntroRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "6px",
    flexWrap: "wrap",
  },
  projectsIntro: {
    maxWidth: "620px",
    color: "rgba(228, 223, 240, 0.74)",
  },
  railControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  railCount: {
    marginRight: "6px",
    color: "rgba(196, 177, 226, 0.6)",
    fontSize: "0.76rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  railArrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    padding: 0,
    borderRadius: "999px",
    border: "1px solid rgba(184, 166, 214, 0.28)",
    backgroundColor: "rgba(124, 73, 171, 0.14)",
    color: "#ece7f7",
    cursor: "pointer",
  },
  railShell: {
    position: "relative",
    zIndex: 1,
  },
  techRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "auto",
  },
  techChip: {
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(184, 166, 214, 0.22)",
    backgroundColor: "rgba(124, 73, 171, 0.14)",
    color: "rgba(236, 231, 247, 0.86)",
    fontSize: "0.74rem",
    letterSpacing: "0.02em",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
  },
  projectsViewport: {
    position: "relative",
    zIndex: 1,
    marginTop: "16px",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "10px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  projectsViewportPhone: {
    paddingBottom: "6px",
  },
  projectsTrack: {
    display: "flex",
    gap: "20px",
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
    flex: "0 0 320px",
    padding: 0,
    textAlign: "inherit",
  },
  cardLinkPhone: {
    flex: "0 0 min(78vw, 280px)",
  },
  card: {
    position: "relative",
    width: "320px",
    minHeight: "280px",
    padding: "28px 26px",
    border: "1px solid rgba(180, 159, 214, 0.16)",
    borderRadius: "20px",
    backgroundColor: "rgba(8, 8, 13, 0.72)",
    boxShadow: "0 18px 44px rgba(0, 0, 0, 0.24)",
    textAlign: "left",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardPhone: {
    width: "min(78vw, 280px)",
    minHeight: "250px",
    padding: "22px 20px",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    gap: "12px",
  },
  cardYear: {
    color: "rgba(214, 205, 232, 0.52)",
    fontSize: "0.82rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: "2rem",
    lineHeight: 0.98,
    letterSpacing: "-0.04em",
    color: "#faf7ff",
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  cardAccent: {
    color: "rgba(70, 239, 134, 0.9)",
    fontSize: "0.92rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  cardDescription: {
    color: "rgba(224, 217, 238, 0.72)",
    marginBottom: "18px",
    fontSize: "0.95rem",
  },
  contactSection: {
    marginTop: "44px",
    padding: "34px 38px",
    borderRadius: "24px",
    backgroundColor: "rgba(8, 9, 14, 0.48)",
    border: "1px solid rgba(198, 179, 230, 0.14)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(8px)",
  },
  contactIntro: {
    maxWidth: "620px",
    marginBottom: "22px",
    color: "rgba(228, 223, 240, 0.74)",
  },
  contactGrid: {
    display: "grid",
    // Four fixed tracks rather than auto-fit, so the row never breaks into a
    // 3 + 1 orphan. minmax(0, ...) lets tracks shrink below their content.
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
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    overflow: "hidden",
    padding: "13px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#ece7f7",
    background: "rgba(98, 48, 143, 0.1)",
    border: "1px solid rgba(168, 145, 203, 0.16)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  contactIconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    border: "1px solid rgba(184, 166, 214, 0.2)",
    backgroundColor: "rgba(124, 73, 171, 0.18)",
  },
  contactIcon: {
    color: "#f3effc",
  },
  contactCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    flexGrow: 1,
  },
  contactLabel: {
    color: "rgba(196, 177, 226, 0.7)",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  contactValue: {
    color: "rgba(246, 243, 251, 0.94)",
    fontSize: "0.88rem",
    lineHeight: 1.35,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  contactArrow: {
    flexShrink: 0,
    color: "rgba(196, 177, 226, 0.6)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(4, 4, 8, 0.72)",
    backdropFilter: "blur(10px)",
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
    minHeight: "150px",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(180, 159, 214, 0.18)",
    backgroundColor: "rgba(10, 11, 16, 0.86)",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(10px)",
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
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    backgroundColor: "rgba(16, 17, 24, 0.9)",
  },
  floatingImage: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
  },
  modalCard: {
    width: "min(680px, 100%)",
    maxHeight: "min(88vh, 920px)",
    padding: "28px",
    borderRadius: "24px",
    backgroundColor: "rgba(8, 9, 14, 0.96)",
    border: "1px solid rgba(198, 179, 230, 0.18)",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
    textAlign: "left",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  modalCardPhone: {
    width: "100%",
    maxHeight: "none",
    padding: "22px 18px",
    borderRadius: "20px",
  },
  modalMediaRail: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    width: "100%",
  },
  modalMediaRailButton: {
    appearance: "none",
    width: "100%",
    padding: 0,
    border: "1px solid rgba(180, 159, 214, 0.18)",
    borderRadius: "18px",
    background: "rgba(10, 11, 16, 0.86)",
    overflow: "hidden",
    cursor: "pointer",
    textAlign: "left",
  },
  modalMediaRailInner: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "14px",
    backgroundColor: "rgba(16, 17, 24, 0.9)",
  },
  modalMediaRailImage: {
    width: "100%",
    aspectRatio: "16 / 10",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
  },
  modalHeader: {
    position: "sticky",
    top: "-28px",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    margin: "-28px -28px 18px",
    padding: "18px 24px 14px",
    borderRadius: "24px 24px 0 0",
    borderBottom: "1px solid rgba(198, 179, 230, 0.12)",
    backgroundColor: "rgba(8, 9, 14, 0.95)",
    backdropFilter: "blur(10px)",
  },
  modalHeaderPhone: {
    top: "-22px",
    margin: "-22px -18px 16px",
    padding: "16px 18px 12px",
    borderRadius: "20px 20px 0 0",
  },
  modalClose: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "34px",
    height: "34px",
    padding: 0,
    borderRadius: "999px",
    border: "1px solid rgba(184, 166, 214, 0.28)",
    backgroundColor: "rgba(124, 73, 171, 0.14)",
    color: "#ece7f7",
    cursor: "pointer",
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  modalDivider: {
    height: "1px",
    margin: "24px 0 20px",
    backgroundColor: "rgba(198, 179, 230, 0.12)",
  },
  modalLead: {
    color: "rgba(240, 236, 250, 0.92)",
    fontSize: "1.06rem",
    lineHeight: 1.55,
    marginBottom: "18px",
  },
  modalTitle: {
    margin: "0 0 12px",
    fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
    color: "#faf7ff",
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
  },
  modalText: {
    color: "rgba(228, 223, 240, 0.8)",
    marginBottom: "14px",
    whiteSpace: 'pre-wrap'
  },
  inlineLink: {
    color: "rgba(214, 202, 235, 1)",
    textDecoration: "underline",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  modalActionPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#06060b",
    backgroundColor: "rgba(214, 202, 235, 1)",
    border: "1px solid rgba(214, 202, 235, 0.7)",
    fontSize: "0.9rem",
    fontWeight: 650,
  },
  modalActionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#ece7f7",
    backgroundColor: "rgba(124, 73, 171, 0.14)",
    border: "1px solid rgba(184, 166, 214, 0.3)",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  modalSection: {
    marginTop: "24px",
  },
  modalSectionTitle: {
    margin: "0 0 12px",
    fontSize: "1rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(236, 231, 247, 0.9)",
  },
  mediaCaption: {
    color: "rgba(214, 202, 235, 0.78)",
    fontSize: "0.8rem",
    lineHeight: 1.4,
    textAlign: "left",
  },
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(3, 3, 7, 0.88)",
    backdropFilter: "blur(8px)",
  },
  lightboxClose: {
    position: "absolute",
    top: "24px",
    right: "24px",
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: 0,
    border: "1px solid rgba(184, 166, 214, 0.34)",
    backgroundColor: "rgba(124, 73, 171, 0.16)",
    color: "#ece7f7",
    borderRadius: "999px",
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
  lightboxCaption: {
    color: "rgba(214, 202, 235, 0.8)",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  lightboxImage: {
    maxWidth: "100%",
    maxHeight: "90vh",
    objectFit: "contain",
    display: "block",
    borderRadius: "16px",
    boxShadow: "0 28px 60px rgba(0, 0, 0, 0.4)",
  },
  playableFrame: {
    width: "100%",
    height: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid rgba(180, 159, 214, 0.16)",
    backgroundColor: "rgba(12, 12, 18, 0.86)",
  },
  playableEmbed: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    backgroundColor: "#090a0f",
  },
  playablePlaceholder: {
    borderRadius: "18px",
    border: "1px dashed rgba(184, 166, 214, 0.34)",
    backgroundColor: "rgba(12, 12, 18, 0.86)",
    padding: "20px",
  },
};
