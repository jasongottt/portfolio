import * as THREE from "three";
import { THROW_FRAME, createCharacter } from "./character";
import { createDither } from "./dither";
import { FOV, FRAME_Y, blendPoses, followPose, groundAim, journeyAt, overviewPose } from "./journey";
import { layoutFor } from "./nameplate";
import { RELEASE_FRAME } from "./heroSprite";
import { buildWorld } from "./scene";

// Screen pixels per world pixel. Phones get finer pixels, or the letters
// turn to mush on a small screen.
const pixelSizeFor = (width) => (width < 700 ? 2 : 3);
// How quickly things catch up with where they should be, per second.
const CAMERA_RATE = 4;
const WALK_RATE = 6;
// Cells per second, so a long jump down the page still reads as a walk.
const MAX_WALK_SPEED = 45;
// Landmark buttons stay big enough to tap, and no bigger than a landmark.
const BUTTON_SIZE = [36, 180];
// Pulled back, landmarks are too small to aim at, so each button becomes a
// circle this size just under its landmark's foot (the circle drawn in it,
// WorldBackground.jsx). Up close, the button covers the landmark itself.
const MARKER_SIZE = 32;
const MARKER_DROP = 12;
// With room beside the page (desktop), the character is framed in the
// middle of that room, and each walk takes this share of a screen of
// scrolling. Without it (phones), the walks happen in the gaps.
const MIN_OPEN_SIDE = 0.3;
const WALK_SPAN = 0.55;

// Explore mode: walking speed in cells per second, how close (in cells) a
// spot has to be to visit, and how far feet keep from the water's edge.
const EXPLORE_SPEED = 5.5;
const NEAR = 1.6;
const EDGE = 0.3;
// Sitting by the campfire, the camera comes this share of the way in, and
// looks between the character and the fire.
const FIRESIDE_ZOOM = 0.4;
// While a skipped stone is in the air, the camera looks this share of the
// way from the character to it. The character's throw (the swing, then the
// follow-through, held) takes THROW_SECONDS; the stone leaves his hand on
// the release frame.
const FOLLOW_STONE = 0.45;
const THROW_SECONDS = 1.2;
const RELEASE_SECONDS = RELEASE_FRAME * THROW_FRAME;
const EXPLORE_KEYS = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};
// When nothing is moving (no scroll, the camera and character settled), the
// world redraws at this rate instead of every frame: the sea and leaves keep
// drifting, for half the work.
const IDLE_FPS = 30;
// Taps are aimed at the ground, or off the map, at a plane about as high as
// the islands' shoulders.
const TAP_HEIGHT = 0.8;

const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Starts the world on `canvas` and runs it until dispose(). Throws if WebGL
 * can't start. The page is read every frame, and the elements below are
 * moved by writing their styles directly, so React never re-renders for it.
 *
 * - map, stops: worldMap.js, and the stage ids the character walks between.
 * - sections: the page section for each stop, in the same order.
 * - landmarks: a Map from stage id to the element placed over its landmark.
 * - layer: gets data-settled="true" while the camera rests on the overview,
 *   which shows the circles under the landmarks (index.css).
 * - titleBlock, surname, intro: the text under the word. The block is placed
 *   under the word in the overview; surname and intro fade in only once the
 *   camera has settled there, and the intro only at the top of the page.
 * - onNear: in Explore mode, called with the id of the spot the character
 *   is close enough to visit (a stage id, "secret", "campfire" or
 *   "skipping"), or null.
 * - onActivity: in Explore mode, called with what the character is doing at
 *   a spot: "campfire" (sitting by it), "skipping" (at the water's edge,
 *   ready to throw), or null.
 * - onFirstFrame: called once the world has drawn its first frame.
 * - onLost: called if the browser takes the WebGL context away.
 *
 * In Explore mode (setExploring) the visitor walks the character instead of
 * the scroll: arrow keys or WASD, or walkTo() a point on screen. It can
 * startActivity() at the campfire or on any beach, and throwStone()
 * there.
 */
