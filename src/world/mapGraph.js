/**
 * Plain map logic, no React or three.js: shared by the world and its tests.
 * Positions are grid cells, [col, row].
 */

const STEPS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Reads a land grid drawn as text: '#' is land, anything else is water. */
export function parseLand(text) {
  const lines = text.trim().split("\n").map((line) => line.trim());
  return {
    cols: lines[0]?.length ?? 0,
    rows: lines.length,
    lines,
    isLand: (col, row) => lines[row]?.[col] === "#",
  };
}

export const pathKey = ([from, to]) => `${from}>${to}`;

const otherEnd = (path, id) => (path[0] === id ? path[1] : path[0]);

export const pathsAt = (map, id) => map.paths.filter((path) => path.includes(id));

export const findPath = (map, a, b) =>
  map.paths.find((path) => path.includes(a) && path.includes(b) && a !== b);

/**
 * The grid points a path visits, starting from `fromId`: that stage, any
 * corners, then the stage at the other end.
 */
export function pathPoints(layout, path, fromId) {
  const corners = layout.corners[pathKey(path)] ?? [];
  const points = [layout.stages[path[0]], ...corners, layout.stages[path[1]]];
  return fromId === path[0] ? points : points.reverse();
}

/** Direction of a straight step between two grid points, or null if it isn't one. */
export function directionBetween([c0, r0], [c1, r1]) {
  if (c0 === c1 && r1 < r0) return "up";
  if (c0 === c1 && r1 > r0) return "down";
  if (r0 === r1 && c1 < c0) return "left";
  if (r0 === r1 && c1 > c0) return "right";
  return null;
}

/** A path's direction at a stage is the way its first segment leaves it. */
export function pathDirection(layout, path, fromId) {
  const [first, second] = pathPoints(layout, path, fromId);
  return directionBetween(first, second);
}

/** The stage reached by leaving `id` in `direction`, or null if no path goes that way. */
export function neighborInDirection(map, layout, id, direction) {
  const path = pathsAt(map, id).find((p) => pathDirection(layout, p, id) === direction);
  return path ? otherEnd(path, id) : null;
}

/**
 * Stage ids from `fromId` to `toId`, both included, with the fewest stops.
 * Null when the two aren't connected.
 */
export function route(map, fromId, toId) {
  const cameFrom = new Map([[fromId, null]]);
  const queue = [fromId];
  while (queue.length && !cameFrom.has(toId)) {
    const id = queue.shift();
    for (const path of pathsAt(map, id)) {
      const next = otherEnd(path, id);
      if (cameFrom.has(next)) continue;
      cameFrom.set(next, id);
      queue.push(next);
    }
  }
  if (!cameFrom.has(toId)) return null;
  const ids = [];
  for (let id = toId; id !== null; id = cameFrom.get(id)) ids.unshift(id);
  return ids;
}

/**
 * Four-way steps from each cell inside a mask to the nearest cell outside
 * it (0 for cells outside). Returns a lookup, (col, row) => steps.
 */
export function distanceField(inside, cols, rows) {
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const queue = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (inside(col, row)) dist[row][col] = Infinity;
      else queue.push([col, row]);
    }
  }
  for (let i = 0; i < queue.length; i++) {
    const [col, row] = queue[i];
    for (const [dc, dr] of Object.values(STEPS)) {
      const c = col + dc;
      const r = row + dr;
      if (dist[r]?.[c] > dist[row][col] + 1) {
        dist[r][c] = dist[row][col] + 1;
        queue.push([c, r]);
      }
    }
  }
  return (col, row) => dist[row]?.[col] ?? 0;
}

/** Every cell a path passes through, in order, both ends included. */
export function pathCells(layout, path) {
  const points = pathPoints(layout, path, path[0]);
  const cells = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [c0, r0] = points[i - 1];
    const [c1, r1] = points[i];
    const direction = directionBetween(points[i - 1], points[i]);
    if (!direction) throw new Error(`Path ${pathKey(path)} has a diagonal or empty segment at [${c0}, ${r0}]`);
    const [dc, dr] = STEPS[direction];
    for (let c = c0, r = r0; c !== c1 || r !== r1; ) {
      c += dc;
      r += dr;
      cells.push([c, r]);
    }
  }
  return cells;
}

/** The cells of the walk between two neighboring stages, from `fromId`. */
export function hopCells(map, layout, fromId, toId) {
  const path = findPath(map, fromId, toId);
  const cells = pathCells(layout, path);
  return path[0] === fromId ? cells : cells.reverse();
}

const keyOf = ([col, row]) => `${col},${row}`;

/**
 * The shortest four-way route of open cells from `from` to `to`, both
 * included, or null if there isn't one.
 */
export function gridPath(isOpen, from, to) {
  if (!isOpen(...from) || !isOpen(...to)) return null;
  const cameFrom = new Map([[keyOf(from), null]]);
  const queue = [from];
  for (let i = 0; i < queue.length && !cameFrom.has(keyOf(to)); i++) {
    const [col, row] = queue[i];
    for (const [dc, dr] of Object.values(STEPS)) {
      const next = [col + dc, row + dr];
      if (cameFrom.has(keyOf(next)) || !isOpen(...next)) continue;
      cameFrom.set(keyOf(next), [col, row]);
      queue.push(next);
    }
  }
  if (!cameFrom.has(keyOf(to))) return null;
  const cells = [];
  for (let cell = to; cell; cell = cameFrom.get(keyOf(cell))) cells.unshift(cell);
  return cells;
}

/** The open cell nearest `cell` (it, if it's open), or null if none is. */
export function nearestOpen(isOpen, cols, rows, [col, row]) {
  let best = null;
  let bestDistance = Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isOpen(c, r)) continue;
      const distance = (c - col) ** 2 + (r - row) ** 2;
      if (distance < bestDistance) {
        best = [c, r];
        bestDistance = distance;
      }
    }
  }
  return best;
}
