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
 * The points a path passes through, starting from `fromId`: that stage, any
 * bends, then the stage at the other end.
 */
export function pathPoints(layout, path, fromId) {
  const bends = layout.bends[pathKey(path)] ?? [];
  const points = [layout.stages[path[0]], ...bends, layout.stages[path[1]]];
  return fromId === path[0] ? points : points.reverse();
}

// A path's curve is traced in this many pieces between each pair of its
// points, then evenly spaced.
const TRACE = 48;

// One stretch of a centripetal Catmull-Rom curve, from b to c (a and d steer
// it), at `t` (0 to 1). Centripetal, so it never loops or overshoots much.
function curveAt(a, b, c, d, t) {
  const knot = (p, q) => Math.max(1e-6, Math.hypot(q[0] - p[0], q[1] - p[1]) ** 0.5);
  const t1 = knot(a, b);
  const t2 = t1 + knot(b, c);
  const t3 = t2 + knot(c, d);
  const u = t1 + (t2 - t1) * t;
  const mix = (p, q, from, to) => [
    (p[0] * (to - u) + q[0] * (u - from)) / (to - from),
    (p[1] * (to - u) + q[1] * (u - from)) / (to - from),
  ];
  const a1 = mix(a, b, 0, t1);
  const a2 = mix(b, c, t1, t2);
  const a3 = mix(c, d, t2, t3);
  return mix(mix(a1, a2, 0, t2), mix(a2, a3, t1, t3), t1, t2);
}

/**
 * A path's line from `fromId`: a smooth curve through its stages and bends,
 * as [col, row] points (between cells, mostly) evenly spaced about `spacing`
 * cells apart, both ends included. A path with no bends is straight.
 */
export function pathLine(layout, path, fromId, spacing) {
  const points = pathPoints(layout, path, fromId);
  // Mirrored past each end, so the curve leaves and arrives heading at its
  // first and last bends.
  const ends = [
    [2 * points[0][0] - points[1][0], 2 * points[0][1] - points[1][1]],
    [2 * points.at(-1)[0] - points.at(-2)[0], 2 * points.at(-1)[1] - points.at(-2)[1]],
  ];
  const steered = [ends[0], ...points, ends[1]];
  const traced = [points[0]];
  for (let i = 1; i < steered.length - 2; i++) {
    for (let k = 1; k <= TRACE; k++) traced.push(curveAt(steered[i - 1], steered[i], steered[i + 1], steered[i + 2], k / TRACE));
  }
  // Evenly spaced along it.
  const along = [0];
  for (let i = 1; i < traced.length; i++) {
    along.push(along[i - 1] + Math.hypot(traced[i][0] - traced[i - 1][0], traced[i][1] - traced[i - 1][1]));
  }
  const length = along.at(-1);
  const pieces = Math.max(1, Math.round(length / spacing));
  const line = [];
  for (let n = 0, i = 1; n <= pieces; n++) {
    const at = (length * n) / pieces;
    while (i < traced.length - 1 && along[i] < at) i++;
    const t = (at - along[i - 1]) / Math.max(1e-9, along[i] - along[i - 1]);
    const [p, q] = [traced[i - 1], traced[i]];
    line.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
  }
  return line;
}

/** Direction of a straight step between two grid points, or null if it isn't one. */
export function directionBetween([c0, r0], [c1, r1]) {
  if (c0 === c1 && r1 < r0) return "up";
  if (c0 === c1 && r1 > r0) return "down";
  if (r0 === r1 && c1 < c0) return "left";
  if (r0 === r1 && c1 > c0) return "right";
  return null;
}

/** A path's direction at a stage is the way its first step leaves it. */
export function pathDirection(layout, path, fromId) {
  const cells = pathCells(layout, path);
  const [first, second] = fromId === path[0] ? cells : cells.reverse();
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

// How finely a path's line is followed to find the cells it crosses.
const FINE = 0.05;

/**
 * Every cell a path's line passes through, in order, both ends included, in
 * four-way steps: where the line cuts a corner, the neighbor it passes
 * nearer.
 */
export function pathCells(layout, path) {
  const cells = [];
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  for (const [x, y] of pathLine(layout, path, path[0], FINE)) {
    const cell = [Math.round(x), Math.round(y)];
    const last = cells.at(-1);
    if (same(cell, last)) continue;
    // Back into the cell before (the line grazing an edge): undo the step.
    if (same(cell, cells.at(-2))) {
      cells.pop();
      continue;
    }
    if (last && last[0] !== cell[0] && last[1] !== cell[1]) {
      const across = [cell[0], last[1]];
      const down = [last[0], cell[1]];
      const gap = ([c, r]) => (c - x) ** 2 + (r - y) ** 2;
      cells.push(gap(across) < gap(down) ? across : down);
    }
    cells.push(cell);
  }
  return cells;
}

/** The line of the walk between two neighboring stages, from `fromId` (pathLine). */
export function hopLine(map, layout, fromId, toId, spacing) {
  return pathLine(layout, findPath(map, fromId, toId), fromId, spacing);
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
