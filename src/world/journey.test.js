import { describe, expect, it } from "vitest";
import { FRAME_Y, blendPoses, followPose, journeyAt, overviewPose } from "./journey";

// A page like the site's: a first screen, four sections with gaps between
// them, and a last screen after Contact.
const VIEWPORT = 1000;
const SECTIONS = [
  { top: 1060, bottom: 1800 },
  { top: 2200, bottom: 3400 },
  { top: 3800, bottom: 4600 },
  { top: 5000, bottom: 5500 },
];
const PAGE = 6600;
const MAX_SCROLL = PAGE - VIEWPORT;
const FRAME = VIEWPORT * FRAME_Y;
const at = (scrollY) => journeyAt(scrollY, VIEWPORT, SECTIONS, PAGE);
// The scroll position that puts a page y at the character's spot on screen.
const scrollTo = (pageY) => pageY - FRAME;

describe("journeyAt", () => {
  it("is the overview at the top and at the bottom", () => {
    expect(at(0).overview).toBe(1);
    expect(at(MAX_SCROLL).overview).toBe(1);
    expect(at(MAX_SCROLL - 0.5).overview).toBe(1);
  });

  it("starts at home and ends at the last stop", () => {
    expect(at(0)).toMatchObject({ leg: 0, t: 0 });
    expect(at(MAX_SCROLL)).toMatchObject({ leg: 2, t: 1 });
  });

  it("leaves the overview by the time the first section arrives", () => {
    expect(at(scrollTo(SECTIONS[0].top) / 2).overview).toBeCloseTo(0.5, 1);
    expect(at(scrollTo(SECTIONS[0].top)).overview).toBe(0);
    expect(at(scrollTo(SECTIONS[2].top)).overview).toBe(0);
  });

  it("walks each leg while the gap between sections passes", () => {
    for (let leg = 0; leg < 3; leg++) {
      const gapStart = SECTIONS[leg].bottom;
      const gapEnd = SECTIONS[leg + 1].top;
      expect(at(scrollTo(gapStart) - 50), `before leg ${leg}`).toMatchObject({ t: leg === 0 ? 0 : 1 });
      expect(at(scrollTo(gapStart))).toMatchObject({ leg, t: 0 });
      expect(at(scrollTo((gapStart + gapEnd) / 2))).toMatchObject({ leg, t: 0.5 });
      // Arrived as the next section reaches the character, and stays.
      expect(at(scrollTo(gapEnd) - 1).t).toBeGreaterThan(0.99);
      expect(at(scrollTo(gapEnd)).t).toBe(1);
      expect(at(scrollTo(gapEnd + 300)).t).toBe(1);
    }
  });

  it("stretches a walk over a scroll span when the world is always in view", () => {
    const span = 500;
    const desk = (scrollY) => journeyAt(scrollY, VIEWPORT, SECTIONS, PAGE, span);
    const arrive = SECTIONS[2].top;
    // Still standing at the last stop until the span begins.
    expect(desk(scrollTo(arrive - span - 1))).toMatchObject({ leg: 0, t: 1 });
    expect(desk(scrollTo(arrive - span))).toMatchObject({ leg: 1, t: 0 });
    expect(desk(scrollTo(arrive - span / 2))).toMatchObject({ leg: 1, t: 0.5 });
    expect(desk(scrollTo(arrive))).toMatchObject({ leg: 1, t: 1 });
    // Never starts before the section it's leaving.
    expect(journeyAt(scrollTo(SECTIONS[0].top), VIEWPORT, SECTIONS, PAGE, 5000)).toMatchObject({ leg: 0, t: 0 });
  });

  it("walks back when you scroll back up", () => {
    const down = at(scrollTo(2000));
    at(scrollTo(4000));
    expect(at(scrollTo(2000))).toEqual(down);
  });

  it("pulls back out only after the last section", () => {
    expect(at(scrollTo(SECTIONS[3].bottom)).overview).toBe(0);
    const halfway = (scrollTo(SECTIONS[3].bottom) + MAX_SCROLL) / 2;
    expect(at(halfway).overview).toBeGreaterThan(0.3);
    expect(at(halfway).overview).toBeLessThan(0.7);
  });
});

describe("poses", () => {
  const bounds = { minX: -50, maxX: 50, minZ: -15, maxZ: 15 };

  it("frames the whole word from above", () => {
    const { position, target } = overviewPose(bounds, 1.6, 40);
    expect(target).toEqual([0, 0, 0]);
    expect(position[1]).toBeGreaterThan(60);
    // Mostly overhead: well above, only a little in front.
    expect(position[2]).toBeLessThan(position[1] / 2);
  });

  it("stands further back on narrower screens", () => {
    const wide = overviewPose(bounds, 1.6, 40).position[1];
    const narrow = overviewPose(bounds, 0.5, 40).position[1];
    expect(narrow).toBeGreaterThan(wide);
  });

  it("follows from behind and above, looking at the character", () => {
    const { position, target } = followPose([10, 1, 5], 1.6);
    expect(position[1]).toBeGreaterThan(1);
    expect(position[2]).toBeGreaterThan(5);
    expect(target[0]).toBe(10);
    expect(target[2]).toBe(5);
  });

  it("blends between two poses", () => {
    const a = { position: [0, 0, 0], target: [0, 0, 0] };
    const b = { position: [10, 20, 30], target: [2, 4, 6] };
    expect(blendPoses(a, b, 0.5)).toEqual({ position: [5, 10, 15], target: [1, 2, 3] });
    expect(blendPoses(a, b, 0)).toEqual(a);
  });
});
