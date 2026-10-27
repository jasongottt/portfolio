import * as THREE from "three";
import { foliageCode } from "./dither";

/**
 * Piles of fallen leaves that burst when the character walks through them:
 * the pile slumps flat and its leaves fly up and flutter down around it.
 * A while after the character has gone, the leaves gather back into a pile.
 *
 * Each thrown leaf's flight is worked out in the vertex shader from when its
 * pile burst, so a burst only costs the CPU one small attribute update.
 * Leaves, like the falling ones in scene.js, are unlit foliage codes.
 */

// Leaves thrown per pile, and how close feet have to pass, in cells.
const LEAVES = 16;
const REACH = 0.6;
// A pile slumps this flat and this much wider when it bursts, over
// SLUMP_SECONDS.
const SLUMP = [1.3, 0.3];
const SLUMP_SECONDS = 0.15;
// Seconds after a burst before a pile can gather again, once the character
// is CLEAR cells away, and how long gathering takes.
const REST_SECONDS = 6;
const CLEAR = 2.5;
const GATHER_SECONDS = 0.8;
// A thrown leaf rises about LIFT, then sinks at SINK cells a second, out to
// between REACH_OUT[0] and REACH_OUT[1] cells from its pile.
const LIFT = [1.1, 1.9];
const SINK = 0.55;
const REACH_OUT = [0.5, 1.4];

