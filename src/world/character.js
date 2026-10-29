import * as THREE from "three";
import { landCode } from "./dither";
import { HERO_FRAMES, HERO_SHEET, WALK_STEPS } from "./heroSprite";

// The standing figure's height, in cells.
const FIGURE = 2.7;
// He takes a step every STEP cells walked (SPRINT_STEP running), so his feet
// keep up with the ground at any pace, though never faster than MAX_STEPS a
// second (scrolling can carry him a long way at once).
const STEP = 2;
const SPRINT_STEP = 3.2;
const MAX_STEPS = 5;
// Standing, he shifts a frame every IDLE_FRAME seconds. FLOURISH_AFTER
// seconds after stopping he waves, and every FLOURISH_EVERY seconds after
// that he does something: waves, dances, puts his hands on his hips, looks
// around.
const IDLE_FRAME = 0.45;
const FLOURISH_AFTER = 0.6;
const FLOURISH_EVERY = 8;
// Aiming a stone, he sways a frame every AIM_FRAME seconds; throwing, the
// swing goes a frame every THROW_FRAME seconds, then holds.
const AIM_FRAME = 0.16;
export const THROW_FRAME = 0.07;
// Sitting, he shifts a frame every SIT_FRAME seconds.
const SIT_FRAME = 0.7;
// Catching his breath: hands on his knees for BREATHE_SECONDS, then he wipes
// his brow and straightens up.
const BREATHE_SECONDS = 2.2;
// Poked, he gets more scared each time, up to the last of the poke moves;
// left alone CALM_AFTER seconds, he calms down (getting up off the ground,
// if he's down there).
const CALM_AFTER = 3.5;
// Every poke jolts him: he squashes (JOLT_SQUASH of his height, widening to
// match), springs back taller and wobbles to rest, shaking side to side (up
// to JOLT_SHAKE cells), all dying away over JOLT_SECONDS. JOLT_BOUNCE and
// JOLT_RATTLE are how fast he wobbles and shakes (radians a second), and
// JOLT_FADE how fast it dies away.
const JOLT_SECONDS = 0.5;
const JOLT_SQUASH = 0.2;
const JOLT_SHAKE = 0.12;
const JOLT_BOUNCE = 22;
const JOLT_RATTLE = 60;
const JOLT_FADE = 6;
// Turning around mid-walk, he faces the camera for TURN_SECONDS.
const TURN_SECONDS = 0.12;
// How far through each step his front foot lands (a footstep).
const FOOTFALL = 0.35;
// The camera looks down on him, so his camera-facing sprite leans back into
// whatever stands just behind it (a wall he walks along, a slope). It's drawn
// this many cells nearer the camera instead, shrunk to match, so it looks
// the same but nothing just behind him cuts through it.
const NUDGE = 2;

// A pose's frames played there and back: 0 1 2 1 0 1 2...
const pingPong = (frames) => [...frames, ...frames.slice(1, -1).reverse()];
const IDLE = pingPong(HERO_FRAMES.idle);
const AIM = pingPong(HERO_FRAMES.aim);
const SIT = pingPong(HERO_FRAMES.sit);
const STAND = HERO_FRAMES.idle[1];

// A move: its lead-in played once, a frame every `leadSeconds`, then its
// loop over and over, a frame every `loopSeconds` (or, with no loop, the
// last frame held).
const move = (lead, leadSeconds, loop = [], loopSeconds = leadSeconds) => ({ lead, leadSeconds, loop, loopSeconds });
const leadLength = ({ lead, leadSeconds }) => lead.length * leadSeconds;
function cellAt({ lead, leadSeconds, loop, loopSeconds }, clock) {
  const k = Math.floor(clock / leadSeconds);
  if (k < lead.length) return lead[k];
  if (!loop.length || !Number.isFinite(clock)) return lead.at(-1);
  return loop[Math.floor((clock - lead.length * leadSeconds) / loopSeconds) % loop.length];
}

