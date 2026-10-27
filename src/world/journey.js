/**
 * Where the character and camera should be for a scroll position. Plain
 * math, no three.js; points are [x, y, z] in world units.
 */

// How far down the screen the camera's subject sits, as a fraction of the
// viewport height: the character while walking, the middle of the word in
// the overview. The world shifts its projection so the look target lands
// here instead of the center, which leaves room for text under the word.
export const FRAME_Y = 0.42;

// The world camera's vertical field of view, in degrees.
export const FOV = 40;

// Pixels of slack at the very top and bottom of the page, so a scroll
// position a fraction of a pixel off still counts as the overview.
const SLACK = 2;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * The journey for a scroll position.
 *
 * `sections` are the { top, bottom } of each stop's section in page pixels,
 * in walking order. The character arrives at each stop as its section
 * reaches FRAME_Y, where the character is drawn. The walk there takes at
 * least the gap between the sections, so when the panels cover the world
 * (phones) it happens in plain view between them, and at least `walkSpan`
 * pixels of scrolling, for when the world is always in view beside the
 * page (desktop).
 *
 * Returns { leg, t, overview }: the character is `t` (0 to 1) of the way from
 * stop `leg` to stop `leg + 1`, and `overview` (0 to 1) is how far the camera
 * is pulled back to the whole word. It is 1 at the top of the page, falls to
 * 0 as the first section arrives, and climbs back to 1 by the bottom.
 */
export function journeyAt(scrollY, viewportHeight, sections, pageHeight, walkSpan = 0) {
  const frame = viewportHeight * FRAME_Y;
  const line = scrollY + frame;
  const last = sections.length - 1;

  const opening = 1 - clamp01((scrollY - SLACK) / Math.max(1, sections[0].top - frame - SLACK));
  const maxScroll = Math.max(0, pageHeight - viewportHeight) - SLACK;
  const closingStart = sections[last].bottom;
  const closing = clamp01((line - closingStart) / Math.max(1, maxScroll + frame - closingStart));
  const overview = Math.max(opening, closing);

  // The latest leg that has set off; before any has, the first, not yet begun.
  for (let leg = last - 1; leg >= 0; leg--) {
    const arrive = sections[leg + 1].top;
    const depart = Math.max(sections[leg].top, Math.min(sections[leg].bottom, arrive - walkSpan));
    if (line >= depart || leg === 0) {
      return { leg, t: clamp01((line - depart) / Math.max(1, arrive - depart)), overview };
    }
  }
}

// The overview looks down at the word from a little in front of straight
// above, so the letters read but still have some depth.
const OVERVIEW_TILT = (20 * Math.PI) / 180;
// Room left around the word, in world units.
const OVERVIEW_MARGIN = [5, 3];
// How much further back than a tight fit the overview stands on landscape
// screens, so the word sits in open sea rather than filling the screen.
// Portrait screens are narrow enough that a tight fit already does.
const OVERVIEW_PULLBACK = 1.35;

/**
 * A camera pose, { position, target }, that frames `bounds` (the land's
 * { minX, maxX, minZ, maxZ }) for a viewport. `fov` is the camera's
 * vertical field of view in degrees. The word fills the width, or as much
 * of the space above FRAME_Y-centered as fits, whichever is tighter.
 */
export function overviewPose(bounds, aspect, fov) {
  const tan = Math.tan((fov * Math.PI) / 360);
  const halfWidth = (bounds.maxX - bounds.minX) / 2 + OVERVIEW_MARGIN[0];
  const halfDepth = ((bounds.maxZ - bounds.minZ) / 2 + OVERVIEW_MARGIN[1]) * Math.cos(OVERVIEW_TILT);
  // The word's top half has to fit between the top of the screen and FRAME_Y.
  const distance =
    (aspect < 1 ? 1 : OVERVIEW_PULLBACK) * Math.max(halfWidth / (tan * aspect), halfDepth / (2 * FRAME_Y * tan));
  const target = [(bounds.minX + bounds.maxX) / 2, 0, (bounds.minZ + bounds.maxZ) / 2];
  return {
    position: [
      target[0],
      target[1] + distance * Math.cos(OVERVIEW_TILT),
      target[2] + distance * Math.sin(OVERVIEW_TILT),
    ],
    target,
  };
}

// Behind, above and a little to the left of the character, like a game camera.
const FOLLOW_OFFSET = [-7.5, 11, 17.5];
// Portrait screens are narrow, so the camera stands further back.
const PORTRAIT_PULLBACK = 1.5;

/** The follow camera's pose for a character standing at `point`. */
export function followPose([x, y, z], aspect) {
  const scale = aspect < 1 ? PORTRAIT_PULLBACK : 1;
  return {
    position: [x + FOLLOW_OFFSET[0] * scale, y + FOLLOW_OFFSET[1] * scale, z + FOLLOW_OFFSET[2] * scale],
    target: [x, y + 0.8, z],
  };
}

/**
 * The follow camera's view across the ground, as unit [x, z] vectors:
 * `forward` walks away from the camera, `right` to the screen's right.
 */
export const groundAim = (() => {
  const { position, target } = followPose([0, 0, 0], 1);
  const ax = target[0] - position[0];
  const az = target[2] - position[2];
  const length = Math.hypot(ax, az);
  return { forward: [ax / length, az / length], right: [-az / length, ax / length] };
})();

/** Between two poses, `amount` (0 to 1) of the way from `a` to `b`. */
export function blendPoses(a, b, amount) {
  const mix = (p, q) => p.map((value, i) => value + (q[i] - value) * amount);
  return { position: mix(a.position, b.position), target: mix(a.target, b.target) };
}
