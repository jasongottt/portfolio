import { experience } from "./experience";
import { NAME_LAYOUTS, buildLand } from "./nameIslands";
import { projects } from "./projects";

const playableCount = projects.filter((project) => project.playableEmbed).length;

/**
 * The world behind the page: islands that spell JASON., with a landmark per
 * stage (src/world).
 *
 * - stages: what's in the world, in tab order. `level` numbers the stage, and
 *   section headings show it too. `icon` names the pixel landmark in
 *   world/pixelArt.js that section headings wear. `banner` is the text on the
 *   landmark's hover label. `action` is what clicking the landmark does:
 *     { type: "section", target }  scrolls to the section with that id
 *     { type: "link", href }       follows the link
 *     { type: "project", title }   opens that project's popup at its game
 *   The section stages, in order, are the stops the character walks between
 *   as the page scrolls.
 * - paths: which stages are connected. Shared by both layouts.
 * - layouts: where everything goes, per screen shape. `land` is a text grid
 *   from nameIslands.js, '#' for land and '.' for water, one character per
 *   cell. Stage positions and path bends are [col, row] (a bend can fall
 *   between cells). Bends are keyed "from>to" in the same order the path is
 *   listed in `paths`; a path curves smoothly through its bends (pathLine in
 *   mapGraph.js), or runs straight without any. Where a path crosses water,
 *   the world lays a plank bridge. `campfire` is the cell of
 *   the fire Explore mode can sit at, near the last stop, off the paths.
 *
 * - secret: what Explore mode hides for people who wander. It washes up on
 *   the island of the `island` stage, as far from it as that island goes.
 *
 * Paths only meet at stages, and no two paths may leave a stage in the same
 * direction, so a direction always has one answer. worldMap.test.js checks
 * both layouts.
 */
export const worldMap = {
  start: "about",
  stages: [
    {
      id: "about",
      label: "About",
      level: "1-1",
      icon: "house",
      banner: { title: "Jason's house", detail: "Start here · About me" },
      action: { type: "section", target: "about" },
    },
    {
      id: "experience",
      label: "Experience",
      level: "1-2",
      icon: "tower",
      banner: {
        title: "Experience",
        detail: `${experience.length} roles · ReliaQuest, AI agents, XR research, web`,
      },
      action: { type: "section", target: "experience" },
    },
    {
      id: "projects",
      label: "Projects",
      level: "1-3",
      icon: "computer",
      banner: {
        title: "Projects",
        detail: `${projects.length} projects · ${playableCount} playable`,
      },
      action: { type: "section", target: "projects" },
    },
    {
      id: "contact",
      label: "Contact",
      level: "1-4",
      icon: "letter",
      banner: { title: "Contact", detail: "Email, GitHub, LinkedIn" },
      action: { type: "section", target: "contact" },
    },
    {
      id: "resume",
      label: "Resume",
      level: "Secret exit",
      icon: "scroll",
      banner: { title: "Resume", detail: "PDF" },
      action: { type: "link", href: "/resume.pdf" },
    },
    {
      id: "ship-happens",
      label: "Ship Happens",
      level: "Bonus stage",
      icon: "ship",
      banner: { title: "Ship Happens", detail: "★ 1st place · Kiln Game Jam" },
      action: { type: "project", title: "Ship Happens" },
      needsKeyboard: false,
    },
    {
      id: "shadow-boxing",
      label: "Shadow Boxing",
      level: "Bonus stage",
      icon: "ring",
      banner: { title: "Shadow Boxing", detail: "2-player boxing prototype" },
      action: { type: "project", title: "Shadow Boxing" },
      needsKeyboard: true,
    },
  ],
  secret: {
    island: "about",
    title: "A note in a bottle",
    text: "You found it! Most people just scroll past, so thanks for taking a walk around. If you liked wandering my little world, I'd love to hear from you.",
    sign: "Jason",
    action: { label: "Say hi", type: "section", target: "contact" },
  },
  paths: [
    ["about", "experience"],
    ["experience", "projects"],
    ["projects", "contact"],
    ["contact", "ship-happens"],
    ["ship-happens", "shadow-boxing"],
    ["shadow-boxing", "resume"],
  ],
  layouts: {
    // Letter to letter along JASON., up and down: home on the J's hook,
    // Experience up on the A's crossbar, Projects at the foot of the S,
    // Contact partway up the O's right side, the games at the bottom of the
    // N, and the Resume on the dot.
    wide: {
      size: NAME_LAYOUTS.wide.size,
      land: buildLand(NAME_LAYOUTS.wide),
      stages: {
        about: [10, 32],
        experience: [33, 24],
        projects: [52, 32],
        contact: [81, 25],
        "ship-happens": [90, 32],
        "shadow-boxing": [101, 28],
        resume: [108, 32],
      },
      // Over the water from the J and up the A's left leg; down its right leg
      // and over to the S; along the bottom of the O, clear of the campfire,
      // and up its side. Each path keeps clear of its stages' landmarks (back
      // and to the right).
      bends: {
        "about>experience": [[15.5, 31.9], [20, 31], [24.5, 30], [27.5, 27.5]],
        "experience>projects": [[38.5, 25.5], [40, 30], [44.5, 32]],
        "projects>contact": [[58, 32.1], [65, 31.5], [72, 32.4], [79, 31.5]],
        "contact>ship-happens": [[85.5, 25.2], [89, 28]],
        "ship-happens>shadow-boxing": [[94.5, 32.2], [98, 30.5]],
        "shadow-boxing>resume": [[103.5, 30]],
      },
      // Inside the bottom of the O, below and left of the mailbox.
      campfire: [72, 29],
    },
    // JA over SON.: along the JA baseline, down to the top of the O, over to
    // the S, then along the SON. baseline.
    tall: {
      size: NAME_LAYOUTS.tall.size,
      land: buildLand(NAME_LAYOUTS.tall),
      stages: {
        about: [24, 28],
        experience: [40, 28],
        projects: [16, 39],
        contact: [27, 52],
        "ship-happens": [48, 52],
        "shadow-boxing": [60, 52],
        resume: [66, 60],
      },
      // Rounding each turn, and bowing toward the camera between the J and A.
      bends: {
        "about>experience": [[33.5, 29.4]],
        "experience>projects": [[40, 35.5], [36.5, 39]],
        "projects>contact": [[16, 48.5], [19.5, 52]],
        "shadow-boxing>resume": [[60, 57.5], [62.5, 60]],
      },
      // Up the O's left side, above the mailbox.
      campfire: [27, 46],
    },
  },
};
