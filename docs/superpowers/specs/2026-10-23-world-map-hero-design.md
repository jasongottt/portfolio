# World map hero

The top of the portfolio becomes a small Super Mario World style overworld. Visitors walk a pixel character between stages; each stage is a part of the site or one of the playable games. Everything below the top section (About, Experience, Projects, Contact) stays as it is.

Inspired by [cindyly.design](https://www.cindyly.design/), whose homepage is built around one interactive object that is clearly hers. Here the object is a game map, because the thing this portfolio has that others don't is games you can actually play.

## Decisions

| Question | Decision | Not chosen |
| --- | --- | --- |
| How big a change | Rebuild only the top section around one centerpiece | Light touches only; turning the whole site into an app |
| Centerpiece | A Super Mario World style overworld | Pocket console with project cartridges (parked for a future Projects redesign); platformer on the name; desk scene |
| Look | Cohesive pixel art on one pixel grid, in a palette built from the theme hue, inside a panel like the sections | Chunky multicolor pixel art with mixed pixel sizes (built first; looked sloppy); thin-line drawing in the site's hairline style (built second; consistent but boring); dithered relief; isometric diorama |
| Stages | Site sections plus the two games as bonus stages | Sections only; sections plus secrets |
| Build | SVG drawn by React from a data file | Pixel canvas; embedded Godot export |

## What visitors see and do

### Desktop layout

The first screen (`100svh`) holds the name and the map, replacing the current name box.

- **Top:** the name in Playfair Display, keeping the existing weight-follows-cursor effect (`VariableProximity`), the current one-line intro under it, and a mono "Now · Next" status line (`STATUS` in `Hero.jsx`; stacked on phones).
- **Below it, filling the rest:** the map, scaled to fit, with no box around it. It sits straight on the page's animated background, and its sea dithers away into it (see Look).
- **Under the map:** a slim floating status bar the same width as the sections, styled like the nav that appears on scroll (1px `RULE` border, dark translucent fill, blur):
    - **Left:** a mono meta line and a Playfair title.
    - **Right:** the dim key hint "← ↑ ↓ → walk" and an action button ("Enter ↵ to view"). Clicking the button does the same as pressing Enter.
- **Bottom center, below the panel:** the existing animated scroll cue.

The three buttons in today's top section (Projects, Contact, Resume) are removed; the stages replace them. The floating nav that appears after scrolling is unchanged.

### Stages

| Stage | Landmark | Entering it | Status title | Status meta line | Action button |
| --- | --- | --- | --- | --- | --- |
| About | House (start position) | Smooth-scrolls to `#about` | Jason's house | 1-1 · Start here · About me | Enter ↵ to read About |
| Experience | Bell tower (a Purdue nod) | Smooth-scrolls to `#experience` | Experience | 1-2 · 4 roles · XR research, AI agents, web | Enter ↵ to view |
| Projects | Computer with a prompt | Smooth-scrolls to `#projects` | Projects | 1-3 · 9 projects · 2 playable | Enter ↵ to view |
| Contact | Envelope | Smooth-scrolls to `#contact` | Contact | 1-4 · Email, GitHub, LinkedIn | Enter ↵ to view |
| Resume | Page, on its own islet reached by a bridge ("secret exit"); gold dot | Opens `/resume.pdf` in a new tab | Resume | Secret exit · PDF | Enter ↵ to open |
| Ship Happens | Sailboat with mint sails; mint dot | Opens the Ship Happens project popup, scrolled to the game | Ship Happens | Bonus stage · Playable! · ★ 1st place · Kiln Game Jam | Enter ↵ to play |
| Shadow Boxing | Boxing ring with mint ropes; mint dot | Opens the Shadow Boxing project popup, scrolled to the game | Shadow Boxing | Bonus stage · Playable! · 2-player boxing prototype | Enter ↵ to play |

- The numbers in the meta lines are computed so they never go stale. The Projects counts come from `src/data/projects.js` (total, and how many have `playableEmbed`). The Experience count comes from `src/data/experience.js`. The rest of the text is fixed.
- The meta line is dim mono, like the year on project cards. "Playable!" is in the cards' mint (`rgba(134, 236, 182, 0.95)`).
- On touch devices (`(pointer: coarse)`), "Enter ↵ to" becomes "Tap to".
- Game stages have a `needsKeyboard` setting. When it's true on a touch device, "Playable!" reads "Playable on desktop". Values: Shadow Boxing `true`. Ship Happens `false`, since it plays by tapping (checked on an emulated phone).

### Controls

- **Keyboard:** arrow keys or WASD move to the stage connected in that direction. Enter or Space enters the current stage.
- **Hover:** hovering a stage previews it in the status bar and moves the blinking corner brackets onto it. Moving off it returns both to the character's stage.
- **Click or tap:** the character walks the route to that stage, then enters it. Resume is the exception: it opens the PDF straight away while the character walks there, because a new tab opened after the walk would be caught by popup blockers.
- **Tab:** stages are focusable in this order: About, Experience, Projects, Contact, Resume, Ship Happens, Shadow Boxing. Focusing one walks the character there; Enter enters.
- **Walking:** 400 map units per second along the path, where one grid cell is 10 units. When a route would take longer than 1.2 seconds, the speed rises so it arrives in 1.2 seconds.
- **Clicking mid-walk:** if a new destination is chosen while walking, the character finishes its current segment, then follows the route to the new stage.

## Phones

Phones (the existing `isPhone` breakpoint) use a tall layout of the same map.

- **Shared:** the stages, the connections between them, and what each stage does.
- **Per layout:** the land grid, stage positions and path corner points.
- **Status bar:** stacks the title above the action button, and leaves out the key hint. Its meta line always reserves two lines, so the status bar (and the map above it) never changes size when the selected stage changes. Otherwise the map would shrink between a tap's touch and its click, and the click would miss the stage.
- **Bottom padding:** the hero leaves room at the bottom, so the panel clears the fixed color button.
- **Name:** shown as static text, as today.
- **Resizing:** switching between layouts keeps the character on the same stage.

## Look

The map is pixel art, all on one grid: 3 art pixels per map cell, so islands, landmarks and the character share a pixel size. Its palette is built from the theme hue, so it sits inside the site's panel without clashing.

- **Water:**
  - Drawn by `WaterCanvas.jsx`: a canvas with one pixel per art pixel, scaled up crisply under the map's SVG. It redraws when the theme changes, which is cheap.
  - Shallow water, a lighter two-tone checker, hugs every shore (3 art pixels).
  - Deep water, a darker checker, is solid out to 8 art pixels from land.
  - From there to 26 art pixels, it thins out in a 4×4 ordered dither, the same kind of pattern as the background shader, until the page background shows through completely. It also dithers away near the canvas edges, so the sea never ends in a straight line.
  - Sparse 3-pixel glints in the solid sea blink in two alternating sets, so the water shimmers.
- **Islands:**
  - Grass, slightly lighter four or more cells inland, with scattered light and dark speckles.
  - A bright 1-pixel rim along every shore, with sandy specks just inside it.
  - A two-tone cliff face in the water row under each south shore, with a shadow row below it.
- **Bridges:** plank decks with a dark lower edge, wherever a path crosses water.
- **Paths:** a light pixel on every other cell.
- **Stages:** a 5×5 dot at the stage's cell (light for sections, mint for games, gold for the secret exit), with its pixel landmark standing on top. The stage the status bar describes gets blinking pixel corner brackets.
- **Labels:** uppercase Geist Mono on small dark plates, like the labels on a game map. They're HTML on top of the map, hidden from screen readers.
- **"World 1 · Purdue":** in the panel's top-left corner.
- **Theme colors:** each color is a `px-*` class in `index.css`, derived from `--hue` and `--sat`, so the shuffle button and the Konami party recolor the map with no React work. Gold, mint, skin and hair stay fixed, like the site's "Playable!" mint.
- **Rendering:** each color layer is a single SVG path made of art-pixel squares, so the whole map is a few dozen DOM nodes and recolors through CSS.
- **Character:** a placeholder sprite, 5×9 art pixels, standing on the stage's dot in front of its landmark.
  - It has a 2-frame walk cycle, faces the direction it's walking, and bobs one art pixel when idle.
  - A sprite that looks like Jason can replace it later by editing the rows in `pixelArt.js`.

## How it's built

### Map data: `src/data/worldMap.js`

```js
export const worldMap = {
  start: "about",
  stages: [
    {
      id: "experience",
      label: "Experience",
      level: "1-2",
      icon: "tower", // a pixel landmark in components/worldmap/pixelArt.js
      banner: { title: "Experience", detail: "…", action: "view" }, // "Enter ↵ to view"
      action: { type: "section", target: "experience" },
    },
    {
      id: "ship-happens",
      label: "Ship Happens",
      level: "Bonus stage",
      icon: "ship",
      banner: { … },
      action: { type: "project", title: "Ship Happens" },
      needsKeyboard: false,
    },
    { id: "resume", label: "Resume", level: "Secret exit", icon: "scroll", banner: { … }, action: { type: "link", href: "/resume.pdf" } },
    // …
  ],
  // Shared by both layouts. Each entry is one walkable path.
  paths: [
    ["about", "experience"],
    ["experience", "projects"],
    ["experience", "ship-happens"],
    ["projects", "contact"],
    ["contact", "resume"],
    ["contact", "shadow-boxing"],
  ],
  layouts: {
    wide: {
      size: [100, 45], // grid cells
      land: `
        ....####........
        ...######.......
      `, // '#' land, '.' water; one character per cell
      stages: { about: [12, 36], experience: [26, 20] /* … */ },
      // Corner points between the two stages, keyed "from>to" in the order listed in `paths`.
      corners: { "about>experience": [[12, 29], [26, 29]] /* … */ },
    },
    tall: { size: [40, 78], land: `…`, stages: { … }, corners: { … } },
  },
};
```

**Path rules** (enforced by tests):
- Paths only meet at stages.
- A path's direction at a stage is the direction of its first segment leaving that stage.
- At each stage, in each layout, every attached path leaves in a different direction. That makes the arrow keys unambiguous, the way they are in Super Mario World.

The mockups were illustrations. The final layouts are drawn to satisfy these rules.

### Components: `src/components/worldmap/`

| File | Job |
| --- | --- |
| `WorldMap.jsx` | The map panel. Chooses the layout from `isPhone`. Renders `MapTiles`, the selection brackets, the stage labels and buttons, the `Walker` and the status bar. Owns the "current stage" and "previewed stage" state. |
| `MapTiles.jsx` | One memoized SVG layer: land, shore, cliffs, bridges, path dots and stage icons. It depends only on the layout, so it never re-renders when the character moves or the theme changes. |
| `pixelArt.js` | The pixel grid (`ART` pixels per cell), the landmark and character sprites as rows of characters, the stage dot, and helpers for where a stage's dot and landmark sit. |
| `PixelSprite.jsx` | Draws a sprite as one path per color, using the `px-*` classes. Used by the map, the character and the section heading badges. |
| `WaterCanvas.jsx` | The sea: shallows, solid deep water, and a dithered fade into the page background, drawn per art pixel from a distance-to-land field. |
| `Walker.jsx` | The character sprite. Follows a polyline using `requestAnimationFrame`, writing its `transform` through a ref so React doesn't re-render each frame. Calls back when it arrives. Pauses while the map is off screen. |
| `mapGraph.js` | Plain functions, no React: `parseLand(text)`, `pathDirection(layout, path, fromStage)`, `neighborInDirection(map, layout, stageId, dir)`, `route(map, fromId, toId)` (breadth-first over `paths`), `routePolyline(layout, route)`. |
| `useMapControls.js` | Keyboard input. Listens on `window`. Acts only when all of these hold: the map is at least 50% visible (`IntersectionObserver`), no project popup or image viewer is open, and focus is not in a text field. Calls `preventDefault` only when a key actually moved the character or entered a stage. |

**Stage buttons**
- They are real elements laid over the SVG, positioned by percentage of the map's size.
- Each is a `<button>` with `aria-label="<label>, <what entering does>"`, except Resume, which is an `<a href="/resume.pdf" target="_blank" rel="noopener noreferrer">`. Entering Resume from the keyboard calls that link's `click()`, so it behaves like a normal link.
- They are invisible apart from a focus ring, using the existing `a:focus-visible, button:focus-visible` style.

**Entering a stage**
- `section` scrolls to the element with that id, with `behavior: "smooth"` unless reduced motion is on.
- `link` follows the link.
- `project` calls `onOpenProject(title, { focusPlayable: true })`.

### Changes to existing files

- **`src/components/Section.jsx`:** each section heading shows the landmark of the map stage that leads to it (looked up by section id in `worldMap.js`) beside the title, and the stage's level ("1-2") at the right end of the heading rule. That ties the page below back to the map without changing how it scrolls.
- **`src/sections/Hero.jsx`:**
  - Keeps the `<header id="top">` with `heroRef` (the nav still measures it), the name and the intro line.
  - Drops the three action buttons and renders `<WorldMap>` in their place.
  - Takes a new `onOpenProject` prop and passes it to the map.
- **`src/App.jsx`:**
  - Passes an `openProjectByTitle(title, { focusPlayable })` handler to `Hero`, extending the existing `openProjectByTitle`.
  - Keeps `focusPlayable` in state next to `selectedProject`.
- **`src/components/ProjectModal.jsx`:**
  - A new `focusPlayable` prop. When true, after the popup opens it scrolls the "Play here!" section into view inside the popup card.
  - Click to play: a game's iframe only mounts once the visitor clicks a cover showing the first screenshot, a Play button, and the download size (`playableEmbed.size`). Opening from a map game stage (`focusPlayable`) starts the game straight away, since the visitor already chose "play".
  - Godot builds take keyboard focus a few seconds after loading, which stopped Escape from closing the popup. The popup now also listens for Escape inside the game frame. That only works for builds hosted on this site, not cross-origin ones like itch.io.
  - When the popup closes, focus goes back to whatever opened it, so the keyboard isn't left pointing at the removed game frame.
- **`src/index.css`:** the `--map-*` custom properties on `:root`.
- **itch.io:** `playableEmbed.path` in `src/data/projects.js` can already be a full itch.io embed URL, since it's used directly as the iframe `src`. Moving a game to itch.io is a data change only.

No new runtime dependencies.

## Accessibility

- The SVG art is `aria-hidden`. The stage buttons and links carry all the meaning, in reading order.
- The status bar title is in an `aria-live="polite"` region, so moving the character announces the new stage.
- With `prefers-reduced-motion`:
  - The character jumps straight to its destination.
  - The idle bob is off.
  - Section scrolling is instant.
  - (The dither background already stops animating.)
- The map never traps the keyboard. Arrow keys fall back to normal page scrolling whenever the map isn't in control (see `useMapControls.js`).

## Edge cases

- **Konami code:** its arrow presses also move the character, and the existing color party still fires. Both listeners stay independent.
- **Unknown project title:** a `project` stage with no matching project logs a console warning and does nothing. The data tests catch this before deploy.
- **Loaded mid-page:** if the page loads scrolled to a section (a `#hash` link), the map is off screen, so arrows scroll the page.
- **Popups:** while the project popup or image viewer is open, the map ignores keys. Escape keeps closing the popup as it does now.
- **Game fails to load:** a game that fails to load inside the popup behaves as it does today. Nothing new is added for this.

## Testing

- **Vitest**, added as a dev dependency, with an `npm test` script (`vitest run`).
- **`src/components/worldmap/mapGraph.test.js`:**
  - land parsing
  - path direction
  - neighbor in each direction (including "no neighbor")
  - routes between every pair of stages
  - routes through intermediate stages
- **`src/data/worldMap.test.js`**, run for both layouts:
  - every stage and path corner sits on land or on a cell that becomes a bridge
  - every stage has a position
  - every path has corners or is a straight line between its stages
  - at each stage, no two paths leave in the same direction
  - every `section` target is a real section id (`about`, `experience`, `projects`, `contact`)
  - every `project` title exists in `projects.js`
  - the grid text matches the declared `size`
- **In a real browser before calling it done**, at a 1440×900 desktop size and a 390×844 phone size:
  - walk to every stage with the keyboard, and by clicking or tapping
  - enter each one and confirm it scrolls or opens the right thing
  - confirm the shuffle button recolors the map
  - confirm reduced motion
  - check whether Ship Happens is playable by touch, and set its `needsKeyboard` to match
  - confirm there is no sideways scrolling on the phone size

## Not in this version

- Cartridges as a new look for the Projects section.
- A character sprite that looks like Jason.
- Secret paths (for example, a Konami "star road" stage).
- An itch.io button in the project popup.
- Sound effects.