export function runWorld({
  canvas,
  map,
  stops,
  sections,
  landmarks,
  layer,
  titleBlock,
  surname,
  intro,
  onNear,
  onActivity,
  onFirstFrame,
  onLost,
}) {
  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const dither = createDither(renderer);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1000);
  // Jason, drawn over the world at the screen's resolution (character.js),
  // in a scene of his own.
  const character = createCharacter(dither);
  const heroScene = new THREE.Scene();
  heroScene.add(character.sprite);

  let world = null;
  let layoutName = null;
  let overview = null;
  let size = [0, 0];
  let frameId = 0;
  let lastTime = 0;
  let reducedMotion = false;

  let snap = true;
  let drawn = false;
  // Whether the last frame found everything settled, and the scroll then.
  let resting = false;
  let lastScrollY = -1;
  let distance = 0;
  let facing = 1;
  // Which way he's walking on screen: "side", "toward" the camera or "away".
  let view = "side";
  const cameraPosition = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const overviewPosition = new THREE.Vector3();
  const goalPosition = new THREE.Vector3();
  const goalTarget = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const right = new THREE.Vector3();
  const shown = new Map();

  let exploring = false;
  const explorer = { x: 0, z: 0, route: [] };
  // What the character is doing at a spot, and the one it's walking over
  // to do (startActivity). On a beach: where he stands and which way he
  // throws, whether he's aiming, seconds left of his throw, and the stone
  // waiting for its release.
  let activity = null;
  let headingTo = null;
  let skipFrom = null;
  let skipHeading = null;
  let aiming = false;
  let throwing = 0;
  let release = null;
  const held = new Set();
  let near = null;
  const raycaster = new THREE.Raycaster();
  const tap = new THREE.Vector2();

  // Hidden things are also invisible, so their buttons can't be clicked or
  // tabbed to; the visibility change waits for the fade (see the CSS
  // transitions on these elements).
  const show = (element, visible) => {
    if (shown.get(element) === visible) return;
    shown.set(element, visible);
    element.style.opacity = visible ? "1" : "0";
    element.style.visibility = visible ? "visible" : "hidden";
  };

  const setNear = (id) => {
    if (id === near) return;
    near = id;
    layer.dataset.near = id ?? "";
    onNear?.(id);
  };

  const setActivity = (value) => {
    headingTo = null;
    if (value === activity) return;
    if (activity === "skipping") {
      aiming = false;
      throwing = 0;
      release = null;
    }
    activity = value;
    onActivity?.(value);
  };

  // Puts the explorer where the scroll walk has the character.
  const placeExplorer = () => {
    const [x, , z] = world.pointAlong(distance);
    Object.assign(explorer, { x, z, route: [] });
  };

  // One frame of Explore mode: held keys steer, otherwise the explorer
  // follows its route. Returns whether the character moved.
  function stepExplorer(delta) {
    const along = (held.has("up") ? 1 : 0) - (held.has("down") ? 1 : 0);
    const across = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
    const start = [explorer.x, explorer.z];
    if (along || across) {
      setActivity(null);
      explorer.route = [];
      // Up walks away from the camera and right walks to the screen's right.
      let dx = groundAim.forward[0] * along + groundAim.right[0] * across;
      let dz = groundAim.forward[1] * along + groundAim.right[1] * across;
      const length = Math.hypot(dx, dz);
      dx = (dx / length) * EXPLORE_SPEED * delta;
      dz = (dz / length) * EXPLORE_SPEED * delta;
      // One axis at a time, so walking into the water slides along the shore.
      if (world.open(explorer.x + dx + Math.sign(dx) * EDGE, explorer.z)) explorer.x += dx;
      if (world.open(explorer.x, explorer.z + dz + Math.sign(dz) * EDGE)) explorer.z += dz;
    } else {
      let budget = EXPLORE_SPEED * delta;
      while (budget > 0 && explorer.route.length) {
        const [tx, tz] = explorer.route[0];
        const gap = Math.hypot(tx - explorer.x, tz - explorer.z);
        if (gap <= budget) {
          explorer.x = tx;
          explorer.z = tz;
          explorer.route.shift();
          budget -= gap;
        } else {
          explorer.x += ((tx - explorer.x) / gap) * budget;
          explorer.z += ((tz - explorer.z) / gap) * budget;
          budget = 0;
        }
      }
      if (headingTo && !explorer.route.length) setActivity(headingTo);
    }
    return explorer.x !== start[0] || explorer.z !== start[1];
  }

  // The visitable spot within reach of the explorer, if any; failing that, a
  // beach to skip stones from.
  function spotNearby() {
    let best = null;
    let bestGap = NEAR;
    for (const spot of world.spots) {
      const gap = Math.hypot(spot.x - explorer.x, spot.z - explorer.z);
      if (gap < bestGap) {
        best = spot.id;
        bestGap = gap;
      }
    }
    return best ?? (activity === "skipping" || world.beachAt(explorer.x, explorer.z) ? "skipping" : null);
  }

  const onKey = (event) => {
    const key = EXPLORE_KEYS[event.code];
    if (!exploring || !key || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    if (event.type === "keydown") held.add(key);
    else held.delete(key);
  };
  const onBlur = () => held.clear();
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  window.addEventListener("blur", onBlur);

  function setLayout(name) {
    if (world) {
      world.scene.remove(character.object);
      world.dispose();
    }
    world = buildWorld(map, name, stops);
    world.scene.add(character.object);
    layoutName = name;
    snap = true;
    setActivity(null);
    if (exploring) placeExplorer();
  }

  function resize(width, height) {
    size = [width, height];
    const pixelSize = pixelSizeFor(width);
    const pixels = [Math.ceil(width / pixelSize), Math.ceil(height / pixelSize)];
    // The world is drawn a pixel per world pixel, then blown up onto a canvas
    // at the screen's own resolution (up to 2x), where Jason is drawn too.
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    renderer.setSize(Math.round(pixels[0] * pixelSize * ratio), Math.round(pixels[1] * pixelSize * ratio), false);
    canvas.style.width = `${pixels[0] * pixelSize}px`;
    canvas.style.height = `${pixels[1] * pixelSize}px`;
    dither.setSize(pixels[0], pixels[1], pixelSize * ratio);

    camera.aspect = width / height;
    frameAt(0.5);

    const name = layoutFor(width, height);
    if (name !== layoutName) setLayout(name);
    overview = overviewPose(world.bounds, width / height, FOV);
    overviewPosition.set(...overview.position);

    // Put the text just under the word, as the settled overview shows it.
    frameAt(0.5);
    const probe = camera.clone();
    probe.position.copy(overviewPosition);
    probe.lookAt(...overview.target);
    probe.updateMatrixWorld();
    const { minX, maxX, maxZ } = world.bounds;
    projected.set((minX + maxX) / 2, 0, maxZ + 1.5).project(probe);
    titleBlock.style.top = `${((1 - projected.y) / 2) * height}px`;
  }

  // Shifts the projection so the look target sits at (frameX, FRAME_Y) on
  // screen rather than the center.
  function frameAt(frameX) {
    const [width, height] = size;
    camera.setViewOffset(width, height, (0.5 - frameX) * width, (0.5 - FRAME_Y) * height, width, height);
    camera.updateProjectionMatrix();
  }

  // `markers`: place the buttons on the circles rather than the landmarks.
  function placeLandmarks(width, height, markers) {
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    for (const { stage, anchor, foot, size: span } of world.landmarks) {
      const element = landmarks.get(stage.id);
      if (!element) continue;
      projected.set(...(markers ? foot : anchor)).project(camera);
      if (projected.z > 1 || Math.abs(projected.x) > 1.1 || Math.abs(projected.y) > 1.1) {
        element.style.visibility = "hidden";
        continue;
      }
      let side = MARKER_SIZE;
      if (!markers) {
        edge.set(...anchor).addScaledVector(right, span / 2).project(camera);
        side = Math.min(BUTTON_SIZE[1], Math.max(BUTTON_SIZE[0], Math.abs(edge.x - projected.x) * width));
      }
      const x = ((projected.x + 1) / 2) * width - side / 2;
      const y = ((1 - projected.y) / 2) * height - side / 2 + (markers ? MARKER_DROP : 0);
      element.style.visibility = "visible";
      element.style.width = `${side}px`;
      element.style.height = `${side}px`;
      element.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  function frame(now) {
    frameId = requestAnimationFrame(frame);
    const idle =
      resting &&
      window.scrollY === lastScrollY &&
      window.innerWidth === size[0] &&
      window.innerHeight === size[1] &&
      !held.size &&
      !explorer.route.length;
    if (idle && now - lastTime < 1000 / IDLE_FPS - 2) return;
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    lastScrollY = window.scrollY;

    // Read the page first, before writing any styles, so layout isn't forced twice.
    const width = window.innerWidth;
    const height = window.innerHeight;
    const { scrollY } = window;
    const pageHeight = document.documentElement.scrollHeight;
    const spans = sections.map((section) => {
      const rect = section.getBoundingClientRect();
      return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    });
    const column = sections[0].getBoundingClientRect();
    if (width !== size[0] || height !== size[1]) resize(width, height);

    // The open side of the screen, if the page leaves one.
    const openLeft = column.left;
    const openRight = width - column.right;
    const open = Math.max(openLeft, openRight) >= width * MIN_OPEN_SIDE;
    const openCenter = openRight >= openLeft ? (column.right + width) / 2 : openLeft / 2;

    // The character: eased along the walk toward its spot for this scroll,
    // or, exploring, wherever the visitor walks it.
    const journey = journeyAt(scrollY, height, spans, pageHeight, open ? height * WALK_SPAN : 0);
    const from = world.stopDistance(journey.leg);
    const goal = from + (world.stopDistance(journey.leg + 1) - from) * journey.t;
    let before;
    let point;
    let walking;
    if (exploring) {
      before = world.groundAt(explorer.x, explorer.z);
      walking = stepExplorer(delta);
      point = world.groundAt(explorer.x, explorer.z);
      setNear(spotNearby());
    } else {
      before = world.pointAlong(distance);
      if (snap || reducedMotion) {
        distance = goal;
      } else {
        const step = (goal - distance) * (1 - Math.exp(-WALK_RATE * delta));
        const cap = MAX_WALK_SPEED * delta;
        distance += Math.max(-cap, Math.min(cap, step));
      }
      point = world.pointAlong(distance);
      walking = !snap && Math.abs(goal - distance) > 0.02;
    }

    // The camera: the follow pose and the overview, blended by the journey.
    // Exploring, it just follows, centered, since the page is out of the way;
    // by the campfire, it comes in close, and it watches a skipped stone go.
    const pulledBack = exploring ? 0 : smoothstep(journey.overview);
    let pose = blendPoses(followPose(point, width / height), overview, pulledBack);
    const sitting = activity === "campfire";
    const stone = activity === "skipping" ? world.skipping.stoneAt() : null;
    if (sitting) {
      const { fire } = world.campfire;
      const between = [(point[0] + fire[0]) / 2, point[1] + 0.8, (point[2] + fire[2]) / 2];
      const back = pose.position.map((v, i) => (v - pose.target[i]) * (1 - FIRESIDE_ZOOM));
      pose = { position: between.map((v, i) => v + back[i]), target: between };
    } else if (stone) {
      const shift = [(stone[0] - point[0]) * FOLLOW_STONE, 0, (stone[2] - point[2]) * FOLLOW_STONE];
      pose = { position: pose.position.map((v, i) => v + shift[i]), target: pose.target.map((v, i) => v + shift[i]) };
    }
    const followX = open && !exploring ? openCenter / width : 0.5;
    frameAt(followX + (0.5 - followX) * pulledBack);
    goalPosition.set(...pose.position);
    goalTarget.set(...pose.target);
    if (snap || reducedMotion) {
      cameraPosition.copy(goalPosition);
      cameraTarget.copy(goalTarget);
    } else {
      const ease = 1 - Math.exp(-CAMERA_RATE * delta);
      cameraPosition.lerp(goalPosition, ease);
      cameraTarget.lerp(goalTarget, ease);
    }
    camera.position.copy(cameraPosition);
    camera.lookAt(cameraTarget);
    camera.updateMatrixWorld();

    // Face the way the walk goes across the screen, the fire, or the throw
    // (his swing goes left to right; straight out from the screen, either).
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    const [a, b] = sitting ? [point, world.campfire.fire] : [before, point];
    const across = (b[0] - a[0]) * right.x + (b[2] - a[2]) * right.z;
    if ((walking || sitting) && Math.abs(across) > 1e-4) facing = across < 0 ? -1 : 1;
    if (activity === "skipping") {
      const out = skipHeading[0] * right.x + skipHeading[1] * right.z;
      if (Math.abs(out) > 0.3) facing = out < 0 ? -1 : 1;
    }
    // Walking mostly up or down the screen, he walks away or toward the
    // camera; mostly across, side on. In between, he keeps the view he had.
    // Steering with keys, it's the way he's steered, not the way he goes (he
    // slides along shores).
    const moveX = point[0] - before[0];
    const moveZ = point[2] - before[2];
    const steering = exploring && held.size > 0;
    const sideways = steering ? (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0) : across;
    const along = steering
      ? (held.has("up") ? 1 : 0) - (held.has("down") ? 1 : 0)
      : moveX * groundAim.forward[0] + moveZ * groundAim.forward[1];
    if (walking && Math.abs(along) > Math.abs(sideways) * 1.4) view = along > 0 ? "away" : "toward";
    else if (walking && Math.abs(sideways) > Math.abs(along)) view = "side";
    throwing = Math.max(0, throwing - delta);
    const footfall = character.update(point, {
      walking,
      moved: Math.hypot(moveX, moveZ),
      view,
      sitting,
      aiming: activity === "skipping" && aiming,
      throwing: throwing > 0,
      facing,
      delta,
      eye: camera.position,
      still: reducedMotion,
    });
    if (footfall && !reducedMotion) world.footstep(point, now / 1000);

    const settled =
      !exploring &&
      journey.overview >= 1 &&
      cameraPosition.distanceTo(overviewPosition) < overviewPosition.y * 0.01;
    show(surname, settled);
    if (layer.dataset.settled !== String(settled)) layer.dataset.settled = String(settled);
    show(intro, settled && scrollY < height);
    if (!exploring) placeLandmarks(width, height, journey.overview > 0.5);

    // Fog starts past whatever the camera is looking at, so the horizon
    // dissolves but the subject never does.
    const reach = cameraPosition.distanceTo(cameraTarget);
    world.scene.fog.near = reach + 20;
    world.scene.fog.far = reach + 150;
    // The stone leaves his hand partway through the swing.
    if (release && throwing <= THROW_SECONDS - RELEASE_SECONDS) {
      const { skips, handlers } = release;
      release = null;
      world.skipping.throwStone(skipFrom, skipHeading, skips, now / 1000, false, handlers);
    }
    world.tick(reducedMotion ? 0 : now / 1000, camera, reducedMotion, point);
    dither.render(world.scene, camera);
    renderer.autoClear = false;
    renderer.render(heroScene, camera);
    renderer.autoClear = true;
    resting =
      !walking &&
      cameraPosition.distanceToSquared(goalPosition) < 1e-4 &&
      cameraTarget.distanceToSquared(goalTarget) < 1e-4;
    if (!drawn) {
      drawn = true;
      onFirstFrame?.();
    }
    snap = false;
  }

  const onContextLost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(frameId);
    frameId = 0;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const start = () => {
    if (frameId) return;
    lastTime = performance.now();
    frameId = requestAnimationFrame(frame);
  };
  start();

  return {
    /** Stops drawing, for while a popup covers the page. */
    setPaused(paused) {
      if (!paused) return start();
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
    /** Jumps instead of easing, and stills the sea. */
    setReducedMotion(value) {
      reducedMotion = value;
    },
    /**
     * Hands the character to the visitor, starting where the scroll walk has
     * it, or hands it back to the scroll, which puts it back on the walk.
     */
    setExploring(value) {
      if (value === exploring) return;
      exploring = value;
      held.clear();
      layer.dataset.exploring = String(value);
      if (value) placeExplorer();
      else {
        setActivity(null);
        setNear(null);
      }
    },
    /**
     * Exploring: sits by the "campfire" (walking over to its seat first), or
     * on a beach, gets ready to skip stones ("skipping"), out over the open
     * water. onActivity hears once he's there.
     */
    startActivity(id) {
      if (!exploring || activity === id) return;
      if (id === "skipping") {
        const heading = world.beachAt(explorer.x, explorer.z);
        if (!heading) return;
        explorer.route = [];
        skipFrom = world.groundAt(explorer.x, explorer.z);
        skipHeading = heading;
        setActivity("skipping");
        return;
      }
      if (!world.campfire) return;
      const [x, , z] = world.campfire.seat;
      explorer.route = [...world.routeTo([explorer.x, explorer.z], [x, z]), [x, z]];
      headingTo = id;
    },
    /** Stops what the character is doing at a spot (gets up from the fire). */
    stopActivity() {
      setActivity(null);
    },
    /** On a beach: whether he's winding up while the meter runs. */
    setAiming(value) {
      aiming = value;
    },
    /**
     * On a beach: swings and throws a stone meant to skip `skips` times.
     * `handlers` hear each skip and the end (skipping.js).
     */
    throwStone(skips, handlers) {
      if (activity !== "skipping") return;
      aiming = false;
      throwing = THROW_SECONDS;
      if (reducedMotion) world.skipping.throwStone(skipFrom, skipHeading, skips, 0, true, handlers);
      else release = { skips, handlers };
    },
    /** Exploring: walks the character to the ground under a point on screen. */
    walkTo(clientX, clientY) {
      if (!exploring) return;
      setActivity(null);
      tap.set((clientX / size[0]) * 2 - 1, 1 - (clientY / size[1]) * 2);
      raycaster.setFromCamera(tap, camera);
      const { origin, direction } = raycaster.ray;
      if (direction.y >= 0) return;
      const reach = (TAP_HEIGHT - origin.y) / direction.y;
      const to = world.pick(raycaster) ?? [origin.x + direction.x * reach, origin.z + direction.z * reach];
      explorer.route = world.routeTo([explorer.x, explorer.z], to);
    },
    dispose() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      world?.dispose();
      character.dispose();
      dither.dispose();
      renderer.dispose();
    },
  };
}
