# Dusk world

The site's background stops being a stock effect and becomes Jason's own world: islands that spell **JASON**, rendered in 3D through a custom dither in a fixed "Dusk" palette. The page opens on a top-down view of the name with **GOTTESMAN** in 2D text under it. Scrolling walks Jason's pixel character from landmark to landmark, one per section, with the camera following like a game camera. The page ends by pulling back out to the name.

This replaces the top section described in `2026-10-23-world-map-hero-design.md`. The 2D pixel map retires; its stages, data and walking logic carry over into the 3D world.

Live previews from the brainstorm (not committed, under `.superpowers/brainstorm/`): `world-travel-v2.html` (palettes), `jason-islands-v2.html` (this design).

## Decisions

| Question | Decision | Not chosen |
| --- | --- | --- |
| Background | A custom 3D world of Jason's islands, through a custom dither | The ReactBits "Dither" wave (reads as a template; many portfolios use it) |
| The name | Islands spell **JASON.** (the "." is the Resume islet); **GOTTESMAN** in 2D text under it | Islands spelling the full name (too wide and too small from above) |
| Palette | One fixed palette, **Dusk**: indigo sea, coral and plum islands, peach highlights, mint and gold accents | Random color shuffle each visit; single-hue monochrome; Night; Dawn |
| How you travel | Scrolling walks the character between landmarks | Camera cutting between landmarks with no character |
| Top of the page | The 3D world's top-down overview | Keeping the 2D pixel map at the top |
| Free roaming | **Phase 2:** an optional Explore mode | Making the site only navigable by playing |

## What visitors see

### Top of the page