function hash(i, seed) {
  let h = (Math.imul(i, 2246822519) + Math.imul(seed, 374761393)) | 0;
  h = Math.imul(h ^ (h >>> 15), 668265263);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

// A low, lumpy mound, each face a different autumn leaf color.
function moundGeometry(codes) {
  const geometry = new THREE.IcosahedronGeometry(0.42, 1).toNonIndexed();
  geometry.scale(1, 0.62, 1).translate(0, 0.06, 0);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let face = 0; face < count / 3; face++) {
    const code = codes[Math.floor(hash(face, 1) * codes.length)] * (0.85 + hash(face, 2) * 0.3);
    for (let k = 0; k < 3; k++) colors[(face * 3 + k) * 3 + 1] = code;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute vec4 aHome;
  attribute vec4 aFly;
  attribute vec2 aTimes;
`;

const flight = /* glsl */ `
  #include <begin_vertex>
  float age = uTime - aTimes.x;
  float gathered = aTimes.y < 0.0 ? 0.0 : clamp((uTime - aTimes.y) / ${GATHER_SECONDS.toFixed(2)}, 0.0, 1.0);
  if (aTimes.x < 0.0 || age < 0.0 || gathered >= 1.0) {
    // Not thrown: out of sight under the sea floor.
    transformed = vec3(0.0, -100.0, 0.0);
  } else {
    float spread = aFly.y * (1.0 - exp(-3.0 * age));
    float rise = aFly.w * (1.0 - exp(-5.0 * age)) - ${SINK.toFixed(2)} * age;
    float ground = aHome.w - aHome.y;
    float flying = step(ground, rise);
    float turn = aFly.z * 6.2831853;
    float sway = sin(age * 5.0 + turn) * 0.2 * flying;
    // Tumbling in the air, then lying flat where it lands.
    float tumble = age * 7.0 + turn;
    float c1 = cos(tumble), s1 = sin(tumble);
    float c2 = cos(turn), s2 = sin(turn);
    mat3 yaw = mat3(c2, 0.0, -s2, 0.0, 1.0, 0.0, s2, 0.0, c2);
    mat3 spin = mat3(1.0, 0.0, 0.0, 0.0, c1, s1, 0.0, -s1, c1);
    mat3 lying = mat3(1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0);
    transformed = yaw * (flying > 0.5 ? spin : lying) * transformed * (1.0 - gathered);
    vec2 heading = vec2(cos(aFly.x), sin(aFly.x));
    transformed += vec3(
      aHome.x + heading.x * spread + heading.y * sway,
      aHome.y + max(rise, ground) + 0.03,
      aHome.z + heading.y * spread - heading.x * sway
    );
  }
`;

/**
 * Leaf piles at `spots` ({ x, z, size, turn }, in world units). `heightAt(x,
 * z)` is the ground's height, `time` the scene's shared time uniform, and
 * `codes` the foliage codes leaves come in. Returns the meshes to add to the
 * scene, `update()` to call every frame, and what to dispose.
 */
export function createLeafPiles({ spots, heightAt, time, codes }) {
  const ground = (x, z) => Math.max(0.05, heightAt(x, z));
  const piles = spots.map((spot) => ({ ...spot, y: ground(spot.x, spot.z), burstAt: -1, gatherAt: -1, shape: 0 }));

  const moundMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const mounds = new THREE.InstancedMesh(moundGeometry(codes), moundMaterial, piles.length);
  const matrix = new THREE.Matrix4();
  const turned = new THREE.Quaternion();
  const scaled = new THREE.Vector3();
  const at = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  // `slumped`: 0 a full pile, 1 flat after a burst.
  const placeMound = (i, slumped) => {
    const { x, y, z, size, turn } = piles[i];
    const wide = size * (1 + (SLUMP[0] - 1) * slumped);
    scaled.set(wide, size * (1 + (SLUMP[1] - 1) * slumped), wide);
    mounds.setMatrixAt(i, matrix.compose(at.set(x, y, z), turned.setFromAxisAngle(up, turn), scaled));
    mounds.instanceMatrix.needsUpdate = true;
  };
  piles.forEach((_, i) => placeMound(i, 0));

  // The thrown leaves: LEAVES per pile, in pile order.
  const count = piles.length * LEAVES;
  const home = new Float32Array(count * 4);
  const fly = new Float32Array(count * 4);
  const times = new Float32Array(count * 2).fill(-1);
  piles.forEach(({ x, y, z }, p) => {
    for (let k = 0; k < LEAVES; k++) {
      const i = p * LEAVES + k;
      const heading = ((k + hash(i, 3)) / LEAVES) * Math.PI * 2;
      const reach = REACH_OUT[0] + hash(i, 4) * (REACH_OUT[1] - REACH_OUT[0]);
      home.set([x, y, z, ground(x + Math.cos(heading) * reach, z + Math.sin(heading) * reach)], i * 4);
      fly.set([heading, reach, hash(i, 5), LIFT[0] + hash(i, 6) * (LIFT[1] - LIFT[0])], i * 4);
    }
  });
  const leafGeometry = new THREE.PlaneGeometry(0.24, 0.17);
  leafGeometry.setAttribute("aHome", new THREE.InstancedBufferAttribute(home, 4));
  leafGeometry.setAttribute("aFly", new THREE.InstancedBufferAttribute(fly, 4));
  const timesAttribute = new THREE.InstancedBufferAttribute(times, 2);
  timesAttribute.setUsage(THREE.DynamicDrawUsage);
  leafGeometry.setAttribute("aTimes", timesAttribute);
  const leafMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  leafMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = `${vertexShader}\n${shader.vertexShader}`.replace("#include <begin_vertex>", flight);
  };
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, count);
  for (let i = 0; i < count; i++) {
    leaves.setMatrixAt(i, matrix.identity());
    leaves.setColorAt(i, foliageCode(codes[Math.floor(hash(i, 7) * codes.length)] * 0.75));
  }
  // Its bounds are a single leaf at the origin; the shader spreads them out.
  leaves.frustumCulled = false;

  const setTimes = (p, burstAt, gatherAt) => {
    for (let k = 0; k < LEAVES; k++) times.set([burstAt, gatherAt], (p * LEAVES + k) * 2);
    timesAttribute.addUpdateRange(p * LEAVES * 2, LEAVES * 2);
    timesAttribute.needsUpdate = true;
  };

  // How far (x, z) is from the segment the feet moved along this frame.
  let lastFeet = null;
  const gapTo = (x, z, from, to) => {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const length = dx * dx + dz * dz;
    const t = length ? Math.max(0, Math.min(1, ((x - from[0]) * dx + (z - from[2]) * dz) / length)) : 0;
    return Math.hypot(x - from[0] - dx * t, z - from[2] - dz * t);
  };

  return {
    objects: [mounds, leaves],
    /**
     * Moves the piles along to `seconds`, the character's feet at `feet`.
     * `still` (reduced motion) keeps every pile whole.
     */
    update(seconds, feet, still) {
      const from = lastFeet ?? feet;
      lastFeet = feet;
      piles.forEach((pile, p) => {
        if (still) {
          if (pile.burstAt >= 0) {
            Object.assign(pile, { burstAt: -1, gatherAt: -1, shape: 0 });
            setTimes(p, -1, -1);
            placeMound(p, 0);
          }
          return;
        }
        if (pile.burstAt < 0) {
          if (gapTo(pile.x, pile.z, from, feet) > REACH) return;
          pile.burstAt = seconds;
          setTimes(p, seconds, -1);
        } else if (pile.gatherAt < 0) {
          const away = Math.hypot(feet[0] - pile.x, feet[2] - pile.z) > CLEAR;
          if (seconds - pile.burstAt > REST_SECONDS && away) {
            pile.gatherAt = seconds;
            setTimes(p, pile.burstAt, seconds);
          }
        } else if (seconds - pile.gatherAt > GATHER_SECONDS) {
          Object.assign(pile, { burstAt: -1, gatherAt: -1 });
          setTimes(p, -1, -1);
        }
        // Slumping after a burst, rising again as it gathers.
        const slumped =
          pile.burstAt < 0 ? 0
          : pile.gatherAt < 0 ? Math.min(1, (seconds - pile.burstAt) / SLUMP_SECONDS)
          : 1 - Math.min(1, (seconds - pile.gatherAt) / GATHER_SECONDS);
        if (slumped !== pile.shape) {
          pile.shape = slumped;
          placeMound(p, slumped);
        }
      });
    },
    dispose() {
      mounds.geometry.dispose();
      moundMaterial.dispose();
      leafGeometry.dispose();
      leafMaterial.dispose();
    },
  };
}
