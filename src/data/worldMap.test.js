import { describe, expect, it } from "vitest";
import {
  parseLand,
  pathCells,
  pathDirection,
  pathKey,
  pathsAt,
  route,
} from "../world/mapGraph";
import { SPRITES } from "../world/pixelArt";
import { projects } from "./projects";
import { worldMap } from "./worldMap";

// The ids the page sections render with (sections/*.jsx).
const SECTION_IDS = ["about", "experience", "projects", "contact"];
const LONGEST_BRIDGE = 10;

const stageIds = worldMap.stages.map((stage) => stage.id);
const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1];

describe("stages", () => {
  it("have unique ids", () => {
    expect(new Set(stageIds).size).toBe(stageIds.length);
  });

  it("each have a level and a landmark that exists", () => {
    for (const stage of worldMap.stages) {
      expect(stage.level, stage.id).toBeTruthy();
      expect(Object.keys(SPRITES), stage.id).toContain(stage.icon);
    }
  });

  it("start on a stage that exists", () => {
    expect(stageIds).toContain(worldMap.start);
  });

  it("point section stages at real sections", () => {
    for (const stage of worldMap.stages.filter((s) => s.action.type === "section")) {
      expect(SECTION_IDS, stage.id).toContain(stage.action.target);
    }
  });

  it("point game stages at real, playable projects", () => {
    for (const stage of worldMap.stages.filter((s) => s.action.type === "project")) {
      const project = projects.find((p) => p.title === stage.action.title);
      expect(project, stage.id).toBeDefined();
      expect(project.playableEmbed, stage.id).toBeDefined();
    }
  });

  it("can all be reached from the start", () => {
    for (const id of stageIds) {
      expect(route(worldMap, worldMap.start, id), id).not.toBeNull();
    }
  });
});

describe("paths", () => {
  it("connect stages that exist", () => {
    for (const [from, to] of worldMap.paths) {
      expect(stageIds).toContain(from);
      expect(stageIds).toContain(to);
    }
  });
});

describe.each(Object.entries(worldMap.layouts))("%s layout", (name, layout) => {
  const land = parseLand(layout.land);
  const pathKeys = worldMap.paths.map(pathKey);

  it("draws a land grid the declared size", () => {
    const [cols, rows] = layout.size;
    expect(land.rows).toBe(rows);
    for (const line of land.lines) expect(line).toHaveLength(cols);
  });

  it("places every stage, and only real stages", () => {
    expect(Object.keys(layout.stages).sort()).toEqual([...stageIds].sort());
  });

  it("puts every stage on land", () => {
    for (const [id, [col, row]] of Object.entries(layout.stages)) {
      expect(land.isLand(col, row), `${id} at [${col}, ${row}]`).toBe(true);
    }
  });

  it("only has corners for paths that exist", () => {
    for (const key of Object.keys(layout.corners)) expect(pathKeys).toContain(key);
  });

  it("draws every path in straight lines, with short bridges", () => {
    for (const path of worldMap.paths) {
      const cells = pathCells(layout, path);
      let water = 0;
      for (const [col, row] of cells) {
        water = land.isLand(col, row) ? 0 : water + 1;
        expect(water, `${pathKey(path)} crosses too much water`).toBeLessThanOrEqual(LONGEST_BRIDGE);
      }
    }
  });

  it("only lets paths meet at stages", () => {
    const stageCells = Object.values(layout.stages);
    const seen = new Map();
    for (const path of worldMap.paths) {
      for (const cell of pathCells(layout, path).slice(1, -1)) {
        expect(stageCells.some((s) => sameCell(s, cell)), `${pathKey(path)} runs through a stage`).toBe(false);
        const key = cell.join(",");
        expect(seen.get(key), `${pathKey(path)} overlaps ${seen.get(key)} at [${key}]`).toBeUndefined();
        seen.set(key, pathKey(path));
      }
    }
  });

  it("never sends two paths out of a stage the same way", () => {
    for (const id of stageIds) {
      const directions = pathsAt(worldMap, id).map((path) => pathDirection(layout, path, id));
      expect(directions, id).not.toContain(null);
      expect(new Set(directions).size, `${id} leaves ${directions.join(", ")}`).toBe(directions.length);
    }
  });
});
