import { describe, expect, it } from "vitest";
import {
  directionBetween,
  distanceField,
  gridPath,
  hopCells,
  nearestOpen,
  neighborInDirection,
  parseLand,
  pathCells,
  pathDirection,
  route,
} from "./mapGraph";

//   c
//   |
// a-b---+
//       |
//       d       e (not connected)
const map = {
  paths: [
    ["a", "b"],
    ["b", "c"],
    ["b", "d"],
  ],
};
const layout = {
  stages: { a: [0, 2], b: [4, 2], c: [4, 0], d: [8, 4], e: [0, 6] },
  corners: { "b>d": [[8, 2]] },
};

describe("parseLand", () => {
  it("reads '#' as land and trims indentation", () => {
    const land = parseLand(`
      ..#
      ###
    `);
    expect(land.cols).toBe(3);
    expect(land.rows).toBe(2);
    expect(land.isLand(2, 0)).toBe(true);
    expect(land.isLand(0, 0)).toBe(false);
    expect(land.isLand(0, 1)).toBe(true);
    expect(land.isLand(5, 5)).toBe(false);
  });
});

describe("distanceField", () => {
  it("counts steps to the nearest outside cell", () => {
    const land = parseLand(`
      .....
      .###.
      .###.
      .###.
      .....
    `);
    const steps = distanceField(land.isLand, land.cols, land.rows);
    expect(steps(0, 0)).toBe(0);
    expect(steps(1, 1)).toBe(1);
    expect(steps(2, 2)).toBe(2);
    expect(steps(3, 2)).toBe(1);
  });
});

describe("directions", () => {
  it("names straight steps and rejects diagonal ones", () => {
    expect(directionBetween([4, 2], [4, 0])).toBe("up");
    expect(directionBetween([4, 2], [4, 9])).toBe("down");
    expect(directionBetween([4, 2], [1, 2])).toBe("left");
    expect(directionBetween([4, 2], [8, 2])).toBe("right");
    expect(directionBetween([4, 2], [5, 3])).toBeNull();
    expect(directionBetween([4, 2], [4, 2])).toBeNull();
  });

  it("measures a path's direction from whichever end you leave", () => {
    expect(pathDirection(layout, ["a", "b"], "a")).toBe("right");
    expect(pathDirection(layout, ["a", "b"], "b")).toBe("left");
    // The corner decides: b leaves right, d leaves up.
    expect(pathDirection(layout, ["b", "d"], "b")).toBe("right");
    expect(pathDirection(layout, ["b", "d"], "d")).toBe("up");
  });
});

describe("neighborInDirection", () => {
  it("follows the path that leaves in the pressed direction", () => {
    expect(neighborInDirection(map, layout, "b", "left")).toBe("a");
    expect(neighborInDirection(map, layout, "b", "up")).toBe("c");
    expect(neighborInDirection(map, layout, "b", "right")).toBe("d");
    expect(neighborInDirection(map, layout, "d", "up")).toBe("b");
  });

  it("returns null when nothing goes that way", () => {
    expect(neighborInDirection(map, layout, "b", "down")).toBeNull();
    expect(neighborInDirection(map, layout, "e", "up")).toBeNull();
  });
});

describe("route", () => {
  it("passes through the stages in between", () => {
    expect(route(map, "a", "d")).toEqual(["a", "b", "d"]);
    expect(route(map, "c", "a")).toEqual(["c", "b", "a"]);
  });

  it("is just the stage when you're already there", () => {
    expect(route(map, "a", "a")).toEqual(["a"]);
  });

  it("is null between stages that aren't connected", () => {
    expect(route(map, "a", "e")).toBeNull();
  });
});

describe("geometry", () => {
  it("lists every cell a path crosses, corners included", () => {
    expect(pathCells(layout, ["b", "d"])).toEqual([
      [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4],
    ]);
  });

  it("refuses diagonal segments", () => {
    const bent = { stages: { a: [0, 0], b: [3, 3] }, corners: {} };
    expect(() => pathCells(bent, ["a", "b"])).toThrow(/diagonal/);
  });

  it("walks a hop's cells from the stage you're leaving", () => {
    expect(hopCells(map, layout, "d", "b")).toEqual([
      [8, 4], [8, 3], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2],
    ]);
    expect(hopCells(map, layout, "a", "b")).toEqual([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]);
  });
});

describe("gridPath", () => {
  const land = parseLand(`
    #####
    ....#
    ###.#
    #...#
    #####
  `);

  it("finds the shortest way through open cells", () => {
    const path = gridPath(land.isLand, [0, 0], [0, 2]);
    expect(path[0]).toEqual([0, 0]);
    expect(path.at(-1)).toEqual([0, 2]);
    // Around the right side and back along the bottom: 14 steps.
    expect(path).toHaveLength(15);
    for (const [col, row] of path) expect(land.isLand(col, row)).toBe(true);
  });

  it("is just the cell when you're already there", () => {
    expect(gridPath(land.isLand, [2, 2], [2, 2])).toEqual([[2, 2]]);
  });

  it("is null when either end is closed", () => {
    expect(gridPath(land.isLand, [0, 1], [0, 0])).toBeNull();
    expect(gridPath(land.isLand, [0, 0], [3, 2])).toBeNull();
  });
});

describe("nearestOpen", () => {
  const land = parseLand(`
    #....
    .....
    ....#
  `);

  it("returns the cell itself when it's open", () => {
    expect(nearestOpen(land.isLand, land.cols, land.rows, [0, 0])).toEqual([0, 0]);
  });

  it("finds the closest open cell", () => {
    expect(nearestOpen(land.isLand, land.cols, land.rows, [3, 2])).toEqual([4, 2]);
    expect(nearestOpen(land.isLand, land.cols, land.rows, [1, 1])).toEqual([0, 0]);
  });
});
