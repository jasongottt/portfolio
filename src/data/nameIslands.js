/**
 * The islands that spell JASON. at the top of the page.
 *
 * Each letter is a set of strokes (polylines) or an ellipse in a 16 x 26
 * box, in grid cells. A layout places the letters on a grid, and buildLand
 * turns it into land: every cell within RADIUS of a stroke, give or take a
 * seeded wobble so the coastlines look natural. The noise is integer-hashed,
 * so the land is identical on every load, in every browser and in tests.
 */

export const GLYPHS = {
  J: {
    strokes: [
      [[5, 1], [15, 1]],
      [[12, 1], [12, 18], [10, 23], [6, 24.5], [2.5, 21.5]],
    ],
  },
  A: {
    strokes: [
      [[1, 25], [8, 1], [15, 25]],
      [[4, 16.5], [12, 16.5]],
    ],
  },
  S: {
    strokes: [
      [[15, 3.5], [11, 1], [5, 1.5], [1.5, 5.5], [3, 10.5], [8, 13], [13, 15.5], [15, 20], [12.5, 24], [6, 25], [1, 22]],
    ],
  },
  O: { ellipse: [8, 13, 6.6, 11.6] },
  N: { strokes: [[[2, 25], [2, 1], [14, 25], [14, 1]]] },
};

export const RADIUS = 2.5;
const WOBBLE = 1.3;
// The full stop is a small round islet.
export const DOT_RADIUS = 0.6;

/**
 * Where the letters go, per screen shape. `letters` are [glyph, col, row] for
 * the top-left of each letter's box; `dot` is the center of the full stop.
 */
export const NAME_LAYOUTS = {
  wide: {
    size: [116, 40],
    letters: [["J", 4, 7], ["A", 25, 7], ["S", 46, 7], ["O", 67, 7], ["N", 88, 7]],
    dot: [108, 30],
  },
  // Phones in portrait: JA over SON.
  tall: {
    size: [72, 68],
    letters: [["J", 17, 4], ["A", 38, 4], ["S", 4, 37], ["O", 25, 37], ["N", 46, 37]],
    dot: [66, 60],
  },
};

// A 32-bit integer hash of a cell, in [0, 1).
function hash(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Smooth value noise on a 4-cell lattice.
function noise(col, row) {
  const gx = col / 4;
  const gy = row / 4;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const smooth = (t) => t * t * (3 - 2 * t);
  const tx = smooth(gx - x0);
  const ty = smooth(gy - y0);
  const top = hash(x0, y0) * (1 - tx) + hash(x0 + 1, y0) * tx;
  const bottom = hash(x0, y0 + 1) * (1 - tx) + hash(x0 + 1, y0 + 1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function segmentDistance(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const ex = px - ax - t * dx;
  const ey = py - ay - t * dy;
  return Math.sqrt(ex * ex + ey * ey);
}

// Distance from a point to a glyph's outline, in its own box coordinates.
function glyphDistance(glyph, x, y) {
  let distance = Infinity;
  if (glyph.ellipse) {
    const [cx, cy, rx, ry] = glyph.ellipse;
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    distance = Math.abs(Math.sqrt(nx * nx + ny * ny) - 1) * Math.min(rx, ry);
  }
  for (const stroke of glyph.strokes ?? []) {
    for (let i = 1; i < stroke.length; i++) {
      distance = Math.min(distance, segmentDistance(x, y, stroke[i - 1], stroke[i]));
    }
  }
  return distance;
}

/** The layout's land as a text grid, '#' for land and '.' for water. */
export function buildLand({ size: [cols, rows], letters, dot }) {
  const lines = [];
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      let distance = Infinity;
      for (const [glyph, left, top] of letters) {
        distance = Math.min(distance, glyphDistance(GLYPHS[glyph], col - left, row - top));
      }
      const dx = col - dot[0];
      const dy = row - dot[1];
      distance = Math.min(distance, Math.sqrt(dx * dx + dy * dy) - DOT_RADIUS);
      const wobble = (noise(col, row) - 0.5) * WOBBLE;
      line += distance < RADIUS + wobble ? "#" : ".";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

/** Points along every stroke of a layout, in grid cells, for tests. */
export function strokeSamples({ letters }) {
  const samples = [];
  for (const [name, left, top] of letters) {
    const glyph = GLYPHS[name];
    for (const stroke of glyph.strokes ?? []) {
      for (const [x, y] of stroke) samples.push([name, Math.round(left + x), Math.round(top + y)]);
    }
    if (glyph.ellipse) {
      const [cx, cy, rx, ry] = glyph.ellipse;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        samples.push([name, Math.round(left + cx + rx * Math.cos(angle)), Math.round(top + cy + ry * Math.sin(angle))]);
      }
    }
  }
  return samples;
}
