import * as THREE from "three";
import { GRASS, GRASS_ALPHA, foliageCode, landCode, seaCode } from "./dither";
import { GOLD, MINT } from "./dusk";
import { distanceField, hopCells, parseLand, pathCells, route } from "./mapGraph";

/**
 * The world for one layout of worldMap.js: islands raised from the land
 * grid in autumn: green fields patched with fallen leaves, terraced ridges,
 * red and orange trees
 * among dark green evergreens, pumpkins, rocks and falling leaves; a moving sea
 * with lighter
 * shallows; a sky; a landmark per stage; and stepping stones, plank bridges
 * and lanterns along the paths. One world unit is one grid cell. No React.
 *
 * All the scattering (ridges, trees, rocks, lanterns) is hashed from cell
 * positions, so the islands come out the same on every load.
 */

const WATER_DEPTH = -1.2;
const PLANK_HEIGHT = 0.36;
// Ridge terraces along the middle of each stroke: how many, and how tall.
const TERRACES = 3;
const TERRACE_HEIGHT = 0.7;
// Share of eligible cells that get a tree, or a rock.
const TREE_DENSITY = 0.18;
const ROCK_DENSITY = 0.07;
const PUMPKIN_DENSITY = 0.02;
// Share of the fields still green; the rest is fallen leaves.
const GREEN_FIELDS = 0.55;
// Share of grass tufts still green.
const GREEN_TUFTS = 0.75;
// Share of trees that are evergreens; the rest are in autumn colors.
const EVERGREENS = 0.3;
// Crimson, orange and gold, as foliage codes.
const LEAF_CODES = [0.7, 1, 1.35];
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
// A lantern on every this-many bridge planks.
const LANTERN_EVERY = 3;
// Landmarks stand beside their stage, back and to the right, so the
// character stands next to them rather than in front of them. Where that
// spot is water, they try the left, then straight behind.
const LANDMARK_SPOTS = [[2, -1], [-2, -1], [0, -1.6]];
const LANDMARK_SCALE = 1.6;

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
 * frame loop needs: the land's bounds, a walkable route, each landmark's
 * anchor (its middle) and foot points, and tick() to move the sea and the falling leaves.
 */
