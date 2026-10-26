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
 * not the cells landmarks stand on.
 */
export function walkableGrid(map, layout) {
  const land = parseLand(layout.land);
  const key = (col, row) => `${col},${row}`;
  const bridges = new Set(map.paths.flatMap((path) => pathCells(layout, path)).map((cell) => key(...cell)));
  const blocked = new Set(Object.values(layout.stages).map((cell) => key(...landmarkCell(land, cell))));
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
