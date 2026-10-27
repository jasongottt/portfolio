import * as THREE from "three";

/**
 * Little puffs where Jason's feet land: a few flecks kicked up, shrinking
 * away as they fall. They're drawn in real colors, which the dither leaves as
 * they are (dither.js), a little paler than the ground they're kicked from so
 * they don't dither into it: dust off the sand, stone and planks, bits of
 * grass, leaves where they've fallen.
 */

// Flecks per puff, how many can be out at once, how long one lasts, and its
// size in cells.
const FLECKS = 6;
const POOL = 60;
const SECONDS = 0.55;
const SIZE = 0.12;
const FALL = 6.4;

/**
 * Puffs colored by the ground: `colors` maps "sand", "grass", "leaves",
 * "stone" and "plank" to the colors its flecks pick from.
 */
export function createFootsteps({ colors }) {
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geometry, material, POOL);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const palettes = Object.fromEntries(Object.entries(colors).map(([kind, list]) => [kind, list.map((hex) => new THREE.Color(hex))]));
  // Each fleck: its start, velocity and birth.
  const flecks = Array.from({ length: POOL }, () => ({ born: -1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }));
  let next = 0;
  const matrix = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < POOL; i++) {
    mesh.setMatrixAt(i, hidden);
    mesh.setColorAt(i, palettes.sand[0]);
  }

  return {
    objects: [mesh],
    /** A puff at [x, y, z] (the ground under a foot) of ground `kind`, at `seconds`. */
    puff([x, y, z], kind, seconds) {
      const palette = palettes[kind] ?? palettes.sand;
      for (let k = 0; k < FLECKS; k++) {
        const i = next;
        next = (i + 1) % POOL;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.5;
        Object.assign(flecks[i], {
          born: seconds,
          x,
          y: y + 0.03,
          z,
          vx: Math.cos(angle) * speed,
          vy: 1.1 + Math.random() * 0.8,
          vz: Math.sin(angle) * speed,
        });
        mesh.setColorAt(i, palette[Math.floor(Math.random() * palette.length)]);
      }
      mesh.instanceColor.needsUpdate = true;
    },
    /** Moves the flecks along to `seconds`: up, out and down, shrinking away. */
    update(seconds) {
      let live = false;
      flecks.forEach((fleck, i) => {
        const age = seconds - fleck.born;
        if (fleck.born < 0 || age < 0 || age > SECONDS) {
          if (fleck.born >= 0) {
            fleck.born = -1;
            mesh.setMatrixAt(i, hidden);
            live = true;
          }
          return;
        }
        live = true;
        // In the air until it lands where it started, then at rest there.
        const flight = Math.min(age, (2 * fleck.vy) / FALL);
        const left = 1 - age / SECONDS;
        matrix.makeScale(left, left, left);
        matrix.setPosition(
          fleck.x + fleck.vx * flight,
          fleck.y + fleck.vy * flight - (FALL / 2) * flight * flight,
          fleck.z + fleck.vz * flight
        );
        mesh.setMatrixAt(i, matrix);
      });
      if (live) mesh.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