const WAVE = move([...pingPong(HERO_FRAMES.wave), ...pingPong(HERO_FRAMES.wave), HERO_FRAMES.wave[0]], 0.12);
// What he does now and then, standing about. The first is always the wave.
const FLOURISHES = [
  WAVE,
  move(HERO_FRAMES.wiggle, 0.1),
  move(HERO_FRAMES.disco, 0.1),
  move(HERO_FRAMES.hips, 0.14),
  move(HERO_FRAMES.look, 0.2),
];
// Catching his breath: bending to his knees, breathing there.
const WINDED = move(HERO_FRAMES.stoop, 0.1, pingPong(HERO_FRAMES.breathe), 0.3);
const WIPE = move(HERO_FRAMES.wipe, 0.1);
// Poked: a wave, then a worried hand to his face, hands over his head, and
// down on the ground covering up; and getting back up after.
const POKED = [
  WAVE,
  move(HERO_FRAMES.worried.slice(0, 1), 0.1, pingPong(HERO_FRAMES.worried), 0.2),
  move(HERO_FRAMES.coverUp, 0.08, pingPong(HERO_FRAMES.cover), 0.18),
  move(HERO_FRAMES.duck, 0.08, pingPong(HERO_FRAMES.cower), 0.25),
];
const RISE = move(HERO_FRAMES.rise, 0.1);

// The walk (and run) for each way he can be heading on screen: its frames
// (facing right, side on, and `left` if there are frames of him facing
// left, rather than mirroring), and how many steps they cover. A way with
// no frames of its own goes side on.
const gait = (right, left) =>
  HERO_FRAMES[right] && { frames: HERO_FRAMES[right], left: HERO_FRAMES[left], steps: WALK_STEPS[right] };
const gaits = (prefix) => {
  const side = gait(prefix, `${prefix}Left`);
  return { side, toward: gait(`${prefix}Toward`) ?? side, away: gait(`${prefix}Away`) ?? side };
};
const WALKS = gaits("walk");
const RUNS = gaits("sprint");

/**
 * Jason: his photos (heroSprite.js) on a camera-facing sprite, drawn over the
 * world at the screen's resolution so he's clearly himself, but hidden
 * wherever the world is nearer the camera, a world pixel at a time (the
 * world's depth from dither.js: `depth`, `world` and `scale`). His shadow is
 * on the ground, in the world.
 *
 * `object` goes in the world's scene; `sprite` in a scene drawn after it. He
 * walks or runs (across the screen, toward the camera or away), stands about
 * (shifting, now and then waving, dancing or looking around), sits, aims and
 * throws. catchBreath() bends him over to get his breath back, and poke()
 * startles him a little more each time.
 */
