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
 *   cell. Stage positions and path corners are [col, row]. Corners are keyed
 *   "from>to" in the same order the path is listed in `paths`. Where a path
 *   crosses water, the world lays a plank bridge.
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
  paths: [
    ["about", "experience"],
    ["experience", "projects"],
    ["projects", "contact"],
    ["contact", "ship-happens"],
    ["ship-happens", "shadow-boxing"],
    ["shadow-boxing", "resume"],
  ],
  layouts: {
    // Along the baseline of JASON., letter to letter.
    wide: {
      size: NAME_LAYOUTS.wide.size,
      land: buildLand(NAME_LAYOUTS.wide),
      stages: {
        about: [10, 32],
        experience: [26, 32],
        projects: [52, 32],
        contact: [75, 32],
        "ship-happens": [90, 32],
        "shadow-boxing": [102, 32],
        resume: [108, 32],
      },
      corners: {},
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
      corners: {
        "experience>projects": [[40, 39]],
        "projects>contact": [[16, 52]],
        "shadow-boxing>resume": [[60, 60]],
      },
    },
  },
};
