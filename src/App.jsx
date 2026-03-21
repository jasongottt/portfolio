import Dither from "./components/Dither";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import VariableProximity from "./components/VariableProximity";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";

const floatingMediaPositions = [
  { top: "4%", left: "1.5%", rotate: "-8deg" },
  { top: "8%", right: "1.5%", rotate: "7deg" },
  { bottom: "6%", left: "4%", rotate: "-6deg" },
  { bottom: "10%", right: "3%", rotate: "6deg" },
];

export default function App() {
  const containerRef = useRef(null);
  const projectsViewportRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const projects = [
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
        "This was a project for an introductory Unreal Engine class, where we were tasked to create a small prototype in teams of two, based on the theme \"Jammed\". We decided to make a game where a cube of spikes closes in on the player, with only one side having an opening. The player has to quickly find the gap and get through it before the cube crushes them. This cycle repeats infinitely, and the goal is to survive as long as possible. \n\nI was responsible for the majority of the development of the project, including programming the main gameplay mechanics, especially the collision detection and response systems, as well as scorekeeping. This project was a great opportunity for me to learn Unreal Engine and get comfortable with its various systems, such as Blueprints and level design tools. Due to the nature of this being a class project, there isn't a public repository or link available for this project.",
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
        "This was a project for a Java programming class, where we were tasked to create a social media application with support for multiple users and concurrent interactions. I designed the application with a focus on clean code structure and efficient multithreading to handle simultaneous user actions. The application includes features such as friending users, blocking users, and live messaging. This project was a great opportunity for me to deepen my understanding of Java, especially in terms of concurrency and object-oriented design principles. Due to the nature of this being a class project, there isn't a public repository or link available for this project anymore.",
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

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", onWheel);
    };
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

      <div style={styles.page}>
        <header ref={containerRef} style={styles.landing}>
          <div style={styles.heroShell}>
            <h1 style={styles.hello}>
              <VariableProximity
                label="Jason Gottesman"
                className="variable-proximity-demo"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={140}
                falloff="linear"
              />
            </h1>

            <p style={styles.heroLead}>
              CS + Game Development student at Purdue University with a passion for human-computer interaction through interesting software and video games.
            </p>

            <div style={styles.actions}>
              <a href="#projects" style={styles.buttonPrimary}>
                Projects
              </a>
              <a href="#contact" style={styles.buttonSecondary}>
                Contact
              </a>
              <a href="/resume.pdf" style={styles.buttonSecondary}>
                Resume
              </a>
            </div>
          </div>
        </header>

        <main style={styles.content}>
          <section style={styles.sectionPanel}>
            <div style={styles.sectionHeader}>
              <h2>About</h2>
              <span style={styles.sectionLabel}>WHO AM I?</span>
            </div>
            <p style={styles.bodyText}>
              I'm Jason, a student at Purdue University. I am majoring in Computer Science with a concentration in 
              Computer Graphics and Visualization, as well as a major in Game Development. I care a lot about crafting
              experiences that are fun and interesting, whether it's a game, a website, or any other unique interactive project.
              I have experience in full-stack web development, game development in Godot, Unreal Engine, and Unity, as well as UI/UX design. 
            </p>
            <br />
            <p style={styles.bodyText}>
              Outside of development, I enjoy playing video games, especially ones with strong narrative and unique mechanics. I love hiking and exploring outdoors, and I spend a lot of time volunteering for Purdue's Dance Marathon, which raises money for the Riley Hospital for Children. If you'd be interested in donating there, <a href="https://events.dancemarathon.com/participants/jasongott" target="_blank" rel="noopener noreferrer"style={{ color: 'rgba(214, 202, 235, 1)' }}> here's my fundraising page!</a>
            </p>
          </section>

          <section id="projects" style={styles.projectsSection}>
            <div style={styles.sectionHeader}>
              <h2>Projects</h2>
              <span style={styles.sectionLabel}>WHAT CAN I MAKE?</span>
            </div>
            <p style={styles.projectsIntro}>
              A selection of projects I've made, some are marked as playable in-browser games.
            </p>
            <div ref={projectsViewportRef} style={styles.projectsViewport}>
              <div style={styles.projectsTrack}>
                {projects.map((project) => (
                  <motion.button
                    key={project.title}
                    type="button"
                    style={styles.cardLink}
                    onClick={() => setSelectedProject(project)}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <article style={styles.card}>
                      <div style={styles.cardTopRow}>
                        <span style={styles.cardYear}>{project.year}</span>
                        <span
                          style={{
                            ...styles.cardAccent,
                            visibility: project.accent ? "visible" : "hidden",
                          }}
                        >
                          {project.accent || "Playable!"}
                        </span>
                      </div>
                      <motion.h3 style={styles.cardTitle}>
                        {project.title}
                      </motion.h3>
                      <motion.p style={styles.cardDescription}>
                        {project.description}
                      </motion.p>
                      <p style={styles.cardTech}>
                        <strong>Made with:</strong> {project.tech}
                      </p>
                    </article>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" style={styles.contactSection}>
            <div style={styles.sectionHeader}>
              <h2>Contact</h2>
              <span style={styles.sectionLabel}>WHERE CAN YOU CONNECT WITH ME?</span>
            </div>
            <div style={styles.contactGrid}>
              <a href="mailto:jgottes@purdue.edu" style={styles.contactCard}>
                <Mail size={48} style={styles.contactIcon} />
              </a>
              <a href="https://github.com/jasongottt" style={styles.contactCard}>
                <Github size={48} style={styles.contactIcon} />
              </a>
              <a href="https://www.linkedin.com/in/jasongottesman" style={styles.contactCard}>
                <Linkedin size={48} style={styles.contactIcon} />
              </a>
              <a href="https://www.instagram.com/jasongottt/" style={styles.contactCard}>
                <Instagram size={48} style={styles.contactIcon} />
              </a>
            </div>
          </section>
        </main>
      </div>

      {selectedProject ? (
        <motion.div
          style={styles.modalOverlay}
          onClick={() => setSelectedProject(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div style={styles.modalStage} onClick={(event) => event.stopPropagation()}>
            {selectedProject.screenshots.slice(0, 4).map((image, index) => (
              <motion.div
                key={image.path}
                style={{
                  ...styles.floatingMediaCard,
                  ...floatingMediaPositions[index % floatingMediaPositions.length],
                }}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  y: [320, 300, 320],
                  rotate: floatingMediaPositions[index % floatingMediaPositions.length].rotate,
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.24 },
                  y: {
                    duration: 5 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: { duration: 0.24 },
                }}
              >
                <button
                  type="button"
                  style={styles.floatingMediaButton}
                  onClick={() =>
                    setSelectedImage({
                      label: image.label,
                      path: image.path.startsWith("/") ? image.path : `/${image.path}`,
                    })
                  }
                >
                  <div style={styles.floatingMediaInner}>
                    <img
                      src={image.path.startsWith("/") ? image.path : `/${image.path}`}
                      alt={image.label}
                      style={styles.floatingImage}
                    />
                    <span style={styles.mediaPlaceholderPath}>{image.label}</span>
                  </div>
                </button>
              </motion.div>
            ))}

            <motion.div
              style={styles.modalCard}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 230, damping: 24 }}
            >
              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
              >
                X
              </button>
              <div style={styles.modalMetaRow}>
                <span style={styles.cardYear}>{selectedProject.year}</span>
                {selectedProject.accent ? (
                  <span style={styles.cardAccent}>{selectedProject.accent}</span>
                ) : null}
              </div>
              <motion.h3 style={styles.modalTitle}>
                {selectedProject.title}
              </motion.h3>
              <motion.p style={styles.modalText}>
                {selectedProject.description}
              </motion.p>
              <p style={styles.modalText}>{selectedProject.details}</p>
              <div style={styles.modalActions}>
                {selectedProject.repoUrl ? (
                  <a
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.modalActionButton}
                  >
                    <Github size={20} color="#f3effc" />
                  </a>
                ) : null}
              </div>
              <p style={styles.modalTech}>
                <strong>Made with:</strong> {selectedProject.tech}
              </p>

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
          </div>
        </motion.div>
      ) : null}

      {selectedImage ? (
        <div style={styles.lightboxOverlay} onClick={() => setSelectedImage(null)}>
          <button
            type="button"
            style={styles.lightboxClose}
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
          >
            X
          </button>
          <div style={styles.lightboxStage} onClick={(event) => event.stopPropagation()}>
            <img
              src={selectedImage.path}
              alt={selectedImage.label}
              style={styles.lightboxImage}
            />
          </div>
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
  landing: {
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
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
  hello: {
    fontSize: "clamp(4.5rem, 10vw, 8rem)",
    color: "white",
    margin: 0,
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    fontWeight: 650,
    textAlign: "center",
  },
  heroLead: {
    maxWidth: "760px",
    margin: "22px auto 0",
    fontSize: "1.12rem",
    color: "rgba(236, 231, 247, 0.76)",
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
  buttonPrimary: {
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
    padding: "12px 22px",
    border: "1px solid rgba(184, 166, 214, 0.34)",
    textDecoration: "none",
    color: "#ece7f7",
    backgroundColor: "rgba(124, 73, 171, 0.12)",
    borderRadius: "999px",
    fontWeight: 500,
    backdropFilter: "blur(12px)",
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
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
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
  projectsIntro: {
    position: "relative",
    zIndex: 1,
    maxWidth: "700px",
    marginBottom: "22px",
    color: "rgba(228, 223, 240, 0.74)",
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
  projectsTrack: {
    display: "flex",
    gap: "20px",
    width: "200%",
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
    marginBottom: "14px",
    flexGrow: 1,
  },
  cardTech: {
    color: "rgba(242, 238, 248, 0.88)",
    marginBottom: "18px",
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
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "32px",
    marginTop: "10px",
  },
  contactCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    borderRadius: "18px",
    textDecoration: "none",
    color: "#ece7f7",
    background: "rgba(98, 48, 143, 0.08)",
    border: "1px solid rgba(168, 145, 203, 0.14)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    minHeight: "72px",
  },
  contactIcon: {
    color: "#f3effc",
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
  modalStage: {
    position: "relative",
    width: "min(1180px, 100%)",
    minHeight: "min(88vh, 920px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  modalClose: {
    appearance: "none",
    borderRadius: "999px",
    color: "#ece7f7",
    cursor: "pointer",
    display: "block",
    fontWeight: 600,
    marginLeft: "auto",
    marginBottom: "18px",
    padding: "0px 16px",
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px",
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
  modalActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  modalActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 10px",
    borderRadius: "999px",
    textDecoration: "none",
    border: "1px solid rgba(214, 202, 235, 0.3)",
    fontWeight: 700,
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
  mediaPlaceholderPath: {
    color: "rgba(196, 177, 226, 0.72)",
    fontSize: "0.82rem",
    wordBreak: "break-all",
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
    border: "1px solid rgba(184, 166, 214, 0.34)",
    backgroundColor: "rgba(124, 73, 171, 0.12)",
    color: "#ece7f7",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 700,
    padding: "10px 16px",
  },
  lightboxStage: {
    width: "min(1200px, 100%)",
    maxHeight: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  modalTech: {
    color: "rgba(242, 238, 248, 0.88)",
    marginTop: "20px",
  },
};
