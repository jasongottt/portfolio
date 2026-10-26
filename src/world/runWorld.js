import * as THREE from "three";
import { createCharacter } from "./character";
import { createDither } from "./dither";
import { FRAME_Y, blendPoses, followPose, journeyAt, overviewPose } from "./journey";
import { buildWorld } from "./scene";

// Screen pixels per world pixel. Phones get finer pixels, or the letters
// turn to mush on a small screen.
const pixelSizeFor = (width) => (width < 700 ? 2 : 3);
const FOV = 40;
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
 * - onLost: called if the browser takes the WebGL context away.
 */
export function runWorld({ canvas, map, stops, sections, landmarks, layer, titleBlock, surname, intro, onLost }) {
  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const dither = createDither(renderer);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1000);
  const character = createCharacter();

  let world = null;
  let layoutName = null;
  let overview = null;
  let size = [0, 0];
  let frameId = 0;
  let lastTime = 0;
  let reducedMotion = false;

  let snap = true;
  let distance = 0;
  let facing = 1;
  const cameraPosition = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const overviewPosition = new THREE.Vector3();
  const goalPosition = new THREE.Vector3();
  const goalTarget = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const right = new THREE.Vector3();
  const shown = new Map();

  const show = (element, visible) => {
    if (shown.get(element) === visible) return;
    shown.set(element, visible);
    element.style.opacity = visible ? "1" : "0";
  };

  function setLayout(name) {
    if (world) {
      world.scene.remove(character.object);
      world.dispose();
    }
    world = buildWorld(map, name, stops);
    world.scene.add(character.object);
    layoutName = name;
    snap = true;
  }

  function resize(width, height) {
    size = [width, height];
    const pixelSize = pixelSizeFor(width);
    const pixels = [Math.ceil(width / pixelSize), Math.ceil(height / pixelSize)];
    renderer.setSize(pixels[0], pixels[1], false);
    canvas.style.width = `${pixels[0] * pixelSize}px`;
    canvas.style.height = `${pixels[1] * pixelSize}px`;
    dither.setSize(pixels[0], pixels[1]);

    camera.aspect = width / height;
    frameAt(0.5);

    const name = width < height ? "tall" : "wide";
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
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

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

    // The character: eased along the walk toward its spot for this scroll.
    const journey = journeyAt(scrollY, height, spans, pageHeight, open ? height * WALK_SPAN : 0);
    const from = world.stopDistance(journey.leg);
    const goal = from + (world.stopDistance(journey.leg + 1) - from) * journey.t;
    const before = world.pointAlong(distance);
    if (snap || reducedMotion) {
      distance = goal;
    } else {
      const step = (goal - distance) * (1 - Math.exp(-WALK_RATE * delta));
      const cap = MAX_WALK_SPEED * delta;
      distance += Math.max(-cap, Math.min(cap, step));
    }
    const point = world.pointAlong(distance);
    const walking = !snap && Math.abs(goal - distance) > 0.02;

    // The camera: the follow pose and the overview, blended by the journey.
    const pulledBack = smoothstep(journey.overview);
    const pose = blendPoses(followPose(point, width / height), overview, pulledBack);
    const followX = open ? openCenter / width : 0.5;
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

    // Face the way the walk goes across the screen.
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    const across = (point[0] - before[0]) * right.x + (point[2] - before[2]) * right.z;
    if (walking && Math.abs(across) > 1e-4) facing = across < 0 ? -1 : 1;
    character.update(point, { walking, facing, delta });

    const settled =
      journey.overview >= 1 && cameraPosition.distanceTo(overviewPosition) < overviewPosition.y * 0.01;
    show(surname, settled);
    if (layer.dataset.settled !== String(settled)) layer.dataset.settled = String(settled);
    show(intro, settled && scrollY < height);
    placeLandmarks(width, height, journey.overview > 0.5);

    // Fog starts past whatever the camera is looking at, so the horizon
    // dissolves but the subject never does.
    const reach = cameraPosition.distanceTo(cameraTarget);
    world.scene.fog.near = reach + 20;
    world.scene.fog.far = reach + 150;
    world.tick(reducedMotion ? 0 : now / 1000, camera, reducedMotion);
    dither.render(world.scene, camera);
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
    dispose() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      world?.dispose();
      character.dispose();
      dither.dispose();
      renderer.dispose();
    },
  };
}
