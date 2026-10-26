/**
 * Every project card and modal is generated from this list, in this order.
 *
 * - description: one or two lines for the card.
 * - details: the modal body. Blank lines ("\n\n") separate paragraphs.
 * - accent / award: optional badges next to the year.
 * - liveUrl / repoUrl / readMoreUrl: optional buttons in the modal.
 * - screenshots: the first one is the card thumbnail; up to four float
 *   around the modal.
 * - playableEmbed: an in-browser build under public/, shown in an iframe
 *   once the visitor clicks Play. Builds are 16:9 unless they set
 *   aspectRatio. `size` is the rough download, shown on the Play cover.
 */
export const projects = [
  {
    title: "Real Time Code Injection",
    description:
      "A VR research project where a local LLM writes Lua code that runs live inside Unity.",
    tech: "Unity, C#, Ollama, Lua, MoonSharp",
    year: "2026",
    accent: "",
    details:
      "My research project as an XR undergraduate researcher with Dr. Voicu Popescu at Purdue. It's a Meta Quest 3 app built in Unity where you tell a cube what to do out loud, and it does it.\n\nYour command goes to a Qwen model running locally through Ollama, which writes Lua code for the behavior. That code is compiled and run inside Unity with MoonSharp, going from spoken command to running behavior in under two seconds. Behaviors can use controller input, tracking, and velocity, so the cube can react to what you're doing in the headset.\n\nRunning model-written code live means a lot of it fails, so much of the work went into making that safe. Generated code runs in a sandbox that only exposes an allowlisted API, gets syntax-checked before it runs, and goes through automatic repair attempts when it fails, which recover about 80% of failed runs. If something still breaks at runtime, it rolls back.\n\nThe project ran from May to September 2026, and the write-up linked above goes into more detail.",
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
      "A two-player boxing game prototype about guessing which way your opponent will move.",
    tech: "Godot, GDScript, Krita",
    year: "2026",
    accent: "Playable!",
    details:
      "A two-player boxing game built on a \"shadow boxing\" formula. One player picks a direction to punch while the other picks a direction to dodge. If they pick the same direction, the punch lands; if not, the roles swap. The first player to land three punches in a row wins.\n\nIt's built in Godot with GDScript, with the art made in Krita. The core loop is done and playable below, and I'm continuing to add features and polish on the side.",
    repoUrl: "https://github.com/jasongottt/shadow-boxing",
    screenshots: [
      { label: "Basic gameplay sprites", path: "/projects/shadowbox1.png" },
      { label: "Early main menu", path: "/projects/shadowbox2.png" },
    ],
    playableEmbed: {
      label: "Play here!",
      path: "/projects/playables/shadow-boxing/index.html",
      ready: true,
      aspectRatio: 1,
      size: "37 MB",
    },
  },
  {
    title: "Spotlight.",
    description:
      "A Kanban-style task board in React and Supabase, built around a spotlight that follows your cursor.",
    tech: "React.js, Supabase",
    year: "2026",
    accent: "",
    details:
      "A task board I built to practice React and Supabase, and to try out a visual idea: a spotlight that follows your cursor, lighting up and saturating whatever is under it while the rest of the board stays dark and desaturated. It keeps your attention on the part of the board you're working in.\n\nUnder the effect is a full Kanban app. Tasks move between columns with a custom drag-and-drop system, and a Supabase backend stores tasks, teams, labels, comments, and activity history. It's deployed, so you can try it with the live demo link above.\n\nNOTE: Supabase's free tier pauses the database after a week of inactivity. If the board fails to load, that's why.",
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
      "A resource management game where your ship is made of your friends, built in ~10 hours for a game jam themed \"Friendship\".",
    tech: "Godot, GDScript",
    year: "2025",
    accent: "Playable!",
    award: "1st place",
    details:
      "Made for the Purdue Hackers' Kiln Game Jam, where it took 1st place. The theme was \"Friendship\", so the player's ship is built out of their friends. Each friend is one of the ship's resources, and you balance their needs to survive as long as you can.\n\nI built everything except most of the art, which my roommate drew. Procedural generation was the main focus, to make each run play differently: the friends you meet roll random modifiers, and random events can show up at any point in a run. The jam's time limit left some rough edges, but the core loop holds up, and you can play it below.",
    repoUrl: "https://github.com/jasongottt/Ship-Happens",
    screenshots: [
      { label: "A friend asking for help", path: "/projects/ship1.png" },
      { label: "New friend screen", path: "/projects/ship2.png" },
    ],
    playableEmbed: {
      label: "Play here!",
      path: "/projects/playables/ship-happens/index.html",
      ready: true,
      size: "35 MB",
    },
  },
  {
    title: "Sheltering Wings",
    description:
      "A full-stack web app for a local nonprofit, built with Hack the Future at Purdue.",
    tech: "React, MongoDB",
    year: "2025 - 2026",
    details:
      "Through Hack the Future at Purdue, I'm on a team of 10 developers and 1 designer building software for Sheltering Wings, a local nonprofit with 30-50 employees. We work directly with their staff to figure out what they need. The app has separate manager and user dashboards and covers four main workflows: chores, the calendar, login, and user management, plus check-in and check-out.\n\nI work on both the frontend and backend, including user authentication, the MongoDB schema design, and UI components in React. The calendar uses the Microsoft Calendar API.\n\nThe code isn't public since it's built for a client.",
    repoUrl: "",
    screenshots: [
      { label: "Chore tracker prototype", path: "/projects/sheltering1.png" },
      { label: "People view prototype", path: "/projects/sheltering2.png" },
    ],
  },
  {
    title: "Jammed!",
    description:
      "An Unreal Engine survival prototype: find the one gap in a closing cube of spikes before it crushes you.",
    tech: "Unreal Engine",
    year: "2025",
    accent: "",
    details:
      "Made in a team of two for an introductory Unreal Engine class, on the theme \"Jammed\". A cube of spikes closes in on the player with an opening on only one side, and you have to find the gap and get through before it crushes you. Then it starts again, and the goal is to survive as long as you can.\n\nI built most of the project, including the core gameplay, the collision detection and response, and scorekeeping, using Blueprints. The project isn't public since it was for a class.",
    repoUrl: "",
    screenshots: [
      { label: "Gameplay screenshot", path: "/projects/jammed1.png" },
      { label: "Unreal blueprints", path: "/projects/jammed2.png" },
    ],
  },
  {
    title: "Yappify",
    description:
      "A multithreaded social media app in Java, with friending, blocking, and live messaging.",
    tech: "Java",
    year: "2024",
    details:
      "A class project to build a social media app that many people can use at the same time. It supports friending, blocking, and live messaging. I designed it around a clean object-oriented structure, with multithreading to handle simultaneous actions from different users.\n\nThe code isn't public since it was for a class.",
    repoUrl: "",
    screenshots: [
      { label: "Profile screen", path: "/projects/yappify1.png" },
      { label: "Main app screen", path: "/projects/yappify2.png" },
    ],
  },
  {
    title: "Wishbone",
    description:
      "A Discord bot that reminds my friends to make a wish at 11:11, and keeps stats and streaks in SQLite.",
    tech: "Python, SQLite",
    year: "2023",
    details:
      "Some of my friends and I have a long-running habit of making a wish at 11:11 every night, so I built a bot for it. It posts a reminder in a set channel at 11:10 and again at 11:11, and anyone who makes a wish just sends a message.\n\nThe bot saves every wish to a SQLite database and tracks stats like each person's total wishes and their streaks.",
    repoUrl: "https://github.com/jasongottt/wishbone",
    screenshots: [
      { label: "Wishing at 11:11", path: "/projects/wish1.png" },
      { label: "Statistics tracking", path: "/projects/wish2.png" },
    ],
  },
  {
    title: "This Website",
    description:
      "This portfolio: React and three.js, with islands that spell my name, a hand-written dither shader, and a character who walks between sections as you scroll.",
    tech: "React.js, three.js, CSS, Vite",
    year: "2026",
    details:
      "The site you're on. It's built with React and Vite, with plain three.js drawing the world behind the page.\n\nThe islands spell my name. The world renders at a third of the screen's resolution and goes through a dither shader I wrote, which paints every pixel from one fixed dusk palette. As you scroll, my character walks from landmark to landmark, one per section, and the camera follows like a game camera. The landmarks are clickable too, and the games here run in your browser as Godot web exports. There's also at least one secret.",
    repoUrl: "https://github.com/jasongottt/portfolio",
    screenshots: [
      { label: "Projects section", path: "/projects/this1.png" },
      { label: "Landing page", path: "/projects/this2.png" },
    ],
  },
];
