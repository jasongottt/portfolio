import sheetUrl from "./jason.webp";

/**
 * Jason, the character the world walks around (character.js): his own
 * photos, cut out of a video of him and graded for the dusk (more color,
 * shadows toward plum and highlights toward peach), with a dark outline, all
 * in one sheet, jason.webp (lossless).
 *
 * The sheet is cells of `cell` pixels, `columns` across, `cells` in all. In
 * each, the feet are on the bottom row and the body is centered, and the
 * standing figure is `figure` pixels tall. Walking frames face right; the
 * rest face the camera.
 */
export const HERO_SHEET = { url: sheetUrl, cell: [104, 144], columns: 6, cells: 39, figure: 112 };

const run = (from, count) => Array.from({ length: count }, (_, i) => from + i);

/** Each pose's cells in the sheet. */
export const HERO_FRAMES = {
  // Standing, shifting a little; played there and back. The middle one is
  // standing still.
  idle: run(0, 3),
  // A step side on, from feet together to feet together, looping (his legs
  // look alike from the side, so one step loops as well as two).
  walk: run(3, 8),
  // Two steps walking away from the camera (from behind, which foot is
  // which shows). There's no walk toward the camera: he walks side on.
  walkAway: run(11, 12),
  // The hand from bent over to raised; played there and back.
  wave: run(23, 3),
  // On the ground, legs out to the right, shifting a little.
  sit: run(26, 3),
  // Skipping a stone: leaning, arm out, ready (played there and back while
  // he aims), then the swing through to the follow-through.
  aim: run(29, 4),
  throw: run(33, 6),
};

/** How many steps each walk's frames cover. */
export const WALK_STEPS = { walk: 1, walkAway: 2 };

/** Which throw frame the stone leaves his hand on. */
export const RELEASE_FRAME = 2;
