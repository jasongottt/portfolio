import * as THREE from "three";
import { landCode } from "./dither";

/**
 * A campfire in a ring of stones, with a log beside it to sit on: flames
 * that flicker, embers that rise, and a warm light on the ground around it.
 * Flames and embers are accents, drawn
 * in their real colors; the light is tinted, which only scales each code
 * color's own channel (dither.js), so the ground under it just brightens
 * along its ramp.
 */

const FLAME = "#ff6a1f";
const FLAME_CORE = "#ffd23c";
const EMBER = "#ffb347";
const LIGHT = 0xffb27a;
// The light's intensity, and its reach in cells. It falls off linearly, for
// a soft pool rather than a hot spot.
const GLOW = 1.8;
const GLOW_REACH = 6;
const EMBERS = 9;
// Embers rise this high, in cells, over EMBER_SECONDS.
const EMBER_RISE = 1.8;
const EMBER_SECONDS = 1.6;
const STONES = 7;

/**
 * The campfire at `fire`, with its seat at `seat` ([x, y, z] each, the
 * ground under them). `forward` is the camera's view across the ground
 * (journey.js), so the seat's log can lie just behind whoever sits on it,
 * across the screen, its ends showing either side.
 * Returns the objects to add to the scene, `update()` for every frame and
 * what to dispose.
 */
export function createCampfire({ fire, seat, forward }) {
  const disposables = [];
  const keep = (thing) => {
    disposables.push(thing);
    return thing;
  };
  const lambert = (color) => keep(new THREE.MeshLambertMaterial({ color, flatShading: true }));
  const basic = (color) => keep(new THREE.MeshBasicMaterial({ color }));
  const mesh = (geometry, material, x, y, z) => {
    const part = new THREE.Mesh(keep(geometry), material);
    part.position.set(x, y, z);
    return part;
  };

  const group = new THREE.Group();
  group.position.set(...fire);

  const stone = lambert(landCode(0.55));
  for (let i = 0; i < STONES; i++) {
    const angle = (i / STONES) * Math.PI * 2;
    group.add(mesh(new THREE.DodecahedronGeometry(0.1, 0), stone, Math.cos(angle) * 0.34, 0.05, Math.sin(angle) * 0.34));
  }
  const bark = lambert(landCode(0.3));
  for (let i = 0; i < 3; i++) {
    const log = mesh(new THREE.BoxGeometry(0.46, 0.08, 0.08), bark, 0, 0.07, 0);
    log.rotation.set(0, (i / 3) * Math.PI, 0.18);
    group.add(log);
  }

  const flames = new THREE.Group();
  flames.position.y = 0.1;
  flames.add(
    mesh(new THREE.ConeGeometry(0.2, 0.58, 5).translate(0, 0.29, 0), basic(FLAME), 0, 0, 0),
    mesh(new THREE.ConeGeometry(0.11, 0.38, 5).translate(0, 0.19, 0), basic(FLAME_CORE), 0, 0, 0.04)
  );
  group.add(flames);

  const emberMaterial = basic(EMBER);
  const emberGeometry = keep(new THREE.BoxGeometry(0.06, 0.06, 0.06));
  const embers = Array.from({ length: EMBERS }, (_, i) => {
    const ember = new THREE.Mesh(emberGeometry, emberMaterial);
    group.add(ember);
    return { ember, phase: i / EMBERS, drift: (i * 2.39996) % (Math.PI * 2) };
  });

  const light = new THREE.PointLight(LIGHT, GLOW, GLOW_REACH, 1);
  light.position.set(0, 0.7, 0);
  group.add(light);

  // The seat: a log just behind where the character sits.
  const log = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.95, 7), bark, 0, 0, 0);
  log.rotation.set(0, 0, Math.PI / 2);
  const seatLog = new THREE.Group();
  seatLog.add(log);
  seatLog.position.set(seat[0] + forward[0] * 0.2, seat[1] + 0.15, seat[2] + forward[1] * 0.2);
  seatLog.rotation.y = Math.atan2(forward[0], forward[1]);

  return {
    objects: [group, seatLog],
    /** Moves the fire along to `seconds`; `still` (reduced motion) holds it. */
    update(seconds, still) {
      const t = still ? 0 : seconds;
      const flicker = Math.sin(t * 11) * 0.5 + Math.sin(t * 17.3 + 1) * 0.3 + Math.sin(t * 5.1 + 2) * 0.2;
      flames.scale.set(1 - flicker * 0.06, 1 + flicker * 0.2, 1 - flicker * 0.06);
      flames.rotation.y = t * 0.8;
      light.intensity = GLOW * (1 + flicker * 0.12);
      for (const { ember, phase, drift } of embers) {
        ember.visible = !still;
        const life = (t / EMBER_SECONDS + phase) % 1;
        const swirl = drift + life * 4;
        ember.position.set(Math.cos(swirl) * 0.18 * life, 0.25 + life * EMBER_RISE, Math.sin(swirl) * 0.18 * life);
        ember.scale.setScalar(1 - life);
      }
    },
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
