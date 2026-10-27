import * as THREE from "three";
import { createCampfire } from "./campfire";
import { GRASS, GRASS_ALPHA, LITTER_ALPHA, foliageCode, landCode, seaCode } from "./dither";
import { FOLIAGE_RAMP, GOLD, GRASS_RAMP, LAND_RAMP, MINT } from "./dusk";
import { groundAim } from "./journey";
import { createFootsteps } from "./footsteps";
import { createLeafPiles } from "./leafPiles";
import { createSkipping } from "./skipping";
import { distanceField, gridPath, hopLine, nearestOpen, parseLand, pathCells, pathLine, route } from "./mapGraph";
import { landBounds } from "./nameplate";
import { LANDMARK_SPOTS, beachHeading, campfireSeat, landmarkOffset, secretCell, walkableGrid } from "./walkable";

/**
 * The world for one layout of worldMap.js: islands raised from the land
 * grid in autumn: green fields patched with fallen leaves, terraced ridges,
 * red and orange trees among dark green evergreens, pumpkins, rocks, piles
 * of leaves to kick through (leafPiles.js) and falling leaves; a moving sea
 * with lighter shallows; a sky; a landmark per stage; a campfire
 * (campfire.js); beaches to skip stones from (skipping.js); and stepping
 * stones, plank bridges and lanterns along the paths. One world unit is one
 * grid cell. No React.
 *
 * All the scattering (ridges, trees, rocks, lanterns) is hashed from cell
 * positions, so the islands come out the same on every load.
 */

const WATER_DEPTH = -1.2;
// The sea floor one and two cells out from the coast, shelving gently so the
// shoreline is a smooth line rather than a cliff.
const SHELF_DEPTHS = [-0.45, -0.95];
const PLANK_HEIGHT = 0.36;
// Ridge terraces along the middle of each stroke: how many, and how tall.
const TERRACES = 3;
const TERRACE_HEIGHT = 0.7;
// Share of eligible cells that get a tree, or a rock.
const TREE_DENSITY = 0.18;
const ROCK_DENSITY = 0.07;
const PUMPKIN_DENSITY = 0.02;
// Share of grass tufts still green.
const GREEN_TUFTS = 0.9;
// Share of trees that are evergreens; the rest are in autumn colors.
const EVERGREENS = 0.3;
// Crimson, orange and gold, as foliage codes.
const LEAF_CODES = [0.7, 1, 1.35];
// Dust kicked up by footsteps, paler than any ground (footsteps.js).
const DUST = "#ffdfba";
// Grass tufts per grassy cell, at most.
const TUFTS = 3;
// Falling leaves: one per this many cells, dropping from this high.
const CELLS_PER_LEAF = 9;
const FALL_HEIGHT = 9;
// Pumpkins are accents, drawn in their real colors.
const PUMPKIN = "#e8822e";
const PUMPKIN_STEM = "#6b8f3a";
// Shallows fade out this many cells from the coast.
const SHALLOWS = 2.5;
// The sea sheet: this many segments a side, about SEA_DETAIL units apart
// around the islands and stretching wider toward the horizon, where the fog
// hides the facets.
const SEA_SEGMENTS = 96;
const SEA_DETAIL = 2;
// A lantern on every this-many bridge planks.
const LANTERN_EVERY = 3;
const LANDMARK_SCALE = 1.6;
// The secret's bottle: pale glass, an accent drawn in its real color.
const BOTTLE_GLASS = "#cfe3ff";
// Share of round trees with a pile of leaves beside them, this far out.
const PILE_SHARE = 0.3;
const PILE_OFFSET = 0.8;
// The walk passes through a pile on each leg, at least this many cells from
// either end.
const PILE_CLEARANCE = 3;
// Bare earth this far around the campfire, which its light warms.
const HEARTH = 1.4;
// The sea's waves, along x (a sine) and z (a cosine): [frequency, speed,
// height]. The sea's vertex shader moves by them, and waveAt() matches it.
const WAVE_X = [0.35, 0.9, 0.12];
const WAVE_Z = [0.5, 0.7, 0.1];
const waveAt = (x, z, t) =>
  Math.sin(x * WAVE_X[0] + t * WAVE_X[1]) * WAVE_X[2] + Math.cos(z * WAVE_Z[0] + t * WAVE_Z[1]) * WAVE_Z[2];
const glsl = (n) => n.toFixed(2);

