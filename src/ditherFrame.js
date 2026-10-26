/**
 * Solid page surfaces (the section panels, the nav) whose edges dissolve into
 * the world with the same ordered dither the world is drawn with: an 8x8
 * Bayer matrix (as in world/dither.js, which can't be imported here without
 * pulling three.js into the page bundle), in pixels the size of the world's
 * (3 px, 2 on phones).
 */
import { RULE } from "./palette";

// Whether the edges dissolve (true), or stay plain: a thin rule around the
// solid surface (false). The dithered edge takes room of its own, so the
// surfaces pad their content by this too (Section.jsx, Nav.jsx,
// Projects.jsx).
export const DITHERED = false;

const BAYER_8 = [
  0, 48, 12, 60, 3, 51, 15, 63, 32, 16, 44, 28, 35, 19, 47, 31, 8, 56, 4, 52, 11, 59, 7, 55, 40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61, 34, 18, 46, 30, 33, 17, 45, 29, 10, 58, 6, 54, 9, 57, 5, 53, 42, 26, 38, 22, 41, 25, 37, 21,
];
const PERIOD = 8;
// The surface color, shade(50, 10) at the site's hue. It's written out
// because an image can't read CSS variables.
const SURFACE = "#100d26";

// A nine-slice frame for border-image: an `edge`-wide dithered fade on every
// side, square at the corners, around a solid middle. The edge slices are one
// Bayer period long, so they tile seamlessly.
function frameImage(edge) {
  const size = edge * 2 + PERIOD;
  let pixels = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const depth = Math.min(x, y, size - 1 - x, size - 1 - y);
      if (depth >= edge) continue;
      const threshold = (BAYER_8[(y % PERIOD) * PERIOD + (x % PERIOD)] + 0.5) / 64;
      if ((depth + 0.5) / edge > threshold) pixels += `M${x} ${y}h1v1h-1z`;
    }
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' shape-rendering='crispEdges' fill='${SURFACE}'>` +
    `<path d='${pixels}'/><rect x='${edge}' y='${edge}' width='${PERIOD}' height='${PERIOD}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const images = new Map();

/**
 * Style for a solid surface with a dithered edge `edge` dither pixels deep,
 * each `pixel` CSS pixels. It's the element's whole background (border-image
 * fills the middle too), and its border is the fade, so pad the content
 * inside it. Plain (DITHERED off), it's the surface color inside a 1px rule.
 */
export function ditherFrame(pixel, edge) {
  if (!DITHERED) return { border: `1px solid ${RULE}`, backgroundColor: SURFACE };
  if (!images.has(edge)) images.set(edge, frameImage(edge));
  return {
    border: `${edge * pixel}px solid transparent`,
    borderImage: `${images.get(edge)} ${edge} fill / ${edge * pixel}px repeat`,
  };
}
