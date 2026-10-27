import * as THREE from "three";
import { landCode } from "./dither";
import { HERO_FRAMES, HERO_SHEET, WALK_STEPS } from "./heroSprite";

// The standing figure's height, in cells.
const FIGURE = 2.7;
// He takes a step every STEP cells walked, so his feet keep up with the
// ground at any pace, though never faster than MAX_STEPS a second
// (scrolling can carry him a long way at once).
const STEP = 2;
const MAX_STEPS = 5;
// Standing, he shifts a frame every IDLE_FRAME seconds. He waves
// WAVE_AFTER seconds after stopping, for WAVE_SECONDS, and again every
// WAVE_EVERY seconds, the hand moving a frame every WAVE_FRAME seconds.
const IDLE_FRAME = 0.45;
const WAVE_AFTER = 0.6;
const WAVE_SECONDS = 1.4;
const WAVE_EVERY = 10;
const WAVE_FRAME = 0.12;
// Aiming a stone, he sways a frame every AIM_FRAME seconds; throwing, the
// swing goes a frame every THROW_FRAME seconds, then holds.
const AIM_FRAME = 0.16;
export const THROW_FRAME = 0.07;
// Sitting, he shifts a frame every SIT_FRAME seconds.
const SIT_FRAME = 0.7;
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
const WAVE = pingPong(HERO_FRAMES.wave);
const AIM = pingPong(HERO_FRAMES.aim);
const SIT = pingPong(HERO_FRAMES.sit);
const STAND = HERO_FRAMES.idle[1];
// The walk for each way he can be heading on screen, and how many steps its
// frames cover.
const SIDE = { frames: HERO_FRAMES.walk, steps: WALK_STEPS.walk };
const WALKS = {
  side: SIDE,
  toward: HERO_FRAMES.walkToward ? { frames: HERO_FRAMES.walkToward, steps: WALK_STEPS.walkToward } : SIDE,
  away: { frames: HERO_FRAMES.walkAway, steps: WALK_STEPS.walkAway },
};

/**
 * Jason: his photos (heroSprite.js) on a camera-facing sprite, drawn over the
 * world at the screen's resolution so he's clearly himself, but hidden
 * wherever the world is nearer the camera, a world pixel at a time (the
 * world's depth from dither.js: `depth`, `world` and `scale`). His shadow is
 * on the ground, in the world.
 *
 * `object` goes in the world's scene; `sprite` in a scene drawn after it. He
 * walks (across the screen, toward the camera or away), shifts and waves
 * while standing, sits, aims and throws.
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
  const toEye = new THREE.Vector3();

  // The cell for now: sitting, the throw, aiming, the walk (or turning
  // around in it), a wave, or standing. `still` (reduced motion) holds every
  // pose still.
  const cellFor = ({ walking, view, sitting, aiming, still }) => {
    if (sitting) return still ? HERO_FRAMES.sit[0] : SIT[Math.floor(sitClock / SIT_FRAME) % SIT.length];
    if (throwClock >= 0) {
      const frame = still ? HERO_FRAMES.throw.length - 1 : Math.floor(throwClock / THROW_FRAME);
      return HERO_FRAMES.throw[Math.min(frame, HERO_FRAMES.throw.length - 1)];
    }
    if (aiming) return still ? HERO_FRAMES.aim[0] : AIM[Math.floor(aimClock / AIM_FRAME) % AIM.length];
    if (walking && turning > 0) return STAND;
    if (walking) {
      const { frames, steps } = WALKS[view] ?? WALKS.side;
      return frames[Math.floor(((strides % steps) / steps) * frames.length) % frames.length];
    }
    if (still) return STAND;
    const waving = (standClock - WAVE_AFTER) % WAVE_EVERY;
    if (standClock >= WAVE_AFTER && waving < WAVE_SECONDS) return WAVE[Math.floor(waving / WAVE_FRAME) % WAVE.length];
    return IDLE[Math.floor(standClock / IDLE_FRAME) % IDLE.length];
  };

  return {
    object,
    sprite,
    /**
     * Stands him at `point`, walking or not (`moved` cells since the last
     * frame, `view` "side", "toward" the camera or "away"), or sitting,
     * aiming or throwing, facing left (-1) or right (1), as seen by a camera
     * at `eye`. `still` (reduced motion) holds his poses still. Returns
     * whether a foot just landed.
     */
    update(point, { walking, moved, view, sitting, aiming, throwing, facing, delta, eye, still }) {
      object.position.set(...point);
      const before = strides;
      strides = walking ? strides + Math.min(moved / STEP, MAX_STEPS * delta) : 0;
      const footfall = walking && Math.floor(strides - FOOTFALL) > Math.floor(before - FOOTFALL);
      standClock = walking || sitting || aiming || throwing ? 0 : standClock + delta;
      sitClock = sitting ? sitClock + delta : 0;
      aimClock = aiming ? aimClock + delta : 0;
      throwClock = !throwing ? -1 : throwClock < 0 ? 0 : throwClock + delta;
      // Turning around mid-walk across the screen.
      turning = walking && view === "side" && facing !== lastFacing ? TURN_SECONDS : Math.max(0, turning - delta);
      lastFacing = facing;

      // The cell's patch of the sheet, run backwards to face left.
      const cell = cellFor({ walking, view, sitting, aiming, still });
      const column = cell % HERO_SHEET.columns;
      const row = Math.floor(cell / HERO_SHEET.columns);
      texture.repeat.x = across * facing;
      texture.offset.set((column + (facing < 0 ? 1 : 0)) * across, 1 - ((row + 1) * cellHeight) / sheetSize[1]);

      // Along the line from his feet to the camera, so his feet stay put on
      // screen.
      toEye.set(eye.x - point[0], eye.y - point[1], eye.z - point[2]);
      const distance = toEye.length();
      const nudge = Math.min(NUDGE, distance / 2);
      sprite.position.set(...point).addScaledVector(toEye, nudge / distance);
      const shrink = (distance - nudge) / distance;
      sprite.scale.set(width * shrink, height * shrink, 1);
      return footfall;
    },
    dispose() {
      texture.dispose();
      material.dispose();
      shadowMaterial.dispose();
      shadow.geometry.dispose();
    },
  };
}
