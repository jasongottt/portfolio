import { describe, expect, it } from "vitest";
import { polaroidLayout, printHeight } from "./polaroidLayout";

describe("polaroidLayout down the right edge", () => {
  // The About panel runs about 510 to 600px tall on desktop.
  for (const height of [480, 540, 640]) {
    it(`fills a ${height}px panel from top to bottom`, () => {
      const prints = polaroidLayout("right", { width: 660, height }, 3);
      const top = prints[0].top;
      const bottom = prints.at(-1).top + printHeight(prints.at(-1).width);
      expect(top).toBeCloseTo(16);
      expect(bottom).toBeCloseTo(height - 16);
      // Each overlaps the next a little, and pokes out past the edge.
      for (let i = 1; i < prints.length; i++) {
        expect(prints[i].top).toBeLessThan(prints[i - 1].top + printHeight(prints[i - 1].width));
      }
      for (const print of prints) {
        expect(print.left).toBeLessThan(660);
        expect(print.left + print.width).toBeGreaterThan(660 + 40);
      }
    });
  }

  it("grows with the panel, within limits", () => {
    const short = polaroidLayout("right", { width: 660, height: 400 }, 3)[0].width;
    const tall = polaroidLayout("right", { width: 660, height: 800 }, 3)[0].width;
    expect(tall).toBeGreaterThan(short);
    expect(polaroidLayout("right", { width: 660, height: 3000 }, 3)[0].width).toBe(170);
  });

  it("still spans a panel too tall for them to touch", () => {
    const prints = polaroidLayout("right", { width: 660, height: 1000 }, 3);
    expect(prints[0].top).toBeCloseTo(16);
    expect(prints.at(-1).top + printHeight(prints.at(-1).width)).toBeCloseTo(1000 - 16);
  });
});

describe("polaroidLayout across the bottom edge", () => {
  it("hangs them centered under the panel, tops tucked under its edge", () => {
    const prints = polaroidLayout("bottom", { width: 358, height: 900 }, 3);
    const left = prints[0].left;
    const right = prints.at(-1).left + prints.at(-1).width;
    expect((left + right) / 2).toBeCloseTo(179);
    for (const print of prints) {
      expect(print.top).toBeLessThan(900);
      expect(print.top + printHeight(print.width)).toBeGreaterThan(900 + 70);
    }
  });

  it("scales with the panel's width", () => {
    const narrow = polaroidLayout("bottom", { width: 340, height: 900 }, 3)[0].width;
    const wide = polaroidLayout("bottom", { width: 700, height: 900 }, 3)[0].width;
    expect(wide).toBeGreaterThan(narrow);
  });
});
