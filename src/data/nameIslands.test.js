import { describe, expect, it } from "vitest";
import { parseLand } from "../world/mapGraph";
import { NAME_LAYOUTS, buildLand, strokeSamples } from "./nameIslands";

// Labels each land cell with the island it belongs to.
function islands(land) {
  const ids = Array.from({ length: land.rows }, () => new Array(land.cols).fill(-1));
  let count = 0;
  for (let row = 0; row < land.rows; row++) {
    for (let col = 0; col < land.cols; col++) {
      if (!land.isLand(col, row) || ids[row][col] >= 0) continue;
      const stack = [[col, row]];
      ids[row][col] = count;
      while (stack.length) {
        const [c, r] = stack.pop();
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const [nc, nr] = [c + dc, r + dr];
          if (land.isLand(nc, nr) && ids[nr][nc] < 0) {
            ids[nr][nc] = count;
            stack.push([nc, nr]);
          }
        }
      }
      count += 1;
    }
  }
  return (col, row) => ids[row][col];
}

describe.each(Object.entries(NAME_LAYOUTS))("%s name layout", (name, layout) => {
  const land = parseLand(buildLand(layout));

  it("builds the same land every time", () => {
    expect(buildLand(layout)).toBe(buildLand(layout));
  });

  it("is the declared size", () => {
    expect([land.cols, land.rows]).toEqual(layout.size);
  });

  it("turns every stroke into land", () => {
    for (const [glyph, col, row] of strokeSamples(layout)) {
      expect(land.isLand(col, row), `${glyph} at [${col}, ${row}]`).toBe(true);
    }
    expect(land.isLand(...layout.dot), "the full stop").toBe(true);
  });

  it("keeps each letter its own island, so the word reads", () => {
    const islandAt = islands(land);
    const letterOf = new Map();
    for (const [glyph, col, row] of strokeSamples(layout)) {
      const island = islandAt(col, row);
      expect(letterOf.get(island) ?? glyph, `${glyph} touches ${letterOf.get(island)}`).toBe(glyph);
      letterOf.set(island, glyph);
    }
    expect(letterOf.has(islandAt(...layout.dot)), "the full stop touches a letter").toBe(false);
  });

  it("leaves open sea around the edges", () => {
    for (let col = 0; col < land.cols; col++) {
      expect(land.isLand(col, 0)).toBe(false);
      expect(land.isLand(col, land.rows - 1)).toBe(false);
    }
    for (let row = 0; row < land.rows; row++) {
      expect(land.isLand(0, row)).toBe(false);
      expect(land.isLand(land.cols - 1, row)).toBe(false);
    }
  });
});
