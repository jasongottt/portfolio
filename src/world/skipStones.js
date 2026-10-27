/**
 * Skipping stones, the rules: the meter a throw is timed on, how many skips
 * a throw makes, and the stone's flight. Plain logic, no three.js; positions
 * are world units ([x, y, z], or [x, z] across the water).
 */

// The meter's marker sweeps across and back, this long each way.
export const SWEEP_MS = 900;
// The sweet spot: this far either side of the meter's middle.
export const SWEET = 0.1;
export const MAX_SKIPS = 14;
// Further than this off the middle (a share of the way to either end), the
// stone just sinks.
const WILD = 0.8;

// The flight: the first hop's length, height and speed (cells, a second),
// and how much shorter, lower and slower each hop is than the last.
const FIRST_HOP = 2.6;
const FIRST_LIFT = 0.9;
const FIRST_SPEED = 9;
const SHORTER = 0.82;
const SLOWER = 0.94;

/** Where the meter's marker is, 0 to 1, `elapsed` ms after it started. */
export function meterAt(elapsed) {
  const t = (Math.max(0, elapsed) / SWEEP_MS) % 2;
  return t < 1 ? t : 2 - t;
}

/**
 * How many times a stone thrown with the marker at `meter` skips: up to
 * MAX_SKIPS in the middle, falling off fast either side, give or take one
 * (`roll`, 0 to 1).
 */
export function skipsFor(meter, roll = Math.random()) {
  const off = Math.min(1, Math.abs(meter - 0.5) / 0.5);
  if (off >= WILD) return 0;
  const skips = Math.round(MAX_SKIPS * (1 - off) ** 2 + (roll - 0.5) * 2);
  return Math.max(0, Math.min(MAX_SKIPS, skips));
}

/**
 * A stone's flight from `hand`, along `heading` (a unit [x, z]), meant to
 * skip `skips` times. `isWater(x, z)` says whether it can skip there. Returns
 * { hops, skips, ashore }: each hop { from, to, lift, seconds, wet } runs
 * from one touch to the next; the last ends where the stone sinks or, if it
 * reaches land first (`ashore`), comes to rest. `skips` is how many it made.
 */
export function flightPlan(hand, heading, skips, isWater) {
  const hops = [];
  let from = hand;
  let length = FIRST_HOP;
  let lift = FIRST_LIFT;
  let speed = FIRST_SPEED;
  for (let touch = 0; touch <= skips; touch++) {
    const to = [from[0] + heading[0] * length, from[2] + heading[1] * length];
    const wet = isWater(...to);
    hops.push({ from, to, lift, seconds: length / speed, wet });
    if (!wet) return { hops, skips: touch, ashore: true };
    from = [to[0], 0, to[1]];
    length *= SHORTER;
    lift *= SHORTER;
    speed *= SLOWER;
  }
  return { hops, skips, ashore: false };
}
