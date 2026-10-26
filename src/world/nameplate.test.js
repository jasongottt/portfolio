import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { worldMap } from "../data/worldMap";
import { FOV, FRAME_Y, overviewPose } from "./journey";
import { landBounds, layoutFor, nameplate, projectPoint } from "./nameplate";

describe("projectPoint", () => {
  it("matches three.js's projection with the world's view offset", () => {
    const [width, height] = [1440, 900];
    const pose = overviewPose(landBounds(worldMap.layouts.wide), width / height, FOV);
    const camera = new PerspectiveCamera(FOV, width / height, 0.1, 1000);
    camera.setViewOffset(width, height, 0, (0.5 - FRAME_Y) * height, width, height);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.target);
    camera.updateMatrixWorld();
    for (const point of [[0, 0, 0], [-40, 0, 10], [30, 1, -8]]) {
      const ndc = new Vector3(...point).project(camera);
      const [x, y] = projectPoint(pose, width, height, point);
      expect(x).toBeCloseTo(((ndc.x + 1) / 2) * width, 3);
      expect(y).toBeCloseTo(((1 - ndc.y) / 2) * height, 3);
    }
  });
});

describe("nameplate", () => {
  // Every point a letter's paths pass through.
  const points = (letter) =>
    letter.paths.flatMap((d) => [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]));

  it("draws JASON. left to right across a wide screen, on screen", () => {
    const letters = nameplate(1440, 900);
    expect(letters.map((l) => l.char).join("")).toBe("JASON.");
    for (let i = 1; i < letters.length; i++) expect(letters[i].x).toBeGreaterThan(letters[i - 1].x);
    for (const letter of letters) {
      expect(letter.paths.length, letter.char).toBeGreaterThan(0);
      expect(letter.strokeWidth, letter.char).toBeGreaterThan(20);
      for (const [x, y] of points(letter)) {
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(1440);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(900);
      }
    }
    // The word centers on FRAME_Y, as the world frames it.
    expect(Math.abs(letters[2].y - 900 * FRAME_Y)).toBeLessThan(40);
  });

  it("stacks JA over SON. on a phone", () => {
    const letters = nameplate(390, 844);
    expect(layoutFor(390, 844)).toBe("tall");
    const [j, a, s] = letters;
    expect(Math.abs(j.y - a.y)).toBeLessThan(1);
    expect(s.y).toBeGreaterThan(j.y + 100);
    for (const letter of letters) for (const [x] of points(letter)) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(390);
    }
  });
});
