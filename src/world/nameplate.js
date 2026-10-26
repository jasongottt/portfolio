import { DOT_RADIUS, GLYPHS, NAME_LAYOUTS, RADIUS } from "../data/nameIslands";
import { worldMap } from "../data/worldMap";
import { FOV, FRAME_Y, overviewPose } from "./journey";
import { parseLand } from "./mapGraph";

/**
 * Where the island letters sit on screen in the overview, worked out with
 * the same camera math as the 3D world but no three.js, so the page can
 * cover them with real text before the world has loaded.
 */

/** Which layout of worldMap.js a viewport gets. */
export const layoutFor = (width, height) => (width < height ? "tall" : "wide");

const toWorld = (cols, rows, [col, row]) => [col - cols / 2 + 0.5, 0, row - rows / 2 + 0.5];

/** The world-space extent of a layout's land: { minX, maxX, minZ, maxZ }. */
export function landBounds(layout) {
  const land = parseLand(layout.land);
  const bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (let row = 0; row < land.rows; row++) {
    for (let col = 0; col < land.cols; col++) {
      if (!land.isLand(col, row)) continue;
      const [x, , z] = toWorld(land.cols, land.rows, [col, row]);
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minZ = Math.min(bounds.minZ, z);
      bounds.maxZ = Math.max(bounds.maxZ, z);
    }
  }
  return bounds;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => {
  const length = Math.hypot(...a);
  return [a[0] / length, a[1] / length, a[2] / length];
};

/**
 * A world point's screen position, in CSS pixels, as a camera at `pose`
 * draws it, with its look target at FRAME_Y down the screen (runWorld.js).
 */
export function projectPoint(pose, width, height, point) {
  const forward = unit(sub(pose.target, pose.position));
  const right = unit(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  const offset = sub(point, pose.position);
  const depth = dot(offset, forward);
  const tan = Math.tan((FOV * Math.PI) / 360);
  const ndcX = dot(offset, right) / (depth * tan * (width / height));
  const ndcY = dot(offset, up) / (depth * tan);
  return [((ndcX + 1) / 2) * width, height * (FRAME_Y - ndcY / 2)];
}

// Points per ellipse (the O) when drawn as a path.
const ELLIPSE_POINTS = 48;

/**
 * The name drawn the way the islands are made: every letter's strokes
 * (nameIslands.js), RADIUS thick on each side, projected to the screen as
 * the overview shows them. One entry per letter, the full stop last:
 * { char, x, y, paths, strokeWidth }, where (x, y) is the letter's center,
 * `paths` are SVG path data in CSS pixels, and strokeWidth is in pixels.
 * Drawn with round caps and joins, they cover the island letters, all but
 * the wobble of the coastlines.
 */
export function nameplate(width, height) {
  const name = layoutFor(width, height);
  const { letters, dot: stop } = NAME_LAYOUTS[name];
  const layout = worldMap.layouts[name];
  const [cols, rows] = layout.size;
  const pose = overviewPose(landBounds(layout), width / height, FOV);
  const project = (col, row) => projectPoint(pose, width, height, toWorld(cols, rows, [col, row]));
  const path = (points, closed) =>
    points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + (closed ? "Z" : "");
  // Pixels per cell across the screen at a point, for stroke widths.
  const scaleAt = (col, row) => project(col + 0.5, row)[0] - project(col - 0.5, row)[0];

  const drawn = letters.map(([char, left, top]) => {
    const glyph = GLYPHS[char];
    const paths = (glyph.strokes ?? []).map((stroke) => path(stroke.map(([x, y]) => project(left + x, top + y))));
    if (glyph.ellipse) {
      const [cx, cy, rx, ry] = glyph.ellipse;
      const ring = Array.from({ length: ELLIPSE_POINTS }, (_, i) => {
        const angle = (i / ELLIPSE_POINTS) * Math.PI * 2;
        return project(left + cx + rx * Math.cos(angle), top + cy + ry * Math.sin(angle));
      });
      paths.push(path(ring, true));
    }
    const [x, y] = project(left + 8, top + 13);
    return { char, x, y, paths, strokeWidth: 2 * RADIUS * scaleAt(left + 8, top + 13) };
  });

  // The full stop: a zero-length stroke, which round caps draw as a disc.
  const [x, y] = project(...stop);
  const dot = { char: ".", x, y, paths: [`M${x.toFixed(1)} ${y.toFixed(1)}h0`], strokeWidth: 2 * (RADIUS + DOT_RADIUS) * scaleAt(...stop) };
  return [...drawn, dot];
}