export function createCharacter({ depth, world, scale }) {
  const [cellWidth, cellHeight] = HERO_SHEET.cell;
  const sheetSize = [cellWidth * HERO_SHEET.columns, cellHeight * Math.ceil(HERO_SHEET.cells / HERO_SHEET.columns)];
  const across = cellWidth / sheetSize[0];
  const texture = new THREE.TextureLoader().load(HERO_SHEET.url);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.repeat.set(across, cellHeight / sheetSize[1]);

  const material = new THREE.SpriteMaterial({ map: texture, fog: false, alphaTest: 0.5, depthTest: false, depthWrite: false });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSceneDepth = { value: depth };
    shader.uniforms.uWorld = world;
    shader.uniforms.uScale = scale;
    shader.fragmentShader = `uniform sampler2D uSceneDepth;\nuniform vec2 uWorld;\nuniform float uScale;\n${shader.fragmentShader}`.replace(
      "void main() {",
      `void main() {
      // Hidden where the world is nearer the camera.
      vec2 pixel = floor(gl_FragCoord.xy / uScale);
      if (texture2D(uSceneDepth, (pixel + 0.5) / uWorld).r < gl_FragCoord.z) discard;`
    );
  };
  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0);
  const height = (FIGURE * cellHeight) / HERO_SHEET.figure;
  const width = (FIGURE * cellWidth) / HERO_SHEET.figure;

  const shadowMaterial = new THREE.MeshBasicMaterial({ color: landCode(0.08), fog: false });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 10).rotateX(-Math.PI / 2), shadowMaterial);
  shadow.position.y = 0.04;
  const object = new THREE.Group();
  object.add(shadow);

  // Steps taken since he set off.
  let strides = 0;
  let standClock = 0;
  let sitClock = 0;
  let aimClock = 0;
  let throwClock = -1;
  let turning = 0;
  let lastFacing = 1;
  // Standing about: the flourish he's doing (and how far into it), and when
  // the next is due.
  let flourish = null;
  let flourishClock = 0;
  let nextFlourish = FLOURISH_AFTER;
  let flourishes = 0;
  // Catching his breath (seconds into it), or not (-1).
  let breathClock = -1;
  // How scared he is (how many pokes, up to POKED.length), how long he's
  // been that scared, how long since the last poke, and getting back up
  // (seconds into it, or -1).
  let fear = 0;
  let fearClock = 0;
  let calmClock = 0;
  let riseClock = -1;
  let standing = false;
  // Jolted by a poke (seconds into it), or not (-1).
  let joltClock = -1;
  const toEye = new THREE.Vector3();
  const sideways = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  // The cell for now, and whether it's mirrored to face left: sitting, the
  // throw, aiming, the walk or run (or turning around in it), catching his
  // breath, being poked, a flourish, or standing. `still` (reduced motion)
  // holds every pose still.
  const cellFor = ({ walking, sprinting, view, sitting, aiming, facing, still }) => {
    if (sitting) return [still ? HERO_FRAMES.sit[0] : SIT[Math.floor(sitClock / SIT_FRAME) % SIT.length], true];
    if (throwClock >= 0) {
      const frame = still ? HERO_FRAMES.throw.length - 1 : Math.floor(throwClock / THROW_FRAME);
      return [HERO_FRAMES.throw[Math.min(frame, HERO_FRAMES.throw.length - 1)], true];
    }
    if (aiming) return [still ? HERO_FRAMES.aim[0] : AIM[Math.floor(aimClock / AIM_FRAME) % AIM.length], true];
    if (walking && turning > 0) return [STAND, true];
    if (walking) {
      const pace = sprinting ? RUNS : WALKS;
      const { frames, left, steps } = pace[view] ?? pace.side;
      const own = facing < 0 && left;
      const cycle = own ? left : frames;
      return [cycle[Math.floor(((strides % steps) / steps) * cycle.length) % cycle.length], !own];
    }
    if (breathClock >= 0) {
      if (still) return [HERO_FRAMES.breathe[0], true];
      return [breathClock < BREATHE_SECONDS ? cellAt(WINDED, breathClock) : cellAt(WIPE, breathClock - BREATHE_SECONDS), true];
    }
    if (riseClock >= 0) return [cellAt(RISE, still ? Infinity : riseClock), true];
    if (fear > 0) {
      const poked = POKED[fear - 1];
      if (poked.loop.length || fearClock < leadLength(poked)) return [cellAt(poked, still ? leadLength(poked) : fearClock), true];
    }
    if (still) return [STAND, true];
    if (flourish) return [cellAt(flourish, flourishClock), true];
    return [IDLE[Math.floor(standClock / IDLE_FRAME) % IDLE.length], true];
  };

  return {
    object,
    sprite,
    /**
     * Stands him at `point`, walking or running or not (`moved` cells since
     * the last frame, `view` "side", "toward" the camera or "away"), or
     * sitting, aiming or throwing, facing left (-1) or right (1), as seen by
     * a camera at `eye`. `still` (reduced motion) holds his poses still.
     * Returns whether a foot just landed.
     */
    update(point, { walking, sprinting, moved, view, sitting, aiming, throwing, facing, delta, eye, still }) {
      object.position.set(...point);
      const before = strides;
      const step = sprinting ? SPRINT_STEP : STEP;
      strides = walking ? strides + Math.min(moved / step, MAX_STEPS * delta) : 0;
      const footfall = walking && Math.floor(strides - FOOTFALL) > Math.floor(before - FOOTFALL);
      standing = !(walking || sitting || aiming || throwing);
      sitClock = sitting ? sitClock + delta : 0;
      aimClock = aiming ? aimClock + delta : 0;
      throwClock = !throwing ? -1 : throwClock < 0 ? 0 : throwClock + delta;
      if (!standing) {
        // On the move (or busy), whatever he was doing standing is over.
        standClock = 0;
        flourish = null;
        nextFlourish = FLOURISH_AFTER;
        if (walking) breathClock = -1;
        fear = 0;
        riseClock = -1;
      } else {
        standClock += delta;
        if (breathClock >= 0) {
          breathClock += delta;
          if (breathClock >= BREATHE_SECONDS + leadLength(WIPE)) breathClock = -1;
        }
        if (riseClock >= 0) {
          riseClock += delta;
          if (riseClock >= leadLength(RISE)) riseClock = -1;
        }
        if (fear > 0) {
          fearClock += delta;
          calmClock += delta;
          if (calmClock >= CALM_AFTER) {
            // Down on the ground, he gets back up; otherwise he just settles.
            if (fear === POKED.length) riseClock = 0;
            fear = 0;
          }
        }
        // A flourish now and then, while nothing else is going on.
        const busy = breathClock >= 0 || riseClock >= 0 || fear > 0;
        if (flourish) {
          flourishClock += delta;
          if (flourishClock >= leadLength(flourish)) flourish = null;
        } else if (!busy && standClock >= nextFlourish) {
          flourish = flourishes === 0 ? WAVE : FLOURISHES[Math.floor(Math.random() * FLOURISHES.length)];
          flourishes++;
          flourishClock = 0;
          nextFlourish = standClock + leadLength(flourish) + FLOURISH_EVERY;
        }
        if (busy) nextFlourish = Math.max(nextFlourish, standClock + FLOURISH_EVERY / 2);
      }
      // Turning around mid-walk across the screen.
      turning = walking && view === "side" && facing !== lastFacing ? TURN_SECONDS : Math.max(0, turning - delta);
      lastFacing = facing;

      // The cell's patch of the sheet, run backwards to face left (unless
      // it's a frame of him facing left already).
      const [cell, mirror] = cellFor({ walking, sprinting, view, sitting, aiming, facing, still });
      const flip = mirror && facing < 0 ? -1 : 1;
      const column = cell % HERO_SHEET.columns;
      const row = Math.floor(cell / HERO_SHEET.columns);
      texture.repeat.x = across * flip;
      texture.offset.set((column + (flip < 0 ? 1 : 0)) * across, 1 - ((row + 1) * cellHeight) / sheetSize[1]);

      // Along the line from his feet to the camera, so his feet stay put on
      // screen.
      toEye.set(eye.x - point[0], eye.y - point[1], eye.z - point[2]);
      const distance = toEye.length();
      const nudge = Math.min(NUDGE, distance / 2);
      sprite.position.set(...point).addScaledVector(toEye, nudge / distance);
      const shrink = (distance - nudge) / distance;

      // A poke's jolt: squashed from his feet up (the sprite's pinned at
      // its bottom), and shaken across the screen.
      let squash = 0;
      if (joltClock >= 0) {
        joltClock += delta;
        if (still || joltClock >= JOLT_SECONDS) joltClock = -1;
        else {
          const fade = Math.exp(-JOLT_FADE * joltClock);
          squash = JOLT_SQUASH * fade * Math.cos(JOLT_BOUNCE * joltClock);
          sideways.crossVectors(UP, toEye).normalize();
          sprite.position.addScaledVector(sideways, JOLT_SHAKE * fade * Math.sin(JOLT_RATTLE * joltClock));
        }
      }
      sprite.scale.set(width * shrink * (1 + squash * 0.8), height * shrink * (1 - squash), 1);
      return footfall;
    },
    /** Bends him over to catch his breath, if he's standing still. */
    catchBreath() {
      if (breathClock < 0) breathClock = 0;
      flourish = null;
      fear = 0;
    },
    /** Whether he's catching his breath. */
    get winded() {
      return breathClock >= 0;
    },
    /**
     * Pokes him (a click): he jolts, and standing about, the first time he
     * waves; each time after, until he's been left alone a while, he's more
     * scared. Returns whether he noticed (beyond the jolt).
     */
    poke() {
      joltClock = 0;
      if (!standing || breathClock >= 0) return false;
      const next = Math.min(POKED.length, fear + 1);
      if (next !== fear) fearClock = 0;
      fear = next;
      calmClock = 0;
      riseClock = -1;
      flourish = null;
      return true;
    },
    dispose() {
      texture.dispose();
      material.dispose();
      shadowMaterial.dispose();
      shadow.geometry.dispose();
    },
  };
}
