import { describe, expect, it } from "vitest";
import { worldMap } from "../data/worldMap";
import { gridPath, parseLand, pathCells } from "./mapGraph";
import { landmarkCell, secretCell, walkableGrid } from "./walkable";

describe.each(Object.entries(worldMap.layouts))("%s layout, exploring", (name, layout) => {
  const land = parseLand(layout.land);
  const grid = walkableGrid(worldMap, layout);
  const start = layout.stages[worldMap.start];

  it("can walk to every stage from the start", () => {
    for (const [id, cell] of Object.entries(layout.stages)) {
      expect(gridPath(grid.isOpen, start, cell), id).not.toBeNull();
    }
  });

  it("can walk every path, bridges included", () => {
    for (const path of worldMap.paths) {
      for (const cell of pathCells(layout, path)) expect(grid.isOpen(...cell), `${path} at ${cell}`).toBe(true);
    }
  });

  it("can't walk through landmarks", () => {
    for (const [id, cell] of Object.entries(layout.stages)) {
      expect(grid.isOpen(...landmarkCell(land, cell)), id).toBe(false);
    }
  });

  it("stops at the water and the edge of the map", () => {
    expect(grid.isOpen(0, 0)).toBe(false);
    expect(grid.isOpen(-1, 5)).toBe(false);
    expect(grid.isOpen(grid.cols, 5)).toBe(false);
  });

  it("hides the secret on land you can walk to, away from its stage", () => {
    const cell = secretCell(worldMap, layout);
    const stage = layout.stages[worldMap.secret.island];
    expect(land.isLand(...cell)).toBe(true);
    expect(gridPath(grid.isOpen, start, cell)).not.toBeNull();
    expect(Math.hypot(cell[0] - stage[0], cell[1] - stage[1])).toBeGreaterThan(3);
  });
});

describe("secret", () => {
  it("washes up on a stage that exists, and leads somewhere real", () => {
    expect(worldMap.stages.map((stage) => stage.id)).toContain(worldMap.secret.island);
    expect(["about", "experience", "projects", "contact"]).toContain(worldMap.secret.action.target);
  });
});
