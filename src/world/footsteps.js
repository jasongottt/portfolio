import * as THREE from "three";
import { GRASS } from "./dither";

/**
 * Little puffs where Jason's feet land: a few flecks kicked up and settling,
 * in the ground's own code colors so they dither like the ground does (sand
 * on the beach, leaves where they've fallen, grass in the fields, dust off
 * the planks). Grass is drawn as grass (dither.js), so it has its own mesh.
 */

// Flecks per puff, how many can be in the air at once, and how long one
// lasts.
const FLECKS = 7;
const POOL = 60;
const SECONDS = 0.5;
const SIZE = 0.12;

/**
 * Puffs colored by the ground: `colors` maps "sand", "leaves", "stone" and
 * "plank" to the code colors its flecks pick from, and `grass` is grass's.
 */
export function createFootsteps({ colors, grass }) {
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const plain = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const grassy = new THREE.MeshBasicMaterial({ color: grass, ...GRASS });
  const meshes = [plain, grassy].map((material) => {
    const mesh = new THREE.InstancedMesh(geometry, material, POOL);
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < POOL; i++) mesh.setColorAt(i, new THREE.Color(1, 1, 1));
    return mesh;
  });
  // Each fleck: which mesh, its start, velocity and birth.
  const flecks = [[], []].map(() =>
    Array.from({ length: POOL }, () => ({ born: -1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }))
  );
  const next = [0, 0];
  const matrix = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  meshes.forEach((mesh) => {
    for (let i = 0; i < POOL; i++) mesh.setMatrixAt(i, hidden);
  });

  return {
    objects: meshes,
    /** A puff at [x, y, z] (the ground under a foot) of ground `kind`, at `seconds`. */
    puff([x, y, z], kind, seconds) {
      const which = kind === "grass" ? 1 : 0;
      const palette = colors[kind] ?? colors.sand;
      for (let k = 0; k < FLECKS; k++) {
        const i = next[which];
        next[which] = (i + 1) % POOL;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.5;
        Object.assign(flecks[which][i], {
          born: seconds,
          x,
          y: y + 0.03,
          z,
          vx: Math.cos(angle) * speed,
          vy: 1.1 + Math.random() * 0.8,
          vz: Math.sin(angle) * speed,
        });
        if (which === 0) meshes[0].setColorAt(i, palette[Math.floor(Math.random() * palette.length)]);
      }
      if (which === 0) meshes[0].instanceColor.needsUpdate = true;
    },
    /** Moves the flecks along to `seconds`: up, out and down, shrinking away. */
    update(seconds) {
      meshes.forEach((mesh, which) => {
        let live = false;
        flecks[which].forEach((fleck, i) => {
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
          const left = 1 - age / SECONDS;
          matrix.makeScale(left, left, left);
          matrix.setPosition(fleck.x + fleck.vx * age, fleck.y + fleck.vy * age - 3.2 * age * age, fleck.z + fleck.vz * age);
          mesh.setMatrixAt(i, matrix);
        });
        if (live) mesh.instanceMatrix.needsUpdate = true;
      });
    },
    dispose() {
      geometry.dispose();
      plain.dispose();
      grassy.dispose();
    },
  };
}
