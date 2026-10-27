import { groundAim } from "./journey";
import { parseLand, pathCells } from "./mapGraph";

/**
 * Where things stand in a layout of worldMap.js, and where Explore mode can
 * walk. Plain logic, no three.js: shared by scene.js and the tests. Cells
 * are [col, row].
 */

// Landmarks stand beside their stage, back and to the right, so the
// character stands next to them rather than in front of them. Where that
// spot is water, they try the left, then straight behind.
export const LANDMARK_SPOTS = [[2, -1], [-2, -1], [0, -1.6]];

/** The offset, [dx, dz], from a stage's cell to its landmark. */
export function landmarkOffset(land, [col, row]) {
  return (
    LANDMARK_SPOTS.find(([dx, dz]) => land.isLand(Math.round(col + dx), Math.round(row + dz))) ??
    LANDMARK_SPOTS.at(-1)
  );
}

/** The cell a stage's landmark stands on. */
export function landmarkCell(land, cell) {
  const [dx, dz] = landmarkOffset(land, cell);
  return [Math.round(cell[0] + dx), Math.round(cell[1] + dz)];
}

/**
 * The cells Explore mode can walk: land and bridges (every path cell), but
 * not the cells landmarks or the campfire stand on.
 */
export function walkableGrid(map, layout) {
  const land = parseLand(layout.land);
  const key = (col, row) => `${col},${row}`;
  const bridges = new Set(map.paths.flatMap((path) => pathCells(layout, path)).map((cell) => key(...cell)));
  const blocked = new Set(Object.values(layout.stages).map((cell) => key(...landmarkCell(land, cell))));
  if (layout.campfire) blocked.add(key(...layout.campfire));
  return {
    cols: land.cols,
    rows: land.rows,
    isOpen: (col, row) =>
      col >= 0 &&
      row >= 0 &&
      col < land.cols &&
      row < land.rows &&
      !blocked.has(key(col, row)) &&
      (land.isLand(col, row) || bridges.has(key(col, row))),
  };
}

/**
 * Where the secret washes up: the land cell on `map.secret.island`'s island
 * farthest from that stage, so only someone exploring finds it.
 */
export function secretCell(map, layout) {
  const land = parseLand(layout.land);
  const start = layout.stages[map.secret.island];
  const seen = new Set([start.join(",")]);
  const queue = [start];
  let best = start;
  let bestDistance = 0;
  for (let i = 0; i < queue.length; i++) {
    const [col, row] = queue[i];
    const distance = (col - start[0]) ** 2 + (row - start[1]) ** 2;
    if (distance > bestDistance) {
      best = [col, row];
      bestDistance = distance;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [col + dc, row + dr];
      if (seen.has(next.join(",")) || !land.isLand(...next)) continue;
      seen.add(next.join(","));
      queue.push(next);
    }
  }
  return best;
}

/**
 * Where the campfire's seat is, as a [col, row] that may fall between cells:
 * a cell to the fire's left on screen, so whoever sits there faces the fire
 * across the screen, both in view.
 */
export function campfireSeat([col, row]) {
  const [rightX, rightZ] = groundAim.right;
  return [col - rightX, row - rightZ];
}

// Skipping stones from a beach: the headings tried, how far out to look, and
// how much open water a throw needs.
const HEADINGS = 16;
const LOOK = 14;
const OPEN_WATER = 6;

/**
 * Which way to skip a stone from the land cell [col, row], as a unit [x, z],
 * or null if it isn't a beach to skip from. A beach is land with water right
 * beside it, and a throw needs OPEN_WATER cells clear of anything `solid`
 * (land, bridges). Of the clear headings it takes the longest run of water,
 * leaning toward `forward` (away from the camera, journey.js) so the stone
 * stays in view.
 */
export function beachHeading(land, solid, [col, row], forward) {
  if (!land.isLand(col, row)) return null;
  if ([[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dc, dr]) => land.isLand(col + dc, row + dr))) return null;
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < HEADINGS; i++) {
    const angle = (i / HEADINGS) * Math.PI * 2;
    const heading = [Math.cos(angle), Math.sin(angle)];
    let run = 0;
    for (let reach = 1; reach <= LOOK; reach += 0.5) {
      if (solid(Math.round(col + heading[0] * reach), Math.round(row + heading[1] * reach))) break;
      run = reach;
    }
    if (run < OPEN_WATER) continue;
    const score = run + 3 * (heading[0] * forward[0] + heading[1] * forward[1]);
    if (score > bestScore) {
      best = heading;
      bestScore = score;
    }
  }
  return best;
}
