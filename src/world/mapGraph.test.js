import { describe, expect, it } from "vitest";
import {
  directionBetween,
  distanceField,
  gridPath,
  hopLine,
  nearestOpen,
  neighborInDirection,
  parseLand,
  pathCells,
  pathDirection,
  pathLine,
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
  bends: { "b>d": [[8, 2]] },
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
  const steps = (cells) => cells.slice(1).map((cell, i) => Math.abs(cell[0] - cells[i][0]) + Math.abs(cell[1] - cells[i][1]));

  it("runs a path with no bends straight, cell by cell", () => {
    expect(pathCells(layout, ["a", "b"])).toEqual([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]);
  });

  it("curves through bends, in four-way steps", () => {
    const cells = pathCells(layout, ["b", "d"]);
    expect(cells[0]).toEqual([4, 2]);
    expect(cells.at(-1)).toEqual([8, 4]);
    expect(cells).toContainEqual([8, 2]);
    expect(steps(cells).every((step) => step === 1)).toBe(true);
    expect(new Set(cells.map(String)).size).toBe(cells.length);
  });

  it("crosses a diagonal in four-way steps", () => {
    const slant = { stages: { a: [0, 0], b: [3, 3] }, bends: {} };
    const cells = pathCells(slant, ["a", "b"]);
    expect(cells).toHaveLength(7);
    expect(steps(cells).every((step) => step === 1)).toBe(true);
  });

  it("spaces a line evenly, through its bends", () => {
    const line = pathLine(layout, ["b", "d"], "b", 0.5);
    expect(line[0]).toEqual([4, 2]);
    expect(line.at(-1)[0]).toBeCloseTo(8);
    expect(line.at(-1)[1]).toBeCloseTo(4);
    const gaps = line.slice(1).map((p, i) => Math.hypot(p[0] - line[i][0], p[1] - line[i][1]));
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.05);
    expect(Math.min(...line.map(([x, y]) => Math.hypot(x - 8, y - 2)))).toBeLessThan(0.3);
  });

  it("walks a hop's line from the stage you're leaving", () => {
    const line = hopLine(map, layout, "d", "b", 1);
    expect(line[0][0]).toBeCloseTo(8);
    expect(line[0][1]).toBeCloseTo(4);
    expect(line.at(-1)[0]).toBeCloseTo(4);
    expect(hopLine(map, layout, "a", "b", 1)).toEqual([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]);
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