- **The opening:** when the page loads at the top, **JASON.** appears in peach exactly over the island letters. It's drawn from the same strokes the islands are rasterized from (`nameIslands.js`), as SVG paths with round caps, as thick as the islands, projected with the same camera math as the world but without three.js (`src/world/nameplate.js`), so it covers each island but for the coastline's wobble, on any screen and in both layouts. While the world loads, the page is a flat color matching the dithered sea (`SEA_AVERAGE`); the world reports its first drawn frame, and the water and the name fade in together then (350 ms), so the name never shows without the islands under it. It holds just under a second, then fades letter by letter, J first, to reveal the islands. Scrolling first, or loading partway down the page, skips it; it never shows if WebGL fails. The landmark circles wait until it's gone.
- **The view:** the whole world, seen from high up and nearly straight down, so the five letter islands read as **JASON.** in the dusk sea. On landscape screens the camera stands 35% further back than a tight fit, so the word sits in open sea at about 70% of the width; the stacked phone layout fits the width. The sea moves gently. The character stands at home on the J.
- **GOTTESMAN:** set in widely spaced bold capitals (Geist Mono, peach), centered under the island word. It is visible **only once the camera has settled on the full zoomed-out view**. It fades out the moment the camera starts moving, and fades back in only after the camera settles again at the end.
- **The intro:** the one-sentence intro sits under GOTTESMAN, centered, with the same show/hide rule. Nothing else: no status line or buttons on the first screen.
- **The heading:** the page's `<h1>` stays "Jason Gottesman" as real text for screen readers and search engines. It is visually hidden, since the islands and GOTTESMAN show it.
- **Navigation:** once you scroll past the top, a small pill of section links appears: in the top-right corner on desktop, centered across the top on phones. It has no name, shows each section's level on desktop, and marks the section you're in in peach. On phones its items are tighter and Resume drops its arrow, so the whole row fits from 360px wide; narrower than that, the pill scrolls sideways.
- **Panels and nav:** the section panels, the nav pill and the Projects drawer tab are solid (`#100d26`, the site's hue at 50% saturation, 10% lightness), with no blur. One switch (`DITHERED` in `src/ditherFrame.js`) picks their edges: dithered, they dissolve into the world in the world's own dither (an 8x8 Bayer fade in 3 px pixels, 2 on phones, 8 pixels deep on the panels and 3 on the nav and tab, as a nine-slice `border-image`), with padding trimmed to make room; plain, a 1px rule with the original padding.

### Scrolling

| Page section | Stage the character walks to | Landmark |
| --- | --- | --- |
| About (1-1) | Home, on the J | House |
| Experience (1-2) | The A | Bell tower |
| Projects (1-3) | The S | Computer |
| Contact (1-4) | The O | Mailbox |
| Last screen | (stays at Contact) | Camera pulls back to the full name |

- **Leaving the top:** the camera swoops from the overview down behind the character at home, finishing as the About panel reaches the character.
- **Desktop, a side column:** the sections are a column down the left (46% of the width, 480 to 680px), and the right side is open world. The camera frames the character in the middle of that open side, so it's in view the whole time. The column is on the left because the walk heads right, so you can see where the character is going.
- **Phones, gaps between sections:** the panels are full width, so each section after About has open space above it (40% of the screen height) where the world shows between the panels.
- **Walking:** the character walks from one landmark to the next and arrives as the next section reaches it, then stands at the landmark while you read. On desktop each walk takes about half a screen of scrolling; on phones it happens while the gap scrolls past. It crosses plank bridges between letters. Its position is tied to scroll position, so scrolling back up walks it back. It uses the two-frame walk and faces the direction it walks on screen.
- **Leaf piles:** each walk passes through a pile of leaves on land near its middle, and about a third of the round trees have one beside them. Walking through a pile (scrolling or exploring) bursts it: it slumps flat and its leaves fly up and flutter down around it. A while after the character has gone (6 seconds, and 2.5 cells away), the leaves gather back into a pile. Piles stay whole with reduced motion.
- **The campfire:** in a flat clearing of bare earth near the last stop (inside the bottom of the O, up and left of the mailbox; up the O's left side on phones), in a ring of stones with crossed logs: flickering flames and rising embers in their real colors, and a warm light on the ground around it. A log beside it is a seat; see Explore mode.
- **The camera:** follows from behind and above the character, eased so it never snaps. The character sits a little above the middle of the screen (42% down): centered on phones, in the middle of the open side on desktop. The overview is always centered.
- **The last screen:** after Contact, an empty screen with a "Back to the top" link. The camera pulls back to the same overview as the top while it scrolls in, and GOTTESMAN returns once it settles.
- **The page itself:** the sections (About, Experience, Projects, Contact) are the same HTML panels over the world, reworked for the narrow column:
  - **Experience** is a compact timeline: a thin line with a dot per role, upcoming first (peach dot), then ongoing (filled dot sending out a slow ring), then by end date. Each row is just the title, company (with any detail or earlier title there, "Previously Software Engineer") and dates, on the right on desktop and above the title on phones; the title turns peach on hover. Clicking a row opens its location, bullet points, tech and project link beneath it, easing open; the rows start closed, so the section stays short.
  - **Projects** is a grid of tiles (screenshot, year and badges, title, two lines of description on wider screens), the first four in `projects.js` two by two. On desktop the rest are in a drawer: a small dark tab with an arrow pokes out from behind the panel's right edge (sliding out a little on hover, like the polaroids), and clicking it slides the panel open across the open side of the screen, two rows high, so the page doesn't grow. The first four keep their places, shrinking a little to fit, and the rest are revealed in the columns to their right; the tab (its arrow flipped) or Escape slides it shut. Where five columns of at least 190px won't fit (phones, laptops under about 1200px wide), a "Show all N projects" button grows the grid down the page instead ("Show fewer" folds it back, keeping the button under the cursor). This replaced a sideways-scrolling rail, which showed only a card and a half in the column.
  - **About** has three polaroids (`src/data/photos.js`, images in `public/about/`), tucked behind the panel at slight tilts: poking out from its right edge on desktop, hanging from its bottom edge on phones, fanned across its middle and swaying slowly from where they're pinned (still with reduced motion). Hovering lifts one and slides it out; clicking flies it to the middle of the screen at full size with its caption on the print (a shared Motion `layoutId`), and clicking anywhere or Escape flies it back. The page holds still and the world pauses while one is open.
  - **Contact** is a plain list, one row per way to reach me: Email, GitHub, LinkedIn, Instagram (the resume is the nav's button), each just an icon and the handle, the whole row a link (screen readers hear the service's name too). Email has a small icon button that copies the address (a check mark for two seconds, and screen readers hear "Email address copied").

  Clicks on the empty page around them go through to the world's landmarks.

### Landmarks and clicking

All seven stages from the current map keep their landmarks:
- the house, tower, computer and mailbox from the table above
- the Resume page on the "." islet
- the Ship Happens sailboat and the Shadow Boxing ring, both on the N

**Behavior:**
- **Placement:** each landmark stands beside its stage, back and to the right (or left, or straight behind, where that spot is water), so the character stands next to it rather than in front of it.
- **Circles:** while the camera rests on the overview, each landmark shows a small pulsing circle under it, like a level marker: solid white with a thin dark outline. Pulled back, the circle is what you hover, tap or click (the landmarks are too small to aim at from that high); it grows on hover and the brackets and label appear around it. Up close, the landmark itself is the target.
- **Hover or keyboard focus:** blinking corner brackets around the landmark, like a game cursor, and a small label on a dark plate appears by the landmark, like the current map labels.
- **Click or Enter:**
  - A section landmark smooth-scrolls to its section, so the character walks there.
  - Resume opens the PDF in a new tab.
  - A game landmark opens the project popup with the game started, as the map's game stages do today.
- **How it's built:** each landmark has a real, invisible HTML button positioned over it on screen. That's what keyboard focus and screen readers land on.

### Phones

- **Letter layout:** in portrait, the word stacks as **JA** over **SON.**, so the letters stay big. This is a second land layout with its own stage positions and paths. The stages, sections and behavior are shared. The layout follows the screen's shape: portrait gets the stacked word, landscape the wide one.
- **Camera:** the overview frames the stacked word; the follow camera works the same.
- **Text:** GOTTESMAN and the intro sit under the stacked word.
- **Landmarks:** tapping one does what clicking does.

## Look

### Dusk palette

The world is drawn in **code colors**, not real ones:
- land, cliffs, beaches and landmarks: brightness in the red channel
- autumn leaves: brightness in the green channel
- green grass: brightness in the green channel, drawn at half alpha (everything else is fully opaque, so alpha marks grass however fog shifts its color)
- fallen leaves on the ground under the round trees: brightness in the green channel, drawn at quarter alpha
- sea and sky: brightness in the blue channel
- accents (mint, gold, pumpkins, the campfire's flames and embers, the character's skin and shirt): their real color, picked out by red and green both being lit. Lights only scale each channel (white, or the campfire's warm tint) and fog only adds blue, so a code color never lights two of those channels, and each terrain face takes one code so no triangle blends two.

The dither pass then paints each surface from its own ramp, dark to light:

- **Land:** `#140c26 #33204a #6e3a5e #b8606a #ee9d7a #ffd9a8`
- **Foliage (autumn):** `#1c1022 #4a1c2c #8a2e2e #c45a2a #e8933a #f5cf7a`, plum-brown in shadow through crimson, rust and amber to straw
- **Grass:** `#0e1324 #14293a #1c4243 #2f6149 #5f8a4f #a7b866`, deep teal in shadow to a sunlit yellow-green, kept clear of the mint that marks games
- **Fallen leaves:** `#0e1324 #1e2834 #3c4637 #76783f #ba9c4a #e6c97e`, the grass's shadows warming through olive to ochre: lighter and greener than the trees, so the ground under them reads as leaf-strewn grass rather than orange patches
- **Sea and sky:** `#07061a #100f30 #1c2452 #2f4a7c #5d84b4 #a9c4e0`
- **Accents:** mint `#86ecb6`, gold `#f2c66e`

### The dither

- **Pixel size:** 3 screen pixels, or 2 on screens narrower than 700px, where 3 turns the letters to mush.
- **Resolution:** the scene renders at 1/3 resolution (1/2 on phones), a pixel per world pixel, into a target that keeps its depth. The dither pass then blows it up onto a canvas at the screen's own resolution (up to 2x), each world pixel a block of screen pixels, so Jason can be drawn on it finer than the world (see The character). The low resolution is both the look and the main performance saving.
- **Dithering:** an 8×8 ordered (Bayer) dither between the two nearest steps of the surface's ramp. Accent pixels pass through unchanged.
- **Distance:** fog fades distant land into the sea ramp, so the horizon dissolves. It starts just past whatever the camera is looking at, so it never covers the word or the character.
- **Sky:** a dome that glows coral at the horizon and darkens to indigo overhead.
- **Color handling:** three.js color management is off end to end, so the palettes display exactly as written.

### The site around the world

The random color shuffle and its button go away, along with the theme presets. The UI keeps its existing `tint` and `shade` helpers, with `--hue` fixed:

- **`--hue: 248`, `--sat: 1`:** an indigo that matches the sea. Panels, borders and text tints all follow it, so the panels read as part of the dusk.
- **New `--accent-warm: #ffd9a8`,** the palette's peach. It's used for:
  - the primary button fill (Resume in the nav, Live demo, Play), replacing the lavender
  - the GOTTESMAN text
- **Mint** stays the "Playable!" color, now matching the world's accents.
- **Section heading badges** keep the pixel landmark sprites from `pixelArt.js`, recolored by the fixed hue.

### The character

- **Photos:** Jason's own photos, from a 53-second video of him (standing, walking across the frame, sitting, waving, throwing): each frame cut out (a 1024-pixel background-removal model, BiRefNet lite via rembg, run locally; the video never left his machine), with what it held onto from behind him (the stair railing his hand crosses) trimmed off, scaled by a moment in its own take where he stands upright (he's nearer the camera in some) so the feet sit on the bottom and the body is centered, graded for the dusk (half again as much color, more contrast, shadows toward plum, highlights toward peach) and outlined two pixels wide in dark plum. All 39 frames are one sheet, `jason.webp` (lossless, 203 KB); `heroSprite.js` says where each pose is.
- **In the world, at the screen's resolution:** a camera-facing sprite about 2.7 cells tall, drawn after the world straight onto the screen-resolution canvas, so he's finer than the world's pixels and clearly himself, flipped to face the way he walks. He's still in the world: wherever its depth is nearer the camera than he is, a world pixel at a time, it covers him (behind the house, a hill, a tree).
- **Never clipped by what's just behind him:** a camera-facing sprite seen from above leans back into whatever is just behind it, like the house's front wall along the path from About. So he's drawn two cells nearer the camera, along the line to his feet, and shrunk to match: he looks the same, but walls and slopes just behind him can't cut through him. His shadow stays on the ground.
- **Standing:** facing the camera, shifting a little (three frames, there and back, about half a second each). A moment after he stops (0.6 seconds), he waves for 1.4 seconds (three frames of the hand, there and back), and again every 10 seconds he stands there. With reduced motion he stands still.
- **Walking:** across the screen, a real step in profile, 8 frames from feet together to feet together, walked across the frame and re-centered (side on his legs look alike, so one step loops as well as two). Up the screen, away from the camera, two steps from behind, 12 frames (from behind, which foot is which shows), each scaled to the same height since he shrinks as he goes. There's no footage of him walking toward the camera with his feet in frame, so down the screen he walks side on. The view follows the way he's going (steering with keys, the way he's steered, since he slides along shores), keeping the one he had on diagonals. His steps go by with the ground he covers (a step every 2 cells), so his feet keep up at any pace, up to 5 steps a second.
- **Turning around** mid-walk, he faces the camera for a moment (0.12 seconds) rather than flipping.
- **Footsteps:** each time a foot lands, a few flecks kick up and settle (`footsteps.js`), in the ground's own code colors so they dither like it: sand on the beach, leaves where they've fallen, grass in the fields, stone, dust off the planks. Not with reduced motion.
- **Sitting:** on the ground, knees up, facing the fire, for the campfire, shifting a little (three frames, there and back).
- **Skipping a stone:** while the meter runs he leans, arm out, ready (four frames swaying there and back); throwing, he swings through (six frames, 0.07 seconds each) and the stone leaves his hand on the third; he holds the follow-through while it skips, 1.2 seconds in all.

### Konami code

There's no shuffle anymore, so the party becomes a 4.5-second hue rotation of the world canvas (a CSS `hue-rotate` filter sweeping 720°, two full turns, so it ends exactly back on Dusk). With reduced motion, it does nothing.

## How it's built

Plain three.js with a hand-written post pass. No React Three Fiber, no postprocessing library.

### Files

**New**

| File | Job |
| --- | --- |
| `src/world/WorldBackground.jsx` | The fixed full-page layer behind everything: the canvas, the landmark buttons and hover labels, and GOTTESMAN and the intro. Loads `runWorld.js` after first paint and reports `"ready"` or `"failed"` through `onStatusChange`. Takes `onOpenProject`, like the map does today, and `paused`, which stops rendering while a project popup or image is open so the world isn't drawing behind it. |
| `src/world/runWorld.js` | The renderer and the frame loop, loaded lazily with three.js. Reads scroll, moves the character and camera, places the landmark buttons and the text by writing their styles directly, and renders. |
| `src/world/scene.js` | Builds the scene from map data: terrain mesh (low-poly, faceted, height from distance to the coast, the sea floor shelving gently for two cells offshore so the shoreline is smooth, the beach one band wherever a face reaches above the water, with terraced ridges along the middle of each stroke away from the paths, their slopes colored like the fields around them and pale stone on top), sea plane (waves animated in its vertex shader, lighter shallows around every island from a distance texture), landmark meshes, stepping stones and bridge planks with gold lanterns, fields on the flat tops (green grass, with fallen leaves only under the round trees; beaches stay sand, the highest ridges pale stone; terrace slopes take the field's color, since rock-colored slopes read as stray dark specks at this size), dark green evergreens among round trees in crimson, orange and gold, tufts, mostly green, pumpkins in the fields and two by the house, leaves falling over the whole map (hidden with reduced motion), rocks on the beaches and in the shallows, sky dome, lights, fog. Everything scattered is hashed from cell positions, so it's the same on every load. No React. |
| `src/world/dither.js` | The low-res render target and the Dusk dither pass, as described in Look. |
| `src/world/dusk.js` | The Dusk ramps and accents, kept apart from three.js so the page can use them before the world loads. |
| `src/world/character.js` | Jason: picks his frame (walking, waving, sitting, throwing), draws it on his canvas where the camera sees him, plus his shadow in the world. |
| `src/world/heroSprite.js`, `jason.png` | Jason's photo sheet and where each pose is in it. |
| `src/world/leafPiles.js` | The leaf piles: the mounds, and the thrown leaves, whose flight is worked out in their vertex shader from when their pile burst. |
| `src/world/campfire.js` | The campfire: stones, logs, flames, embers, its light, and the seat's log. |
| `src/world/skipStones.js` | Skipping stones' rules, plain logic: the meter (`meterAt`), how many skips a throw makes (`skipsFor`), and the stone's flight (`flightPlan`). |
| `src/world/skipping.js` | Skipping stones in the world: the stone in flight, and the rings on the water. |
| `src/world/footsteps.js` | The flecks kicked up where Jason's feet land. |
| `src/world/journey.js` | Pure functions. `journeyAt(scrollY, viewportHeight, sections, pageHeight, walkSpan)`, where `sections` are each stop's `{ top, bottom }` and `walkSpan` is the least scrolling a walk takes, returns `{ leg, t, overview }`. Pose helpers give the overview pose fitted to the viewport, the follow pose for a character position, and a blend of the two. |
| `src/data/nameIslands.js` | The letter strokes for **JASON.**, wide and stacked, plus a deterministic `buildLand(layout)` that rasterizes them into a land grid with rough coastlines. The coastline noise is integer-hashed, so the land is identical on every load, in every browser and in tests. |
| `src/hooks/useKonamiParty.js` | Replaces `useSiteTheme.js`: true for 4.5 seconds after the Konami code. |

**Changed**
- **`src/data/worldMap.js`:** its layouts become the JASON layouts. `land` comes from `buildLand` instead of a text grid. Stages sit on the letters, and paths use corners as before, with bridges between letters. The path rules and their tests carry over unchanged.
  - **Wide:** one straight path along the bottom of the word, J to A to S to O to N to the "." islet.
  - **Stacked:** along the bottom of JA, down a bridge to the top of the O, across to the S, then along the bottom of SON.
  - **Paths:** a chain in that order: About, Experience, Projects, Contact, Ship Happens, Shadow Boxing, Resume.
- **`src/sections/Hero.jsx`:** becomes an empty first screen. It holds the hidden `<h1>` and the scroll cue; GOTTESMAN and the intro live in `WorldBackground`, since they follow the camera. It exports the intro (`HeroIntro`), which `WorldBackground` shows, and which the hero shows itself in the no-WebGL fallback.
- **`src/components/Section.jsx`:** adds a walking gap above each section after About (half the screen height on phones, where the walk happens as it scrolls by; 16% on desktop, so the walk happens between panels rather than under the last one's text), and panels take clicks back from the page.
- **`src/sections/Experience.jsx`, `Projects.jsx`, `Contact.jsx`, `src/components/ProjectCard.jsx`:** reworked for the column (timeline, tile grid, contact list; see "The page itself"). `useViewport` drops `isNarrowDesktop`.
- **`src/App.jsx`:** renders `WorldBackground` instead of `Background`, drops the shuffle, puts the sections in the left column on desktop, adds the last screen, and lets clicks through the empty page.
- **`index.css`:** `--hue` fixed, `--accent-warm` added, the 2D map's tile classes replaced by the landmark-label and party styles.
- **`mapGraph.js`, `pixelArt.js`, `PixelSprite.jsx`:** move from `components/worldmap/` to `src/world/`, minus the 2D map's SVG helpers. `mapGraph.js` gains `hopCells` for the walk.

**Removed**
- `src/components/Dither.jsx`
- `src/components/VariableProximity.jsx` and `VariableProximity.css`
- `src/components/Background.jsx`
- `src/components/ThemeDock.jsx`
- `src/theme.js` (the presets) and `src/hooks/useSiteTheme.js`
- From the 2D map: `MapTiles.jsx`, `WaterCanvas.jsx`, `Walker.jsx`, `WorldMap.jsx`, `useMapControls.js` and `mapStyle.js`
- **Dependencies:** `@react-three/fiber`, `@react-three/postprocessing`, `postprocessing`, and the unused `ogl`

**Kept**
- `mapGraph.js`: paths, routes and directions, needed by the walk and by Explore mode.
- `pixelArt.js`: the sprites, for the character texture and the section badges.
- `PixelSprite.jsx`: for the badges.

### Every frame

1. Read the scroll position and compute the journey state.
2. Move the character toward its point on the current leg, eased.
3. Work out the camera's goal by blending the follow pose and the overview pose by `overview`, and ease the camera toward it.
4. Show GOTTESMAN and the intro only when `overview` is 1 and the camera is within a small distance of the overview pose.
5. Position the landmark buttons by projecting each landmark to the screen, writing styles through refs so React doesn't re-render.
6. Render the scene to the low-res target, then the dither pass to the screen.

Rendering stops while the tab is hidden.

## Accessibility and motion

- The canvas is `aria-hidden`. The page content is unchanged HTML, and the landmark buttons have labels like "Experience, go to section."
- **Reduced motion:**
  - The camera jumps between poses instead of flying, and the character teleports between landmarks.
  - The sea is still, the falling leaves are hidden, leaf piles don't burst, the fire holds still without embers, a skipped stone's result shows without the flight, the polaroids don't sway, and the Konami party is off.
  - GOTTESMAN shows at the top and bottom as usual.
- **No WebGL:** if WebGL is unavailable, fails to start, or is lost, the background is a static dusk gradient. The hidden `<h1>` becomes visible as a normal heading with the intro under it, so the top of the page still says "Jason Gottesman".

## Performance

- **One WebGL canvas:** the world rendered at a third of the screen's resolution, then one full-screen pass up to the screen's (capped at 2x), and Jason's sprite.
- **Idle frame rate:** when nothing is moving (no scrolling, the camera and character settled, nothing being walked in Explore mode), the world redraws at 30 fps instead of every frame. The sea, the leaves and the fire keep moving.
- **Cheap per-frame work:** the falling leaves animate in their vertex shader from per-instance attributes, so they cost the CPU nothing; the sea sheet is 96 segments a side, about 2 units apart around the islands and stretching wider toward the fogged horizon (about a sixth of the vertices of an even grid); the scroll arrow and the circles' pulse are CSS animations of transform and opacity only, which run on the compositor.
- **Measured** on a CPU slowed 4x (headless Chrome, software WebGL, so pessimistic): main-thread time at idle went from 85% to 53% on desktop and 61% to 49% on phones; while scrolling, the slowest frames went from 33 ms to 17 ms.
- **Device pixel ratio:** capped at 1, as the current background already does.
- **Lighter load:** dropping React Three Fiber and the postprocessing library makes the 3D chunk 490 KB (126 KB gzipped), down from about 890 KB.
- **Lazy loading:** the world code loads after first paint, behind a flat sea-colored background it then fades in over.

## Testing

- **Unit tests:**
  - **`buildLand`:** deterministic (the same grid on every call).
  - **Both layouts:** every letter stroke produces land, every stage sits on land, and paths cross water only on bridges.
  - **The existing `worldMap.test.js` rules:** no two paths leave a stage the same way, paths only meet at stages, and every action target exists.
  - **`buildLand`:** each letter stays its own island, so the word reads.
  - **`journeyAt`:** overview 1 at the top and the bottom, each leg walked across its gap, arrival as the next section reaches the character, and walking back on scrolling up.
- **In Chrome, desktop and phone sizes:**
  - **Top of the page:** JASON reads from the top view, and GOTTESMAN shows only once the camera has settled.
  - **Scrolling:** the character walks each leg and back, and GOTTESMAN returns at the bottom.
  - **Clicking and keyboard:**
    - Clicking each landmark does the right thing: scroll, PDF or game.
    - Tab and Enter work on landmarks.
  - **Modes:**
    - Reduced motion
    - The no-WebGL fallback
    - The Konami party
  - **Phones:** the stacked layout, with no sideways scrolling.
  - **Health:** no console errors.

## Phase 2: Explore mode

Built on phase 1's world, character and camera.

- **Entry:** the Explore link in the nav (which shows once the first screen is behind you), or pressing E anywhere. The page panels and nav fade away (still laid out, so the world can read the sections), scrolling locks, and the camera drops behind the character from wherever the scroll had it. Focus moves to the Explore bar.
- **Moving:**
  - Arrow keys or WASD: up walks away from the camera, right to the screen's right. One axis at a time, so walking into the sea slides along the shore.
  - Clicking or tapping the ground walks there along the shortest route of walkable cells (`gridPath` in `mapGraph.js`), to the walkable cell nearest the spot. The spot is where the click meets the ground itself, or over water, the sea's surface, so tapping something on a raised ridge goes to it.
  - Walkable: land and every path cell (so the bridges), minus the cells landmarks and the campfire stand on (`walkable.js`). Trees and leaf piles don't block.
- **The Explore bar:** along the bottom. It says how to walk, or, within reach of something, what it is and a button: Visit, Open or Play for a landmark, Read for the secret, Sit at the campfire, Skip a stone on a beach. Enter does the same. Leave (or Escape) ends Explore mode and puts the page back where it was.
- **The campfire:** Sit walks the character to the log on the camera's side of the fire, where it sits facing the fire and the camera comes in closer, between them. The bar says "Sitting by the fire", with Get up; walking, clicking the ground or leaving gets up too.
- **Skipping stones:** from any beach (land with water right beside it) with at least six cells of open water out from it, clear of land and bridges (`beachHeading` in `walkable.js`). The throw goes out over the longest stretch of open water, leaning away from the camera so the stone stays in view. Landmarks, the secret and the campfire take the bar first when they're in reach.
  - **Throwing:** "Skip a stone" readies him where he stands, facing the throw, and the bar shows a meter: a marker sweeping across a track and back (0.9 seconds each way), the middle marked in mint, under "Throw when it's in the middle". Throw (or Enter) lets go.
  - **Skips:** dead center makes 14, give or take one; fewer the further off the middle, falling off fast; out near the ends, it sinks ("Plunk. No skips"). Each hop is shorter, lower and slower than the last, and each touch leaves a ring on the water, riding the waves. A stone that reaches land (or a bridge) comes to rest there: "all the way across!"
  - **The bar:** counts the skips as they happen, then shows the result with the best throw yet ("New best!" in mint when it is), and Again. The best is kept in the browser (`localStorage`, if it's available). Walking off ends it.
  - **The camera** looks out after the stone while it's in the air.
  - **Reduced motion:** no flight; the result shows straight away.
- **Landmarks:** taking a landmark's prompt leaves Explore and does what clicking it does: a section scrolls into view, Resume opens the PDF, a game opens its popup.
- **The secret:** a bottle washed up on the far tip of the J's top bar (the land cell on the About stage's island farthest from it), with a gold glint bobbing over it. Its note thanks the visitor for exploring, signed by Jason, with a "Say hi" button to Contact. The note's text is data (`worldMap.secret`).

## Not in this version

- A new display font to replace Playfair.
- "World 2," where Projects becomes its own map.
- Sound.
