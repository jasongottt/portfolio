import * as THREE from "three";
import { landCode, seaCode } from "./dither";
import { MINT } from "./dusk";
import { HERO } from "./pixelArt";

// Skin and shirt are accents, so they keep their real colors; the rest are
// code colors the dither pass paints from the palette. Built on demand, once
// runWorld.js has turned color management off, so the hex colors aren't
// converted on the way in.
const spriteColors = () => ({
  h: landCode(0.3),
  s: new THREE.Color("#f1c9a5"),
  t: new THREE.Color(MINT),
  p: seaCode(0.42),
  o: seaCode(0.03),
});

const HEIGHT = 2.5;
const WIDTH = (HEIGHT * HERO.stand[0].length) / HERO.stand.length;
// Seconds per step of the two-frame walk.
const STEP_SECONDS = 0.14;

function frameTexture(rows, colors) {
  const canvas = document.createElement("canvas");
  canvas.width = rows[0].length;
  canvas.height = rows.length;
  const context = canvas.getContext("2d");
  rows.forEach((row, y) =>
    [...row].forEach((key, x) => {
      if (key === ".") return;
      context.fillStyle = `#${colors[key].getHexString()}`;
      context.fillRect(x, y, 1, 1);
    })
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/**
 * Jason, as the 5x9 sprite from pixelArt.js on a camera-facing billboard, with a small
 * shadow on the ground. Unlit and unfogged, so it reads at any distance.
 */
export function createCharacter() {
  const colors = spriteColors();
  const frames = { stand: frameTexture(HERO.stand, colors), step: frameTexture(HERO.step, colors) };
  const material = new THREE.SpriteMaterial({ map: frames.stand, fog: false, alphaTest: 0.5 });
  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.scale.set(WIDTH, HEIGHT, 1);

  const shadowMaterial = new THREE.MeshBasicMaterial({ color: landCode(0.08), fog: false });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 10).rotateX(-Math.PI / 2), shadowMaterial);

  const object = new THREE.Group();
  object.add(shadow, sprite);
  let stepClock = 0;

  return {
    object,
    /** Stands the character at `point`, walking or not, facing left (-1) or right (1). */
    update(point, { walking, facing, delta }) {
      object.position.set(...point);
      shadow.position.y = 0.04;
      stepClock = walking ? stepClock + delta : 0;
      material.map = walking && Math.floor(stepClock / STEP_SECONDS) % 2 ? frames.step : frames.stand;
      sprite.scale.x = WIDTH * facing;
    },
    dispose() {
      frames.stand.dispose();
      frames.step.dispose();
      material.dispose();
      shadowMaterial.dispose();
      shadow.geometry.dispose();
    },
  };
}