function hash(x, y, seed = 0) {
  let h = (Math.imul(x, 2246822519) + Math.imul(y, 3266489917) + Math.imul(seed, 374761393)) | 0;
  h = Math.imul(h ^ (h >>> 15), 668265263);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

// Smooth value noise on a `size`-cell lattice, in [0, 1).
function noise(x, y, size, seed) {
  const gx = x / size;
  const gy = y / size;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const smooth = (t) => t * t * (3 - 2 * t);
  const tx = smooth(gx - x0);
  const ty = smooth(gy - y0);
  const top = hash(x0, y0, seed) * (1 - tx) + hash(x0 + 1, y0, seed) * tx;
  const bottom = hash(x0, y0 + 1, seed) * (1 - tx) + hash(x0 + 1, y0 + 1, seed) * tx;
  return top * (1 - ty) + bottom * ty;
}

// Low boxes and cones per landmark icon (pixelArt.js names), in landmark units.
function landmarkParts(icon, { body, mint, gold }) {
  const box = (w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    return mesh;
  };
  const cone = (radius, height, material, x, y, z, sides = 4) => {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, sides), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.PI / 4;
    return mesh;
  };

  switch (icon) {
    case "house":
      return [box(1.4, 1, 1.2, body, 0, 0.5, 0), cone(1.2, 0.9, body, 0, 1.45, 0), box(0.3, 0.3, 0.05, gold, -0.35, 0.55, 0.62)];
    case "tower":
      return [box(0.8, 3.2, 0.8, body, 0, 1.6, 0), cone(0.75, 1.1, body, 0, 3.75, 0), box(0.3, 0.35, 0.82, gold, 0, 2.6, 0)];
    case "computer":
      return [box(1.6, 1.1, 0.25, body, 0, 1.15, 0), box(1.3, 0.8, 0.05, mint, 0, 1.15, 0.14), box(0.25, 0.6, 0.25, body, 0, 0.3, 0)];
    case "letter":
      // A mailbox, flag up.
      return [box(0.2, 1, 0.2, body, 0, 0.5, 0), box(0.6, 0.55, 1, body, 0, 1.25, 0), box(0.05, 0.35, 0.3, gold, 0.33, 1.5, 0.2)];
    case "scroll":
      return [box(0.9, 1.2, 0.12, body, 0, 0.7, 0), box(0.6, 0.06, 0.13, gold, 0, 0.95, 0), box(0.6, 0.06, 0.13, gold, 0, 0.7, 0)];
    case "ship":
      return [box(2, 0.45, 0.8, body, 0, 0.25, 0), box(0.1, 2.4, 0.1, body, 0, 1.5, 0), cone(0.75, 1.8, mint, 0.45, 1.6, 0, 3)];
    case "ring": {
      const posts = [-0.9, 0.9].flatMap((x) => [-0.9, 0.9].map((z) => box(0.12, 0.9, 0.12, gold, x, 0.75, z)));
      return [box(2, 0.3, 2, body, 0, 0.15, 0), ...posts, box(1.8, 0.05, 0.05, mint, 0, 0.7, 0.9), box(1.8, 0.05, 0.05, mint, 0, 0.7, -0.9)];
    }
    default:
      throw new Error(`No landmark for icon "${icon}"`);
  }
}

/**
 * Builds the world for `map.layouts[layoutName]`. `stops` are the stage ids
 * the character walks between, in order. Returns the scene plus what the
 * frame loop needs: the land's bounds, the scroll walk, each landmark's
 * anchor (its middle) and foot points, what Explore mode needs to walk
 * anywhere, and tick() to move the sea, the leaves, the fire, a thrown
 * stone and the secret's glint.
 */
