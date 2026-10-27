import * as THREE from "three";
import { FOLIAGE_RAMP, GRASS_RAMP, LAND_RAMP, LITTER_RAMP, SEA_RAMP } from "./dusk";

/**
 * The Dusk look. The scene is drawn in code colors rather than real ones,
 * then this pass paints every pixel from a fixed palette with an ordered
 * dither:
 *   land and landmarks  brightness in red             -> LAND_RAMP
 *   autumn leaves       brightness in green           -> FOLIAGE_RAMP
 *   green grass         brightness in green, alpha    -> GRASS_RAMP
 *                       GRASS_ALPHA
 *   fallen leaves       brightness in green, alpha    -> LITTER_RAMP
 *                       LITTER_ALPHA
 *   sea and sky        brightness in blue            -> SEA_RAMP
 *   accents             any real color, i.e. red and  -> drawn as they are
 *                       green both lit
 * Lights only scale each channel (white, or tinted, like the campfire's) and
 * the fog only adds blue, so a code color's empty channels stay empty; only
 * real colors light red and green together. A
 * surface's faces each take a single code (scene.js), so no triangle blends
 * two of them into a false accent. Everything else draws fully opaque, so
 * alpha marks grass and fallen leaves however the fog shifts their color
 * (GRASS, below).
 *
 * The ramps are in dusk.js. Color management is off end to end
 * (runWorld.js), so they show exactly as written.
 */

export const landCode = (brightness) => new THREE.Color(brightness, 0, 0);
export const seaCode = (brightness) => new THREE.Color(0, 0, brightness);
export const foliageCode = (brightness) => new THREE.Color(0, brightness, 0);

// Grass is a foliage code drawn at this alpha. Material options that write
// it: without blending, an opaque material's alpha reaches the target as is.
export const GRASS_ALPHA = 0.5;
export const GRASS = { opacity: GRASS_ALPHA, blending: THREE.NoBlending };
// The ground under the autumn trees, likewise: a foliage code at this alpha.
export const LITTER_ALPHA = 0.25;

const BAYER_8 = [
  0, 48, 12, 60, 3, 51, 15, 63, 32, 16, 44, 28, 35, 19, 47, 31, 8, 56, 4, 52, 11, 59, 7, 55, 40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61, 34, 18, 46, 30, 33, 17, 45, 29, 10, 58, 6, 54, 9, 57, 5, 53, 42, 26, 38, 22, 41, 25, 37, 21,
];

const fragmentShader = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec3 landRamp[6];
  uniform vec3 foliageRamp[6];
  uniform vec3 grassRamp[6];
  uniform vec3 litterRamp[6];
  uniform vec3 seaRamp[6];
  uniform vec2 uWorld;
  uniform float uScale;

  const float bayer[64] = float[64](${BAYER_8.map((n) => `${n}.0`).join(", ")});

  vec3 pick(vec3 ramp[6], int index) {
    vec3 color = ramp[0];
    for (int i = 1; i < 6; i++) if (i == index) color = ramp[i];
    return color;
  }

  void main() {
    // The world pixel this screen pixel shows.
    vec2 pixel = floor(gl_FragCoord.xy / uScale);
    vec4 scene = texture2D(tScene, (pixel + 0.5) / uWorld);
    vec3 color = scene.rgb;
    if (color.r > 0.02 && color.g > 0.02) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }
    vec2 cell = mod(pixel, 8.0);
    float threshold = (bayer[int(cell.y) * 8 + int(cell.x)] + 0.5) / 64.0;
    bool litter = scene.a < ${(LITTER_ALPHA + GRASS_ALPHA) / 2};
    bool grass = !litter && scene.a < ${(GRASS_ALPHA + 1) / 2};
    bool foliage = !litter && !grass && color.g > color.r && color.g >= color.b;
    bool land = !litter && !grass && !foliage && color.r >= color.b;
    float level = clamp(litter || grass || foliage ? color.g : land ? color.r : color.b, 0.0, 0.999) * 5.0;
    int low = int(floor(level));
    int index = fract(level) > threshold ? low + 1 : low;
    vec3 painted = litter ? pick(litterRamp, index)
      : grass ? pick(grassRamp, index)
      : foliage ? pick(foliageRamp, index)
      : land ? pick(landRamp, index)
      : pick(seaRamp, index);
    gl_FragColor = vec4(painted, 1.0);
  }
`;

/**
 * Renders a scene into a low-resolution target, a pixel per world pixel, then
 * dithers it onto the canvas, which is at the screen's resolution: each world
 * pixel becomes a block of `scale` screen pixels, which gives the big pixels.
 * The target keeps its depth (`depth`), so things drawn over the world at
 * the screen's resolution (character.js) can still be hidden by it, a world
 * pixel at a time; `world` and `scale` are the uniforms they need for that.
 */
export function createDither(renderer) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthTexture: new THREE.DepthTexture(1, 1),
  });
  const world = { value: new THREE.Vector2(1, 1) };
  const scale = { value: 1 };
  const material = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: target.texture },
      landRamp: { value: LAND_RAMP.map((hex) => new THREE.Color(hex)) },
      foliageRamp: { value: FOLIAGE_RAMP.map((hex) => new THREE.Color(hex)) },
      grassRamp: { value: GRASS_RAMP.map((hex) => new THREE.Color(hex)) },
      litterRamp: { value: LITTER_RAMP.map((hex) => new THREE.Color(hex)) },
      seaRamp: { value: SEA_RAMP.map((hex) => new THREE.Color(hex)) },
      uWorld: world,
      uScale: scale,
    },
    vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  const postScene = new THREE.Scene();
  postScene.add(quad);
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    depth: target.depthTexture,
    world,
    scale,
    /** The world's size in world pixels, and screen pixels per world pixel. */
    setSize(width, height, pixelScale) {
      target.setSize(width, height);
      world.value.set(width, height);
      scale.value = pixelScale;
    },
    render(scene, camera) {
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    },
    dispose() {
      target.depthTexture.dispose();
      target.dispose();
      material.dispose();
      quad.geometry.dispose();
    },
  };
}
