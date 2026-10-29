import sheetUrl from "./jason.webp";

/**
 * Jason, the character the world walks around (character.js): his own
 * photos, cut out of videos of him and graded for the dusk (more color,
 * shadows toward plum and highlights toward peach), with a dark outline, all
 * in one sheet, jason.webp (its edges exact).
 *
 * The sheet is cells of `cell` pixels, `columns` across, `cells` in all. In
 * each, the ground is the bottom row and the body is centered, and the
 * standing figure is `figure` pixels tall. Walks and runs face right unless
 * they say otherwise; the rest face the camera.
 */
export const HERO_SHEET = { url: sheetUrl, cell: [128, 144], columns: 12, cells: 196, figure: 112 };

const run = (from, count) => Array.from({ length: count }, (_, i) => from + i);

/** Each pose's cells in the sheet. */
export const HERO_FRAMES = {
  // Standing, shifting a little; played there and back. The middle one
  // is standing still.
  idle: run(0, 3),
  // Two steps side on, facing right, and the same facing left: his
  // own walk each way, not one turned around.
  walk: run(3, 12),
  walkLeft: run(15, 12),
  // Two steps toward the camera, and two away from it.
  walkToward: run(27, 12),
  walkAway: run(39, 12),
  // Running: two strides side on (facing right), toward the camera and
  // away from it.
  sprint: run(51, 10),
  sprintToward: run(61, 8),
  sprintAway: run(69, 8),
  // The hand from bent over to raised; played there and back.
  wave: run(77, 3),
  // Things he does standing about now and then: the arm wiggle (arms
  // out, a wave rolling through them), the disco point, hands on hips,
  // looking around.
  wiggle: run(80, 19),
  disco: run(99, 20),
  hips: run(119, 13),
  look: run(132, 10),
  // Catching his breath: bending down, hands on his knees breathing
  // (there and back), then wiping his brow and straightening up.
  stoop: run(142, 3),
  breathe: run(145, 4),
  wipe: run(149, 6),
  // Poked: a hand to his face, hands up over his head (then held
  // there), ducking down to cower on the ground (then held), and getting
  // back up.
  worried: run(155, 5),
  coverUp: run(160, 3),
  cover: run(163, 4),
  duck: run(167, 5),
  cower: run(172, 5),
  rise: run(177, 6),
  // On the ground, legs out to the right, shifting a little.
  sit: run(183, 3),
  // Skipping a stone: leaning, arm out, ready (played there and back
  // while he aims), then the swing through to the follow-through.
  aim: run(186, 4),
  throw: run(190, 6),
};

/** How many steps each walk's (and run's) frames cover. */
export const WALK_STEPS = { walk: 2, walkLeft: 2, walkToward: 2, walkAway: 2, sprint: 2, sprintToward: 2, sprintAway: 2 };

/** Which throw frame the stone leaves his hand on. */
export const RELEASE_FRAME = 2;
