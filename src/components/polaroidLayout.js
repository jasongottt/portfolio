/**
 * Where the About panel's polaroids go (Polaroids.jsx), sized to the side of
 * the panel they're tucked behind, so the stack always fits it: down the
 * right edge on desktop, from top to bottom; across the bottom edge on
 * phones. Plain math, in px.
 */

// A print's paper, as shares of its width: the margin around the photo and
// the deeper one under it. The photo is 3:4.
const MARGIN_SIDE = 0.056;
const MARGIN_UNDER = 0.21;

// Down the right edge: the gap left above the top print and below the
// bottom one, how much of each print the next overlaps, the share of a print
// that pokes out past the edge, and the widths a print stays between.
const GAP = 16;
const OVERLAP = 0.1;
const PEEK = 0.52;
const WIDE = [96, 170];

// Across the bottom edge: a print's width as a share of the panel's, between
// these widths; the spacing, as a share of a print's width; and how far each
// is tucked under the edge, as shares of its width.
const ACROSS = 0.26;
const WIDE_PHONE = [84, 132];
const SPACING = 0.89;
const TUCKS = [0.33, 0.22, 0.37];

const clamp = (value, [low, high]) => Math.min(high, Math.max(low, value));

/** A print's height for its width. */
export const printHeight = (width) => width * (MARGIN_SIDE + (1 - 2 * MARGIN_SIDE) * (4 / 3) + MARGIN_UNDER);

/** A print's paper margins (CSS padding) for its width. */
export const printPadding = (width) => `${MARGIN_SIDE * width}px ${MARGIN_SIDE * width}px ${MARGIN_UNDER * width}px`;

/**
 * The prints, { left, top, width }, for a panel `width` x `height` with
 * `count` of them along its "right" or "bottom" edge.
 */
export function polaroidLayout(edge, { width, height }, count) {
  if (edge === "right") {
    const span = height - 2 * GAP;
    const print = clamp(span / (count - (count - 1) * OVERLAP) / printHeight(1), WIDE);
    const step = count > 1 ? (span - printHeight(print)) / (count - 1) : 0;
    return Array.from({ length: count }, (_, i) => ({
      left: width - PEEK * print,
      top: GAP + i * step,
      width: print,
    }));
  }
  const print = clamp(width * ACROSS, WIDE_PHONE);
  return Array.from({ length: count }, (_, i) => ({
    left: width / 2 + (i - (count - 1) / 2) * print * SPACING - print / 2,
    top: height - TUCKS[i % TUCKS.length] * print,
    width: print,
  }));
}
