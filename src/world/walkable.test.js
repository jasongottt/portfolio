import { describe, expect, it } from "vitest";
import { worldMap } from "../data/worldMap";
import { groundAim } from "./journey";
import { gridPath, parseLand, pathCells } from "./mapGraph";
import { beachHeading, campfireSeat, landmarkCell, secretCell, walkableGrid } from "./walkable";

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

  it("puts the campfire on land, off the paths, with a seat you can walk to", () => {
    const fire = layout.campfire;
    expect(land.isLand(...fire)).toBe(true);
    expect(grid.isOpen(...fire), "the fire itself is in the way").toBe(false);
    const nearest = Math.min(
      ...worldMap.paths.flatMap((path) => pathCells(layout, path)).map(([c, r]) => Math.max(Math.abs(c - fire[0]), Math.abs(r - fire[1])))
    );
    expect(nearest, "cells to the nearest path").toBeGreaterThanOrEqual(3);
    for (const cell of Object.values(layout.stages)) {
      const landmark = landmarkCell(land, cell);
      expect(Math.max(Math.abs(landmark[0] - fire[0]), Math.abs(landmark[1] - fire[1]))).toBeGreaterThanOrEqual(3);
    }
    const seat = campfireSeat(fire).map(Math.round);
    expect(gridPath(grid.isOpen, start, seat)).not.toBeNull();
  });

  it("skips stones from beaches, out over open water", () => {
    const bridges = new Set(worldMap.paths.flatMap((path) => pathCells(layout, path)).map((cell) => cell.join(",")));
    const solid = (col, row) => land.isLand(col, row) || bridges.has(`${col},${row}`);
    let beaches = 0;
    for (let row = 0; row < land.rows; row++) {
      for (let col = 0; col < land.cols; col++) {
        const heading = beachHeading(land, solid, [col, row], groundAim.forward);
        if (!heading) continue;
        beaches += 1;
        // Water all the way out, clear of land and bridges.
        for (let reach = 1; reach <= 6; reach += 0.5) {
          expect(solid(Math.round(col + heading[0] * reach), Math.round(row + heading[1] * reach)), `[${col}, ${row}]`).toBe(false);
        }
      }
    }
    expect(beaches, "beaches to skip from").toBeGreaterThan(50);
    // Inland, and out on the water, there's nothing to skip from.
    expect(beachHeading(land, solid, start, groundAim.forward)).toBeNull();
    expect(beachHeading(land, solid, [0, 0], groundAim.forward)).toBeNull();
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