export function buildWorld(map, layoutName, stops) {
  const layout = map.layouts[layoutName];
  const land = parseLand(layout.land);
  const { cols, rows } = land;
  const coast = distanceField(land.isLand, cols, rows);
  const offshore = distanceField((col, row) => !land.isLand(col, row), cols, rows);
  const toWorld = ([col, row]) => [col - cols / 2 + 0.5, 0, row - rows / 2 + 0.5];
  // The cell a point between cells falls in.
  const cellAt = ([col, row]) => [Math.round(col), Math.round(row)];
  const cellKey = (col, row) => row * cols + col;

  // Cells near a path or landmark stay clear: no ridges, trees or rocks.
  const pathCellsAll = map.paths.flatMap((path) => pathCells(layout, path));
  const landmarkCells = Object.values(layout.stages).flatMap(([col, row]) =>
    LANDMARK_SPOTS.map(([dx, dz]) => [Math.round(col + dx), Math.round(row + dz)])
  );
  const nearPath = new Set();
  const clear = new Set();
  const mark = (set, cells, reach) => {
    for (const [col, row] of cells)
      for (let dr = -reach; dr <= reach; dr++)
        for (let dc = -reach; dc <= reach; dc++) set.add(cellKey(col + dc, row + dr));
  };
  mark(nearPath, pathCellsAll, 2);
  mark(clear, pathCellsAll, 1);
  mark(clear, landmarkCells, 1);
  mark(clear, Object.values(layout.stages), 1);
  const secret = secretCell(map, layout);
  mark(clear, [secret], 1);
  // The campfire gets a flat clearing.
  if (layout.campfire) {
    mark(clear, [layout.campfire], 2);
    mark(nearPath, [layout.campfire], 2);
  }

  // Islands rise from the beach to a shoulder a couple of cells in, then,
  // along the middle of each stroke, to terraced ridges.
  const cellHeight = (col, row) => {
    if (!land.isLand(col, row)) return SHELF_DEPTHS[offshore(col, row) - 1] ?? WATER_DEPTH;
    const inland = coast(col, row);
    const base = 0.5 + 1.2 * Math.min(1, (inland - 1) / 2);
    if (inland < 3 || nearPath.has(cellKey(col, row))) return base;
    const terrace = Math.floor(noise(col, row, 5, 1) * TERRACES);
    return base + terrace * TERRACE_HEIGHT;
  };
  function heightAt(x, z) {
    const gx = x + cols / 2 - 0.5;
    const gz = z + rows / 2 - 0.5;
    const c0 = Math.floor(gx);
    const r0 = Math.floor(gz);
    const tx = gx - c0;
    const tz = gz - r0;
    const top = cellHeight(c0, r0) * (1 - tx) + cellHeight(c0 + 1, r0) * tx;
    const bottom = cellHeight(c0, r0 + 1) * (1 - tx) + cellHeight(c0 + 1, r0 + 1) * tx;
    return top * (1 - tz) + bottom * tz;
  }
  // Where feet go: the ground, or the planks over water.
  const groundAt = (cell) => {
    const point = toWorld(cell);
    point[1] = Math.max(PLANK_HEIGHT + 0.08, heightAt(point[0], point[2]));
    return point;
  };

  const scene = new THREE.Scene();
  const disposables = [];
  const keep = (thing) => {
    disposables.push(thing);
    return thing;
  };

  const fogColor = seaCode(0.14);
  scene.background = fogColor;
  scene.fog = new THREE.Fog(fogColor, 40, 180);

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-25, 40, 35);
  scene.add(sun, new THREE.HemisphereLight(0xffffff, 0x333333, 0.7));

  // Trees: dark green evergreens among red, orange and gold round trees. Rocks
  // on the beaches and in the shallows. Tufts and pumpkins in the fields.
  const pines = [];
  const maples = [];
  const rocks = [];
  const tufts = [];
  const greenTufts = [];
  const pumpkins = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (clear.has(cellKey(col, row))) continue;
      const roll = hash(col, row, 7);
      const onLand = land.isLand(col, row);
      const spot = {
        x: col - cols / 2 + 0.5 + (hash(col, row, 8) - 0.5) * 0.6,
        z: row - rows / 2 + 0.5 + (hash(col, row, 9) - 0.5) * 0.6,
        size: 0.75 + hash(col, row, 10) * 0.5,
        turn: hash(col, row, 11) * Math.PI * 2,
      };
      if (onLand && coast(col, row) >= 2) {
        for (let i = 0; i < TUFTS; i++) {
          if (hash(col, row, 20 + i) < 0.5) continue;
          (hash(col, row, 65 + i) < GREEN_TUFTS ? greenTufts : tufts).push({
            x: col - cols / 2 + hash(col, row, 30 + i),
            z: row - rows / 2 + hash(col, row, 40 + i),
            size: 0.8 + hash(col, row, 50 + i) * 0.6,
            turn: hash(col, row, 60 + i) * Math.PI,
          });
        }
        if (roll >= TREE_DENSITY && roll < TREE_DENSITY + PUMPKIN_DENSITY) pumpkins.push(spot);
      }
      if (onLand && coast(col, row) >= 2 && roll < TREE_DENSITY) {
        if (hash(col, row, 12) < EVERGREENS) pines.push(spot);
        else maples.push({ ...spot, leaves: LEAF_CODES[Math.floor(hash(col, row, 13) * LEAF_CODES.length)] });
      } else if ((onLand ? coast(col, row) === 1 : offshore(col, row) <= 2) && roll < ROCK_DENSITY) {
        rocks.push(spot);
      }
    }
  }
  // Fallen leaves lie under the round trees: those cells and the ones around.
  // Some of the trees have a pile beside them, too.
  const leafy = new Set();
  const piles = [];
  for (const { x, z } of maples) {
    const col = Math.round(x + cols / 2 - 0.5);
    const row = Math.round(z + rows / 2 - 0.5);
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dc * dr === 0) leafy.add(cellKey(col + dc, row + dr));
    if (hash(col, row, 70) >= PILE_SHARE) continue;
    const angle = hash(col, row, 71) * Math.PI * 2;
    const pile = {
      x: x + Math.cos(angle) * PILE_OFFSET,
      z: z + Math.sin(angle) * PILE_OFFSET,
      size: 0.8 + hash(col, row, 72) * 0.35,
      turn: hash(col, row, 73) * Math.PI * 2,
    };
    const at = [Math.round(pile.x + cols / 2 - 0.5), Math.round(pile.z + rows / 2 - 0.5)];
    if (land.isLand(...at) && coast(...at) >= 2 && !clear.has(cellKey(...at))) piles.push(pile);
  }

  const hearth = layout.campfire && toWorld(layout.campfire);

  // Terrain: a faceted sheet, two triangles' worth of detail per cell.
  const terrain = keep(new THREE.PlaneGeometry(cols, rows, cols * 2, rows * 2).rotateX(-Math.PI / 2).toNonIndexed());
  const positions = terrain.attributes.position;
  // RGBA: alpha marks green grass and fallen leaves (dither.js).
  const colors = new Float32Array(positions.count * 4).fill(1);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    let y = heightAt(x, z);
    if (y > 0) y += (hash(Math.round(x * 2), Math.round(z * 2)) - 0.5) * 0.12;
    positions.setY(i, y);
  }
  terrain.computeVertexNormals();
  // One color per face, so no triangle blends two codes (see dither.js).
  for (let i = 0; i < positions.count; i += 3) {
    const corners = [positions.getY(i), positions.getY(i + 1), positions.getY(i + 2)];
    const y = (corners[0] + corners[1] + corners[2]) / 3;
    const x = (positions.getX(i) + positions.getX(i + 1) + positions.getX(i + 2)) / 3;
    const z = (positions.getZ(i) + positions.getZ(i + 1) + positions.getZ(i + 2)) / 3;
    // Wet sand under the water, bright beach, pale stone on the highest
    // ridges, and everywhere in between, green grass, with fallen leaves
    // under the round trees. A face counts as beach if any corner is above
    // the water, so the shoreline is one band rather than a zigzag of
    // sand and beach triangles. Terrace slopes take the field's color too
    // (the light shades them): at this size, rock-colored slopes read as
    // stray dark specks. Bare earth around the campfire.
    const bare = hearth && Math.hypot(x - hearth[0], z - hearth[2]) < HEARTH;
    const field = !bare && !(y < 0.75 || y > 2.8);
    const cell = cellKey(Math.round(x + cols / 2 - 0.5), Math.round(z + rows / 2 - 0.5));
    const green = field && !leafy.has(cell);
    const patchy = (noise(x + cols, z + rows, 3, 20) - 0.5) * 0.4;
    const [channel, brightness] =
      bare ? [0, 0.5]
      : Math.max(...corners) < 0.15 ? [0, 0.25]
      : y < 0.75 ? [0, 0.92]
      : y > 2.8 ? [0, 0.86]
      : green ? [1, 0.85 + patchy]
      : [1, 0.95 + patchy];
    for (let k = 0; k < 3; k++) {
      const at = (i + k) * 4;
      colors[at] = colors[at + 1] = colors[at + 2] = 0;
      colors[at + channel] = brightness;
      colors[at + 3] = green ? GRASS_ALPHA : field ? LITTER_ALPHA : 1;
    }
  }
  terrain.setAttribute("color", new THREE.BufferAttribute(colors, 4));
  const ground = new THREE.Mesh(
    terrain,
    keep(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, blending: THREE.NoBlending }))
  );
  scene.add(ground);

  // Sea: a wide sheet whose vertex shader moves the waves. Flat shading
  // works the facet normals out per pixel, so the waves light correctly.
  const time = { value: 0 };
  const seaSize = Math.max(cols, rows) * 3 + 120;
  const seaMaterial = keep(new THREE.MeshLambertMaterial({ color: seaCode(0.55), flatShading: true }));
  // How shallow the water is at each cell, 1 at the coast fading to 0, which
  // the sea's fragment shader samples to lighten the water near land.
  const shallowData = new Uint8Array(cols * rows * 4);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const shallow = land.isLand(col, row) ? 1 : Math.max(0, 1 - (offshore(col, row) - 1) / SHALLOWS);
      shallowData[((rows - 1 - row) * cols + col) * 4] = Math.round(shallow * 255);
    }
  }
  const shallows = keep(new THREE.DataTexture(shallowData, cols, rows));
  shallows.magFilter = THREE.LinearFilter;
  shallows.minFilter = THREE.LinearFilter;
  shallows.needsUpdate = true;
  seaMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.uniforms.uShallows = { value: shallows };
    shader.uniforms.uGrid = { value: new THREE.Vector2(cols, rows) };
    shader.vertexShader = `uniform float uTime;\nuniform vec2 uGrid;\nvarying vec2 vShallowUv;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vShallowUv = vec2(position.x / uGrid.x + 0.5, 0.5 - position.z / uGrid.y);
      transformed.y += sin(position.x * ${glsl(WAVE_X[0])} + uTime * ${glsl(WAVE_X[1])}) * ${glsl(WAVE_X[2])}
        + cos(position.z * ${glsl(WAVE_Z[0])} + uTime * ${glsl(WAVE_Z[1])}) * ${glsl(WAVE_Z[2])};`
    );
    shader.fragmentShader = `uniform sampler2D uShallows;\nvarying vec2 vShallowUv;\n${shader.fragmentShader}`.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      `vec4 diffuseColor = vec4( diffuse, opacity );
      vec2 inGrid = step(vec2(0.0), vShallowUv) * step(vShallowUv, vec2(1.0));
      diffuseColor.b += texture2D(uShallows, vShallowUv).r * 0.32 * inGrid.x * inGrid.y;`
    );
  };
  const seaGeometry = keep(new THREE.PlaneGeometry(seaSize, seaSize, SEA_SEGMENTS, SEA_SEGMENTS).rotateX(-Math.PI / 2));
  {
    // Spread the segments: x = half * (a*u + (1 - a)*u^3) for u in [-1, 1],
    // spaced SEA_DETAIL apart at the middle and wider toward the edges.
    const half = seaSize / 2;
    const a = Math.min(1, (SEA_DETAIL * SEA_SEGMENTS) / seaSize);
    const spread = (v) => {
      const u = v / half;
      return half * (a * u + (1 - a) * u * u * u);
    };
    const sea = seaGeometry.attributes.position;
    for (let i = 0; i < sea.count; i++) sea.setXYZ(i, spread(sea.getX(i)), sea.getY(i), spread(sea.getZ(i)));
  }
  scene.add(new THREE.Mesh(seaGeometry, seaMaterial));

  // Sky: a dome that glows warm at the horizon and darkens overhead. It
  // follows the camera (see `sky` below), so the horizon never comes closer.
  const skyGeometry = keep(new THREE.SphereGeometry(400, 24, 60));
  const skyColors = new Float32Array(skyGeometry.attributes.position.count * 3);
  for (let i = 0; i < skyGeometry.attributes.position.count; i++) {
    const up = skyGeometry.attributes.position.getY(i) / 400;
    const color =
      up < 0 ? fogColor.clone() : up < 0.07 ? landCode(0.75 - up * 5) : seaCode(Math.max(0.06, 0.32 - up * 0.5));
    color.toArray(skyColors, i * 3);
  }
  skyGeometry.setAttribute("color", new THREE.BufferAttribute(skyColors, 3));
  const sky = new THREE.Mesh(
    skyGeometry,
    keep(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }))
  );
  sky.renderOrder = -1;
  scene.add(sky);

  // Landmarks.
  const materials = {
    body: keep(new THREE.MeshLambertMaterial({ color: landCode(0.95), flatShading: true })),
    mint: keep(new THREE.MeshLambertMaterial({ color: MINT, emissive: 0x3a9c6e, flatShading: true })),
    gold: keep(new THREE.MeshLambertMaterial({ color: GOLD, emissive: 0xa4741e, flatShading: true })),
  };
  const landmarks = map.stages.map((stage) => {
    const group = new THREE.Group();
    group.add(...landmarkParts(stage.icon, materials));
    group.traverse((child) => child.geometry && keep(child.geometry));
    const [col, row] = layout.stages[stage.id];
    const [dx, dz] = landmarkOffset(land, [col, row]);
    const [x, , z] = toWorld([col + dx, row + dz]);
    const y = Math.max(0, heightAt(x, z));
    group.position.set(x, y, z);
    group.scale.setScalar(LANDMARK_SCALE);
    scene.add(group);
    return { stage, anchor: [x, y + 1.4 * LANDMARK_SCALE, z], foot: [x, y, z], size: 2.4 * LANDMARK_SCALE };
  });

  // Along each path's line, about a cell apart: planks where it crosses
  // water, turned across it, and a stepping stone every other cell on land.
  const planks = [];
  const stones = [];
  for (const path of map.paths) {
    const line = pathLine(layout, path, path[0], 1);
    line.forEach((point, i) => {
      if (!land.isLand(...cellAt(point))) {
        const [a, b] = [line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]];
        planks.push({ point, heading: Math.atan2(b[1] - a[1], b[0] - a[0]) });
      } else if (i % 2 === 1) {
        stones.push(point);
      }
    });
  }
  // `colorOf`, if given, colors each instance (multiplying the material's).
  const instanced = (geometry, material, items, place, colorOf) => {
    const mesh = new THREE.InstancedMesh(keep(geometry), material, items.length);
    const matrix = new THREE.Matrix4();
    items.forEach((item, i) => {
      mesh.setMatrixAt(i, place(matrix, item));
      if (colorOf) mesh.setColorAt(i, colorOf(item));
    });
    scene.add(mesh);
    return mesh;
  };
  instanced(new THREE.BoxGeometry(0.78, 0.14, 1.3), keep(new THREE.MeshLambertMaterial({ color: landCode(0.48), flatShading: true })), planks, (matrix, { point, heading }) => {
    const [x, , z] = toWorld(point);
    return matrix.makeRotationY(-heading).setPosition(x, PLANK_HEIGHT, z);
  });
  instanced(new THREE.BoxGeometry(0.34, 0.12, 0.34), keep(new THREE.MeshLambertMaterial({ color: landCode(0.99), flatShading: true })), stones, (matrix, point) => {
    const [x, , z] = toWorld(point);
    return matrix.makeTranslation(x, heightAt(x, z) + 0.05, z);
  });

  const scaled = new THREE.Vector3();
  const turned = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const placeScattered = (lift) => (matrix, { x, z, size, turn }) =>
    matrix.compose(
      new THREE.Vector3(x, Math.max(0, heightAt(x, z)) + lift * size, z),
      turned.setFromAxisAngle(up, turn),
      scaled.setScalar(size)
    );
  const lambert = (color) => keep(new THREE.MeshLambertMaterial({ color, flatShading: true }));
  const bark = lambert(landCode(0.3));
  // Evergreens are drawn as grass (dither.js), darker than the fields.
  const needles = keep(new THREE.MeshLambertMaterial({ color: foliageCode(0.55), flatShading: true, ...GRASS }));
  instanced(new THREE.ConeGeometry(0.45, 1.6, 5).translate(0, 0.8, 0), needles, pines, placeScattered(0.1));
  instanced(new THREE.BoxGeometry(0.12, 0.8, 0.12).translate(0, 0.4, 0), bark, maples, placeScattered(0));
  instanced(
    new THREE.IcosahedronGeometry(0.55, 0).translate(0, 1.05, 0),
    lambert(0xffffff),
    maples,
    placeScattered(0),
    ({ leaves }) => foliageCode(leaves)
  );
  const tuftGeometry = new THREE.ConeGeometry(0.07, 0.34, 3).translate(0, 0.17, 0);
  instanced(tuftGeometry, lambert(foliageCode(1.45)), tufts, placeScattered(0));
  instanced(
    tuftGeometry,
    keep(new THREE.MeshLambertMaterial({ color: foliageCode(1.2), flatShading: true, ...GRASS })),
    greenTufts,
    placeScattered(0)
  );

  // Pumpkins in the fields, and a couple by the house.
  const house = landmarks.find(({ stage }) => stage.icon === "house");
  if (house) {
    const [hx, , hz] = house.anchor;
    pumpkins.push({ x: hx + 1.1, z: hz + 0.8, size: 1.2, turn: 0 }, { x: hx + 1.6, z: hz + 0.1, size: 0.9, turn: 1 });
  }
  const pumpkinGeometry = new THREE.SphereGeometry(0.22, 7, 5);
  pumpkinGeometry.scale(1, 0.72, 1);
  instanced(
    pumpkinGeometry,
    keep(new THREE.MeshLambertMaterial({ color: PUMPKIN, emissive: 0x7a3a10, flatShading: true })),
    pumpkins,
    placeScattered(0.14)
  );
  instanced(new THREE.BoxGeometry(0.05, 0.12, 0.05), lambert(PUMPKIN_STEM), pumpkins, placeScattered(0.32));

  // Falling leaves, drifting down over the whole map. Unlit, so their color
  // is the foliage code itself. Each leaf's start, phase and speed ride along
  // as an instance attribute and the vertex shader moves it, so the leaves
  // cost the CPU nothing per frame.
  const leaves = Array.from({ length: Math.round((cols * rows) / CELLS_PER_LEAF) }, (_, i) => ({
    x: (hash(i, 1, 90) - 0.5) * cols,
    z: (hash(i, 2, 90) - 0.5) * rows,
    phase: hash(i, 3, 90),
    speed: 0.5 + hash(i, 4, 90) * 0.6,
    leaves: LEAF_CODES[Math.floor(hash(i, 5, 90) * LEAF_CODES.length)],
  }));
  const leafGeometry = new THREE.PlaneGeometry(0.22, 0.15);
  leafGeometry.setAttribute(
    "aLeaf",
    new THREE.InstancedBufferAttribute(new Float32Array(leaves.flatMap(({ x, z, phase, speed }) => [x, z, phase, speed])), 4)
  );
  const leafMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  leafMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = `uniform float uTime;\nattribute vec4 aLeaf;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      float fall = ${FALL_HEIGHT.toFixed(1)};
      float fallen = mod(uTime * aLeaf.w + aLeaf.z * fall, fall);
      float sway = uTime * 1.3 + aLeaf.z * 6.2831853;
      float c1 = cos(sway), s1 = sin(sway);
      float c2 = cos(sway * 0.6), s2 = sin(sway * 0.6);
      float c3 = cos(sway * 0.3), s3 = sin(sway * 0.3);
      mat3 spin = mat3(1.0, 0.0, 0.0, 0.0, c1, s1, 0.0, -s1, c1)
        * mat3(c2, 0.0, -s2, 0.0, 1.0, 0.0, s2, 0.0, c2)
        * mat3(c3, s3, 0.0, -s3, c3, 0.0, 0.0, 0.0, 1.0);
      transformed = spin * transformed
        + vec3(aLeaf.x + sin(sway) * 0.7, fall - fallen, aLeaf.y + cos(sway * 0.7) * 0.4);`
    );
  };
  const leafMesh = instanced(leafGeometry, leafMaterial, leaves, (matrix) => matrix.identity(), ({ leaves: code }) =>
    foliageCode(code * 0.75)
  );
  // Its bounds are a single leaf at the origin; the shader spreads them out.
  leafMesh.frustumCulled = false;
  instanced(
    new THREE.DodecahedronGeometry(0.3, 0),
    keep(new THREE.MeshLambertMaterial({ color: landCode(0.55), flatShading: true })),
    rocks,
    placeScattered(0)
  );

  // Lanterns along the bridges: a post at the side away from the camera, a
  // gold lamp on top.
  const lanterns = planks
    .filter((_, i) => i % LANTERN_EVERY === 1)
    .map(({ point, heading }) => {
      const [x, , z] = toWorld(point);
      let [sideX, sideZ] = [Math.sin(heading), -Math.cos(heading)];
      if (sideX + sideZ > 0) [sideX, sideZ] = [-sideX, -sideZ];
      return [x + sideX * 0.75, z + sideZ * 0.75];
    });
  instanced(
    new THREE.BoxGeometry(0.08, 0.9, 0.08),
    keep(new THREE.MeshLambertMaterial({ color: landCode(0.3), flatShading: true })),
    lanterns,
    (matrix, [x, z]) => matrix.makeTranslation(x, PLANK_HEIGHT + 0.45, z)
  );
  instanced(new THREE.BoxGeometry(0.2, 0.2, 0.2), materials.gold, lanterns, (matrix, [x, z]) =>
    matrix.makeTranslation(x, PLANK_HEIGHT + 1, z)
  );

  // The secret: a bottle washed up on the far side of its island, lying on
  // its side, with a gold glint bobbing over it.
  const [secretX, , secretZ] = toWorld(secret);
  const secretY = Math.max(0, heightAt(secretX, secretZ));
  const bottle = new THREE.Group();
  const glass = keep(new THREE.MeshLambertMaterial({ color: BOTTLE_GLASS, emissive: 0x405070, flatShading: true }));
  const body = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 6)), glass);
  const neck = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.08, 0.16, 6).translate(0, 0.26, 0)), glass);
  const cork = new THREE.Mesh(keep(new THREE.BoxGeometry(0.07, 0.07, 0.07).translate(0, 0.37, 0)), materials.body);
  bottle.add(body, neck, cork);
  bottle.rotation.set(0, 0.6, Math.PI / 2.3);
  bottle.position.set(secretX, secretY + 0.12, secretZ);
  const glint = new THREE.Mesh(keep(new THREE.BoxGeometry(0.12, 0.12, 0.12)), materials.gold);
  glint.position.set(secretX, secretY + 0.8, secretZ);
  scene.add(bottle, glint);

  // The campfire, with its seat on the camera's side.
  let campfire = null;
  if (layout.campfire) {
    const onGround = (cell) => {
      const point = toWorld(cell);
      point[1] = Math.max(0, heightAt(point[0], point[2]));
      return point;
    };
    const fire = onGround(layout.campfire);
    const seat = onGround(campfireSeat(layout.campfire));
    campfire = { fire, seat, ...keep(createCampfire({ fire, seat, forward: groundAim.forward })) };
    scene.add(...campfire.objects);
  }

  // Explore mode: which cells can be walked, and the spots that can be
  // visited (each stage, the secret and the campfire).
  const grid = walkableGrid(map, layout);
  const cellOf = (x, z) => [Math.round(x + cols / 2 - 0.5), Math.round(z + rows / 2 - 0.5)];

  // Skipping stones, from any beach out over open water; a stone stops on
  // land or a bridge.
  const bridgeCells = new Set(pathCellsAll.map(([col, row]) => cellKey(col, row)));
  const solid = (col, row) => land.isLand(col, row) || bridgeCells.has(cellKey(col, row));
  const skipping = keep(
    createSkipping({
      isWater: (x, z) => !solid(...cellOf(x, z)),
      groundY: (x, z) => Math.max(PLANK_HEIGHT, heightAt(x, z)),
      waveAt,
    })
  );
  scene.add(...skipping.objects);
  // Puffs where Jason's feet land, lighter than the ground there.
  const footsteps = keep(
    createFootsteps({
      colors: {
        sand: [DUST, LAND_RAMP[5]],
        grass: [GRASS_RAMP[5], "#cfe08f"],
        leaves: FOLIAGE_RAMP.slice(3),
        stone: [DUST, "#e6d8ec"],
        plank: LAND_RAMP.slice(4),
      },
    })
  );
  scene.add(...footsteps.objects);
  const groundKind = (x, z) => {
    const cell = cellOf(x, z);
    if (!land.isLand(...cell)) return "plank";
    const y = heightAt(x, z);
    if (y < 0.75) return "sand";
    if (y > 2.8) return "stone";
    return leafy.has(cellKey(...cell)) ? "leaves" : "grass";
  };

  const beaches = new Map();
  const beachAt = (x, z) => {
    const cell = cellOf(x, z);
    const key = cellKey(...cell);
    if (!beaches.has(key)) beaches.set(key, beachHeading(land, solid, cell, groundAim.forward));
    return beaches.get(key);
  };
  const spots = [
    ...map.stages.map((stage) => {
      const [x, , z] = toWorld(layout.stages[stage.id]);
      return { id: stage.id, x, z, stage: true };
    }),
    { id: "secret", x: secretX, z: secretZ },
    ...(campfire ? [{ id: "campfire", x: campfire.fire[0], z: campfire.fire[2] }] : []),
  ];

  // The walk: along the paths' lines from the first stop to the last, a
  // point about every cell, and where each stop falls along it.
  const walk = [layout.stages[stops[0]]];
  const stopIndex = [0];
  for (let i = 1; i < stops.length; i++) {
    const ids = route(map, stops[i - 1], stops[i]);
    for (let j = 1; j < ids.length; j++) walk.push(...hopLine(map, layout, ids[j - 1], ids[j], 1).slice(1));
    stopIndex.push(walk.length - 1);
  }
  const walkPoints = walk.map(groundAt);

  // A pile on each leg of the walk, on land as near the middle as there is.
  for (let i = 1; i < stopIndex.length; i++) {
    const from = stopIndex[i - 1] + PILE_CLEARANCE;
    const to = stopIndex[i] - PILE_CLEARANCE;
    const middle = (from + to) / 2;
    let best = null;
    for (let j = from; j <= to; j++) {
      if (land.isLand(...cellAt(walk[j])) && (best === null || Math.abs(j - middle) < Math.abs(best - middle))) best = j;
    }
    if (best !== null) {
      const [x, , z] = toWorld(walk[best]);
      piles.push({ x, z, size: 0.95, turn: hash(...cellAt(walk[best]), 74) * Math.PI * 2 });
    }
  }
  const leafPiles = keep(createLeafPiles({ spots: piles, heightAt, time, codes: LEAF_CODES }));
  scene.add(...leafPiles.objects);

  const bounds = landBounds(layout);

  return {
    scene,
    bounds,
    landmarks,
    /** Distance along the walk, in cells, of stop `index`. */
    stopDistance: (index) => stopIndex[index],
    walkLength: walkPoints.length - 1,
    /** The point `distance` cells along the walk. */
    pointAlong(distance) {
      const at = Math.min(walkPoints.length - 1, Math.max(0, distance));
      const i = Math.min(walkPoints.length - 2, Math.floor(at));
      const t = at - i;
      const a = walkPoints[i];
      const b = walkPoints[i + 1] ?? a;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    },
    /** Where feet go at (x, z): the ground, or the planks over water. */
    groundAt: (x, z) => [x, Math.max(PLANK_HEIGHT + 0.08, heightAt(x, z)), z],
    /**
     * Where `raycaster` meets what shows there: the ground, or over water, the
     * sea's surface. [x, z], or null off the map.
     */
    pick(raycaster) {
      const hit = raycaster.intersectObject(ground, false)[0];
      if (!hit) return null;
      if (hit.point.y >= 0) return [hit.point.x, hit.point.z];
      const { origin, direction } = raycaster.ray;
      const reach = -origin.y / direction.y;
      return [origin.x + direction.x * reach, origin.z + direction.z * reach];
    },
    /** Whether Explore mode can stand at (x, z). */
    open: (x, z) => grid.isOpen(...cellOf(x, z)),
    /**
     * Points to walk through, cell by cell, from (x, z) to the walkable cell
     * nearest `to`. Empty if there's no way there.
     */
    routeTo([x, z], to) {
      const goal = nearestOpen(grid.isOpen, cols, rows, cellOf(...to));
      const cells = goal && gridPath(grid.isOpen, cellOf(x, z), goal);
      return (cells ?? []).slice(1).map((cell) => {
        const [cx, , cz] = toWorld(cell);
        return [cx, cz];
      });
    },
    /** What can be visited in Explore mode: { id, x, z, stage }, ids are stage ids, "secret" or "campfire". */
    spots,
    /** The campfire's { fire, seat } ([x, y, z] each), or null. */
    campfire: campfire && { fire: campfire.fire, seat: campfire.seat },
    /**
     * Which way to skip a stone from (x, z), a unit [x, z] out over open
     * water, or null if it isn't a beach (walkable.js).
     */
    beachAt,
    /** throwStone() and stoneAt(), where a thrown stone is in the air (skipping.js). */
    skipping,
    /** A puff of whatever the ground is, where a foot lands at [x, y, z], at `seconds`. */
    footstep(point, seconds) {
      footsteps.puff(point, groundKind(point[0], point[2]), seconds);
    },
    /**
     * Moves things along to `seconds`, the character's feet at `feet`.
     * `still` (reduced motion) hides the leaves and holds the fire.
     */
    tick(seconds, camera, still, feet) {
      time.value = seconds;
      sky.position.copy(camera.position);
      leafMesh.visible = !still;
      glint.position.y = secretY + 0.8 + Math.sin(seconds * 3) * 0.12;
      glint.rotation.y = seconds * 2;
      leafPiles.update(seconds, feet, still);
      campfire?.update(seconds, still);
      skipping.update(seconds, still);
      footsteps.update(seconds);
    },
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