export function buildWorld(map, layoutName, stops) {
  const layout = map.layouts[layoutName];
  const land = parseLand(layout.land);
  const { cols, rows } = land;
  const coast = distanceField(land.isLand, cols, rows);
  const offshore = distanceField((col, row) => !land.isLand(col, row), cols, rows);
  const toWorld = ([col, row]) => [col - cols / 2 + 0.5, 0, row - rows / 2 + 0.5];
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

  // Islands rise from the beach to a shoulder a couple of cells in, then,
  // along the middle of each stroke, to terraced ridges.
  const cellHeight = (col, row) => {
    if (!land.isLand(col, row)) return WATER_DEPTH;
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

  // Terrain: a faceted sheet, two triangles' worth of detail per cell.
  const terrain = keep(new THREE.PlaneGeometry(cols, rows, cols * 2, rows * 2).rotateX(-Math.PI / 2).toNonIndexed());
  const positions = terrain.attributes.position;
  // RGBA: alpha marks green grass (dither.js).
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
    const y = (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 3;
    const x = (positions.getX(i) + positions.getX(i + 1) + positions.getX(i + 2)) / 3;
    const z = (positions.getZ(i) + positions.getZ(i + 1) + positions.getZ(i + 2)) / 3;
    // Wet sand, bright beach, pale stone on the highest ridges, and
    // everywhere in between, green grass patched with fallen leaves. The
    // terrace slopes take the field's color too (the light shades them):
    // at this size, rock-colored slopes read as stray dark specks.
    const field = !(y < 0.75 || y > 2.8);
    const green = field && noise(x + cols, z + rows, 4, 21) < GREEN_FIELDS;
    const patchy = (noise(x + cols, z + rows, 3, 20) - 0.5) * 0.4;
    const [channel, brightness] =
      y < 0.2 ? [0, 0.25]
      : y < 0.75 ? [0, 0.92]
      : y > 2.8 ? [0, 0.86]
      : green ? [1, 0.85 + patchy]
      : [1, 0.95 + patchy];
    for (let k = 0; k < 3; k++) {
      const at = (i + k) * 4;
      colors[at] = colors[at + 1] = colors[at + 2] = 0;
      colors[at + channel] = brightness;
      colors[at + 3] = green ? GRASS_ALPHA : 1;
    }
  }
  terrain.setAttribute("color", new THREE.BufferAttribute(colors, 4));
  scene.add(
    new THREE.Mesh(
      terrain,
      keep(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, blending: THREE.NoBlending }))
    )
  );

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
      transformed.y += sin(position.x * 0.35 + uTime * 0.9) * 0.12 + cos(position.z * 0.5 + uTime * 0.7) * 0.1;`
    );
    shader.fragmentShader = `uniform sampler2D uShallows;\nvarying vec2 vShallowUv;\n${shader.fragmentShader}`.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      `vec4 diffuseColor = vec4( diffuse, opacity );
      vec2 inGrid = step(vec2(0.0), vShallowUv) * step(vShallowUv, vec2(1.0));
      diffuseColor.b += texture2D(uShallows, vShallowUv).r * 0.32 * inGrid.x * inGrid.y;`
    );
  };
  const seaGeometry = keep(new THREE.PlaneGeometry(seaSize, seaSize, seaSize / 2, seaSize / 2).rotateX(-Math.PI / 2));
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
    const [dx, dz] =
      LANDMARK_SPOTS.find(([sx, sz]) => land.isLand(Math.round(col + sx), Math.round(row + sz))) ?? LANDMARK_SPOTS.at(-1);
    const [x, , z] = toWorld([col + dx, row + dz]);
    const y = Math.max(0, heightAt(x, z));
    group.position.set(x, y, z);
    group.scale.setScalar(LANDMARK_SCALE);
    scene.add(group);
    return { stage, anchor: [x, y + 1.4 * LANDMARK_SCALE, z], foot: [x, y, z], size: 2.4 * LANDMARK_SCALE };
  });

  // Planks where paths cross water, stones every other cell on land.
  const planks = [];
  const stones = [];
  for (const path of map.paths) {
    const cells = pathCells(layout, path);
    cells.forEach((cell, i) => {
      const [col, row] = cell;
      if (!land.isLand(col, row)) {
        const next = cells[i + 1] ?? cells[i - 1];
        planks.push({ cell, across: next[1] === row });
      } else if (i % 2 === 1) {
        stones.push(cell);
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
  instanced(new THREE.BoxGeometry(0.78, 0.14, 1.3), keep(new THREE.MeshLambertMaterial({ color: landCode(0.48), flatShading: true })), planks, (matrix, { cell, across }) => {
    const [x, , z] = toWorld(cell);
    return matrix.makeRotationY(across ? 0 : Math.PI / 2).setPosition(x, PLANK_HEIGHT, z);
  });
  instanced(new THREE.BoxGeometry(0.34, 0.12, 0.34), keep(new THREE.MeshLambertMaterial({ color: landCode(0.99), flatShading: true })), stones, (matrix, cell) => {
    const [x, , z] = toWorld(cell);
    return matrix.makeTranslation(x, heightAt(x, z) + 0.05, z);
  });

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
  // is the foliage code itself.
  const leaves = Array.from({ length: Math.round((cols * rows) / CELLS_PER_LEAF) }, (_, i) => ({
    x: (hash(i, 1, 90) - 0.5) * cols,
    z: (hash(i, 2, 90) - 0.5) * rows,
    phase: hash(i, 3, 90),
    speed: 0.5 + hash(i, 4, 90) * 0.6,
    leaves: LEAF_CODES[Math.floor(hash(i, 5, 90) * LEAF_CODES.length)],
  }));
  const leafMesh = instanced(
    new THREE.PlaneGeometry(0.22, 0.15),
    keep(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })),
    leaves,
    (matrix) => matrix.identity(),
    ({ leaves: code }) => foliageCode(code * 0.75)
  );
  const leafMatrix = new THREE.Matrix4();
  const leafPosition = new THREE.Vector3();
  const leafTurn = new THREE.Quaternion();
  const leafSpin = new THREE.Euler();
  const unit = new THREE.Vector3(1, 1, 1);
  const blowLeaves = (seconds) => {
    leaves.forEach((leaf, i) => {
      const fallen = (seconds * leaf.speed + leaf.phase * FALL_HEIGHT) % FALL_HEIGHT;
      const sway = seconds * 1.3 + leaf.phase * Math.PI * 2;
      leafPosition.set(leaf.x + Math.sin(sway) * 0.7, FALL_HEIGHT - fallen, leaf.z + Math.cos(sway * 0.7) * 0.4);
      leafTurn.setFromEuler(leafSpin.set(sway, sway * 0.6, sway * 0.3));
      leafMesh.setMatrixAt(i, leafMatrix.compose(leafPosition, leafTurn, unit));
    });
    leafMesh.instanceMatrix.needsUpdate = true;
  };
  instanced(
    new THREE.DodecahedronGeometry(0.3, 0),
    keep(new THREE.MeshLambertMaterial({ color: landCode(0.55), flatShading: true })),
    rocks,
    placeScattered(0)
  );

  // Lanterns along the bridges: a post at the side, a gold lamp on top.
  const lanterns = planks
    .filter((_, i) => i % LANTERN_EVERY === 1)
    .map(({ cell, across }) => {
      const [x, , z] = toWorld(cell);
      return across ? [x, z - 0.75] : [x - 0.75, z];
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

  // The walk: every cell from the first stop to the last, and where each
  // stop falls along it.
  const walk = [layout.stages[stops[0]]];
  const stopIndex = [0];
  for (let i = 1; i < stops.length; i++) {
    const ids = route(map, stops[i - 1], stops[i]);
    for (let j = 1; j < ids.length; j++) walk.push(...hopCells(map, layout, ids[j - 1], ids[j]).slice(1));
    stopIndex.push(walk.length - 1);
  }
  const walkPoints = walk.map(groundAt);

  const landCells = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) if (land.isLand(col, row)) landCells.push(toWorld([col, row]));
  const bounds = {
    minX: Math.min(...landCells.map((p) => p[0])),
    maxX: Math.max(...landCells.map((p) => p[0])),
    minZ: Math.min(...landCells.map((p) => p[2])),
    maxZ: Math.max(...landCells.map((p) => p[2])),
  };

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
    /** Moves things along to `seconds`. `still` (reduced motion) hides the leaves. */
    tick(seconds, camera, still) {
      time.value = seconds;
      sky.position.copy(camera.position);
      leafMesh.visible = !still;
      if (!still) blowLeaves(seconds);
    },
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
